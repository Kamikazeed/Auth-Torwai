import React, { useState, useContext } from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {

  axios.defaults.withCredentials = true;
  const {backendUrl} = useContext(AppContent)

  const navigate = useNavigate() 
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState('')
  const [otp, setOtp] = useState(0)
  const [isOtpSubmited, setIsOtpSubmited] = useState(false)
  const inputRefs = React.useRef([])
  
  const handleInput = (e, index) => {
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) => {
    if(e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    })
  }

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const {data} = await axios.post(backendUrl + '/api/auth/send-reset-otp', {email})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && setIsEmailSent(true)
      
    } catch (err) {
      toast.error(err.message)
    }
  }

  const onSubmitOTP = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map(e => e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmited(true)
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      console.log(e.value)
      const {data} = await axios.post(backendUrl + '/api/auth/reset-password', {email, otp, newPassword})
      data.success ? toast.success(data.message) : toast.error(data.message)
      data.success && navigate('/')
      
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' onClick={()=> navigate('/')} src={assets.logo} />
      
      {/* Enter email */}
      {!isEmailSent && 
      <form className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm' onSubmit={onSubmitEmail } >
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>

        <div className='flex mb-4 items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] '>
          <img className='w-3 h-3' src={assets.mail_icon} />
          <input className='bg-transparent outline-none text-gray-50' type="email" placeholder='Email Id' value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <button className='w-full mt-3 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full text-white cursor-pointer'>Submit</button>
      </form>
      }
      
      {/* Enter OTP */}
      {!isOtpSubmited && isEmailSent &&
      <form className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm' onSubmit={onSubmitOTP}>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password OTP</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email id.</p>

        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md ' type="text" maxLength='1' key={index} required ref={e => inputRefs.current[index] = e} onInput={(e) => handleInput(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} />
          ))}
        </div>

        <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full text-white cursor-pointer '>Submit</button>
      </form>
      }

      {/* Enter new password */}
      {isOtpSubmited && isEmailSent &&
      <form className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm' onSubmit={onSubmitNewPassword}>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>New password</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the new password below</p>

        <div className='flex mb-4 items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] '>
          <img className='w-3 h-3' src={assets.lock_icon} />
          <input className='bg-transparent outline-none text-gray-50' type="password" placeholder='Password' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>

        <button className='w-full mt-3 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 rounded-full text-white cursor-pointer'>Submit</button>
      </form>
      }
    </div>
  )
}

export default ResetPassword