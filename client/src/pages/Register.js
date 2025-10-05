import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register(){
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');
    
    try{ 
      await api.post('/register', { name, email, password }); 
      setMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch(e){ 
      setMsg('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-layout">
      <div className="container container-sm">
      <div className="page-header text-center">
        <h1 className="page-title">Create Account</h1>
        <p className="page-subtitle">Join us to start managing your tickets</p>
      </div>
      
      <div className="card auth-card">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input 
                id="name"
                type="text"
                className="form-input"
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="Enter your full name" 
                required
              />
            </div>
            
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
                placeholder="Create a password" 
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
                  Creating account...
                </>
              ) : (
                'Create Account'
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
