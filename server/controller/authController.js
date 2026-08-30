
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js';
import userModel from '../models/userModel.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req, res) => {
  const {name, email, password} = req.body;

  if(!name || !email || !password) {
    return res.json({success: false, message: 'Missing Details'})
  }

  try {
    const existingUser = await userModel.findOne({email})
    if (existingUser) {
      return res.json({success: false, message: 'User already exists'})
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new userModel({name, email, password: hashPassword});
    await user.save();

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Torwai's website",
      text: `Welcome to torwai website. Your account has been created with email id: ${email}`,
    }
    await transporter.sendMail(mailOptions);

    return res.json({success: true})

  } catch (err) {
    res.json({success: false, message: err.message})
  }
}

export const login = async (req, res) => {
  const {email, password} = req.body;

  if(!email || !password) {
    return res.json({success: false, message: 'Email and password are required'})
  }

  try {
    const user = await userModel.findOne({email});
    if (!user) {
      return res.json({success: false, message: 'Invalid email'})
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({success: false, message: 'Invalid password'})
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'})
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 24 * 60 * 60 * 1000
    })

    return res.json({success: true})

  } catch (err) {
    res.json({success: false, message: err.message})
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NDOE_ENV === 'production',
      sameSite: process.env.NDOE_ENV === 'production' ? 'none' : 'strict',
    })

    return res.json({success: true, message: 'Logged Out'})
  } catch (err) {
    res.json({success: false, message: err.message})
  }
}

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (user.isAccountVerified) {
      return res.json({success: false, message: 'Account Already verified'})
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    user.verifyOtp = otp;
    user.verifyOtpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace( "{{email}}", user.email )
    }

    await transporter.sendMail(mailOption)

    res.json({success: true, message: 'Verification OTP sent on Email.'})

  } catch (err) {
    res.json({success: false, message: err.message})
    console.log(err.message)
  }
}

export const verifyEmail = async (req, res) => {
  const {otp} = req.body;
  const userId = req.userId;
  if (!userId || !otp) {
    return res.json({success: false, message: 'Missing details'});
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({success: false, message: 'User not found'});

    } else if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.json({success: false, message: 'Invalid OTP'});

    } else if (user.verifyOtpExpire < Date.now()) {
      return res.json({success: false, message: 'OTP Expired'});
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpExpire = 0;

    await user.save();
    return res.json({success: true, message: 'Email verified successfully'})
  
  } catch (err) {
    res.json({success: false, message: `เกิดข้อผิดพลาด ${err.message}`})
  }
}

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true});
  } catch (err) {
    res.json({success: false, message: `เกิดข้อผิดพลาด ${err.message}`})
  }
}

export const sendResetOtp = async (req, res) => {
  const {email} = req.body;
  if (!email) {
    return res.json({success: false, message: 'Email is required'})
  }

  try {
    const user = await userModel.findOne({email});
    if (!user) {
      return res.json({success: false, message: 'User is not found'})
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password reset OTP",
      // text: `Your OTP for resetting your passsword is ${otp}. Use thid OTP to proceed with resetting your password.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace( "{{email}}", user.email )
    }
    await transporter.sendMail(mailOption);

    return res.json({success: true, message: 'OTP sent to your email'})
    
  } catch (err) {
    res.json({success: false, message: `เกิดข้อผิดพลาด ${err.message}`})
  }
}

export const resetPassword = async (req, res) => {
  const {email, otp, newPassword} = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({success: false, message: 'Email, OTP, and new password are required'});
  }
  
  try {
    const user = await userModel.findOne({email});
    if(!user) {
      return res.json({success: false, message: 'User is not found'});

    } else if (user.resetOtp === '' || user.resetOtp !== otp) {
      return res.json({success: false, message: 'Invalid OTP'});

    } else if (user.resetOtpExpire < Date.now()) {
      return res.json({success: false, message: 'OTP Expired'});
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    user.resetOtp = '';
    user.resetOtpExpire = 0;
    await user.save();

    return res.json({success: true, message: 'Password has been reset successfully'})
    
  } catch (err) {
    res.json({success: false, message: `เกิดข้อผิดพลาด ${err.message}`});
  }
}