import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useUser } from '../contexts/UserContext';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();
  
  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');
    
    try{
      const r = await api.post('/login', { email, password });
      login(r.data.token, { email: r.data.email, role: r.data.role, name: r.data.name });
      setMsg('Logged in successfully!');
      setTimeout(() => {
        navigate('/tickets');
      }, 1000);
    }catch(err){ 
      setMsg(err?.response?.data?.error?.code || 'Login failed. Please try again.'); 
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-layout">
      <div className="container container-sm">
      <div className="page-header text-center">
        <h1 className="page-title">Welcome Back</h1>
        <p className="page-subtitle">Sign in to your account to continue</p>
      </div>
      
      <div className="card auth-card">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input 
                id="email"
                type="email"
                className="form-input"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="Enter your email" 
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                id="password"
                type="password" 
                className="form-input"
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                placeholder="Enter your password" 
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
            
            {msg && (
              <div className={`alert ${msg.includes('successfully') ? 'alert-success' : 'alert-error'} mt-3`}>
                {msg}
              </div>
            )}
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
