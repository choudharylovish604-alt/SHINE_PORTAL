import API_BASE_URL from '../config';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, formData);
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.user.role);
        localStorage.setItem('userId', res.data.user.id);
        localStorage.setItem('userName', res.data.user.name);
        if (res.data.user.studentId) localStorage.setItem('studentId', res.data.user.studentId);
        
        if (res.data.user.role === 'student') navigate('/student');
        else navigate('/mentor');
      } else {
        setIsLogin(true);
        setError('Registration successful. Please login.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-slate-100 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <img src="/shine_logo.png" alt="Shine Logo" className="h-20 w-20 object-contain mb-4" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SHINE</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Student Retention & Success Portal</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-xs text-slate-500 mt-1">{isLogin ? 'Enter your credentials to access the system' : 'Fill in the details below to join the platform'}</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl mb-6 text-xs font-bold border border-rose-100 animate-pulse">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <input type="text" name="name" className="input-field" placeholder="John Doe" onChange={handleChange} required />
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Work Email</label>
            <input type="email" name="email" className="input-field" placeholder="name@university.edu" onChange={handleChange} required />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Access Password</label>
            <input type="password" name="password" className="input-field" placeholder="••••••••" onChange={handleChange} required />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">System Role</label>
              <select name="role" className="input-field cursor-pointer" onChange={handleChange} value={formData.role}>
                <option value="student">Student Account</option>
                <option value="mentor">Faculty / Mentor</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-4 py-4 text-sm font-bold tracking-tight">
            {isLogin ? 'Sign In to Portal' : 'Register Account'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-bold hover:underline">
              {isLogin ? 'Join the community' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">© 2024 Shine Educational Systems</p>
      </div>
    </div>
  );
};

export default Login;
