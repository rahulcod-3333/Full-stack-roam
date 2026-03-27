import React, { useState } from 'react';
import { X } from 'lucide-react';
import API from '../api';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/AuthSlice';
// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// const API = `${BACKEND_URL}/api`;

export default function AuthModal({ mode, onClose, onSwitchMode }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let token;
      if (mode === 'register') {
        console.log("Step 1: Attempting Signup...");
        await API.post(`/auth/signup`, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        console.log("Step 2: Signup success. Auto-logging in...");
        const loginRes = await API.post(`/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        token = loginRes.data.accessToken;
      } else {
        console.log("Step 1: Attempting Login...");
        const response = await API.post(`/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        token = response.data.accessToken;
      }

      console.log("Step 3: Token received. Saving...");
      localStorage.setItem('token' , token);

      console.log("Step 4: Fetching user profile...");
      // WE FORCE THE HEADER HERE JUST IN CASE YOUR INTERCEPTOR IS BROKEN
      const userRes = await API.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Step 5: Profile fetched!", userRes.data);

      dispatch(loginSuccess({
        user: userRes.data,
        token: token
      }));

      onClose();

    } catch (err) {
      // THIS WILL PRINT THE EXACT REASON IT FAILED TO YOUR BROWSER CONSOLE
      console.error("THE EXACT ERROR IS:", err); 
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };
return (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
    
    {/* Modal Card */}
    <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 animate-[fadeIn_.4s_ease]">

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/60 hover:bg-white transition-all duration-200 hover:rotate-90"
      >
        <X className="w-5 h-5 text-slate-700" />
      </button>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-slate-900">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-500 mt-2 text-sm">
          {mode === 'login'
            ? 'Login to continue your journey'
            : 'Sign up to start exploring'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-shake">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {mode === 'register' && (
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder=" "
              className="peer w-full px-4 pt-5 pb-3 rounded-xl border border-slate-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
            />
            <label className="absolute left-4 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-red-500">
              Full Name
            </label>
          </div>
        )}

        <div className="relative">
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            placeholder=" "
            className="peer w-full px-4 pt-5 pb-3 rounded-xl border border-slate-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          />
          <label className="absolute left-4 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-red-500">
            Email
          </label>
        </div>

        <div className="relative">
          <input
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            placeholder=" "
            className="peer w-full px-4 pt-5 pb-3 rounded-xl border border-slate-300 bg-white/60 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
          />
          <label className="absolute left-4 top-2 text-xs text-slate-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-red-500">
            Password
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-full font-semibold text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Please wait...
            </span>
          ) : mode === 'login' ? (
            'Login'
          ) : (
            'Sign up'
          )}
        </button>
      </form>

      {/* Switch Mode */}
      <div className="mt-8 text-center">
        <button
          onClick={() =>
            onSwitchMode(mode === 'login' ? 'register' : 'login')
          }
          className="text-sm font-medium text-slate-600 hover:text-red-500 transition-colors"
        >
          {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  </div>
);
}
