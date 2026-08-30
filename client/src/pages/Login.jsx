import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {

  const navigate = useNavigate()

  const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContent);

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;

      if(state === 'Sign Up') {
        const {data} = await axios.post(backendUrl + '/api/auth/register', {name, email, password})
        if (data.success) {
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        } else {
          toast.error(data.message)
          console.log(data.message)
        }

      }else {
        const {data} = await axios.post(backendUrl + '/api/auth/login', {email, password})
        if (data.success) {
          setIsLoggedin(true)
          getUserData()
          navigate('/')
        } else {
          toast.error(data.message)
          console.log(data.message, 'ตรงนี้')
        }
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' onClick={()=> navigate('/')} src={assets.logo} />
      <div className='bg-slate-900 p-10 rounded-lg chadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign Up' ? 'Create account' : 'Login'}</h2>
        <p className='text-center text-sm mb-6'>{state === 'Sign Up' ? 'Create your account' : 'Login to your account!'}</p>

        <form onSubmit={onSubmitHandler} >
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <img src={assets.person_icon} />
              <input onChange={e => setName(e.target.value)} value={name} className='outline-none text-gray-50 bg-transparent' type="text" placeholder='Full Name' required />
            </div>
          )}
          
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} />
            <input className='outline-none text-gray-50 bg-transparent' type="email" placeholder='Email' required onChange={e => setEmail(e.target.value)} value={email} />
          </div>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} />
            <input className='outline-none text-gray-50 bg-transparent' type="password" placeholder='Password' required onChange={e => setPassword(e.target.value)} value={password} />
          </div>

          <p className='w-fit mb-4 text-indigo-500 cursor-pointer' onClick={()=> navigate('/reset-password')}>Forgot Password</p>
          <button className='rounded-full w-full py-2.5 bg-gradient-to-r from-indigo-500 ro-indigo-900 text-white font-medium cursor-pointer'>{state}</button>
        </form>

        {state === 'Sign Up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an account?
            <span onClick={()=> setState('Login')} className='text-blue-400 cursor-pointer underline'> Login here</span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don't have an account?
            <span onClick={()=> setState('Sign Up')} className='text-blue-400 cursor-pointer underline'> Sign Up</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default Login