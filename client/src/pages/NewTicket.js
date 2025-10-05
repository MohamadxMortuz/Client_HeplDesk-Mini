import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '../contexts/UserContext';

export default function NewTicket(){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useUser();
  
  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg('');
    
    try{
      const key = uuidv4();
      const r = await api.post('/tickets', { title, description, priority }, { headers: { 'Idempotency-Key': key } });
      setMsg('Ticket created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/tickets');
      }, 1500);
    } catch(e){ 
      setMsg(e?.response?.data?.error?.code || 'Failed to create ticket. Please try again.'); 
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }
  
  return (
    <div className="container container-md">
      <div className="page-header">
        <h1 className="page-title">Create New Ticket</h1>
        <p className="page-subtitle">Submit a new support request and we'll help you resolve it</p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="title" className="form-label">Ticket Title *</label>
              <input 
                id="title"
                type="text"
                className="form-input"
                value={title} 
                onChange={e=>setTitle(e.target.value)} 
                placeholder="Brief description of your issue" 
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Description *</label>
              <textarea 
                id="description"
                className="form-textarea"
                value={description} 
                onChange={e=>setDescription(e.target.value)} 
                placeholder="Please provide detailed information about your issue. Include steps to reproduce, error messages, and any relevant context."
                rows="6"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="priority" className="form-label">Priority Level</label>
              <select 
                id="priority"
                className="form-select"
                value={priority} 
                onChange={e=>setPriority(e.target.value)}
              >
                <option value="low">Low - General inquiry or minor issue</option>
                <option value="medium">Medium - Standard support request</option>
                <option value="high">High - Urgent issue affecting productivity</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !title.trim() || !description.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Creating Ticket...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/tickets')}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
            
            {msg && (
              <div className={`alert ${msg.includes('successfully') ? 'alert-success' : 'alert-error'} mt-3`}>
                {msg}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
