import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useUser } from '../contexts/UserContext';

export default function TicketDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAgent, isAdmin } = useUser();
  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [msg, setMsg] = useState('');
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => { 
    load(); 
    if (isAgent()) {
      loadAgents();
    }
  }, [id, isAgent]);
  
  const load = async () => { 
    try {
      setIsLoading(true);
      const r = await api.get(`/tickets/${id}`); 
      setData(r.data); 
    } catch (error) {
      setMsg('Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadAgents = async () => {
    try {
      const r = await api.get('/agents');
      setAgents(r.data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };
  
  const addComment = async () => { 
    if (!comment.trim()) return;
    
    try { 
      setIsSubmittingComment(true);
      await api.post(`/tickets/${id}/comments`, { message: comment }); 
      setComment(''); 
      load(); 
      setMsg('Comment added successfully');
    } catch(e){ 
      setMsg('Failed to add comment'); 
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const updateTicket = async (updates) => {
    try {
      setIsUpdating(true);
      await api.patch(`/tickets/${id}`, {
        ...updates,
        version: data.ticket.version
      });
      load();
      setMsg('Ticket updated successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        setMsg('Ticket was modified by someone else. Please refresh and try again.');
      } else {
        setMsg('Failed to update ticket');
      }
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusMap = {
      'open': 'badge-open',
      'in-progress': 'badge-in-progress',
      'resolved': 'badge-resolved',
      'closed': 'badge-closed'
    };
    return statusMap[status] || 'badge-open';
  };
  
  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'low': 'badge-priority-low',
      'medium': 'badge-priority-medium',
      'high': 'badge-priority-high'
    };
    return priorityMap[priority] || 'badge-priority-medium';
  };
  
  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading ticket details...
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <h3>Ticket Not Found</h3>
          <p>The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={() => navigate('/tickets')} className="btn btn-primary mt-3">
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className="page-header">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="page-title">{data.ticket.title}</h1>
            <p className="page-subtitle">Ticket #{id}</p>
          </div>
          <button onClick={() => navigate('/tickets')} className="btn btn-secondary">
            ← Back to Tickets
          </button>
        </div>
      </div>
      
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1">
          <div className="card mb-4">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Ticket Details</h3>
                <div className="flex gap-2">
                  <span className={`badge ${getStatusBadge(data.ticket.status)}`}>
                    {data.ticket.status}
                  </span>
                  <span className={`badge ${getPriorityBadge(data.ticket.priority)}`}>
                    {data.ticket.priority} priority
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{data.ticket.description}</p>
              </div>
              
              {/* Agent Controls */}
              {isAgent() && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">Agent Controls</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={data.ticket.status}
                        onChange={(e) => updateTicket({ status: e.target.value })}
                        disabled={isUpdating}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Assign to Agent</label>
                      <select
                        className="form-select"
                        value={data.ticket.agent?._id || ''}
                        onChange={(e) => updateTicket({ agent: e.target.value || null })}
                        disabled={isUpdating}
                      >
                        <option value="">Unassigned</option>
                        {agents.map(agent => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} ({agent.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(data.ticket.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">SLA Due:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(data.ticket.sla_due).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Priority:</span>
                  <span className="ml-2 text-gray-900 capitalize">{data.ticket.priority}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="ml-2 text-gray-900 capitalize">{data.ticket.status}</span>
                </div>
                {data.ticket.user && (
                  <div>
                    <span className="font-medium text-gray-600">User:</span>
                    <span className="ml-2 text-gray-900">{data.ticket.user.email}</span>
                  </div>
                )}
                {data.ticket.agent && (
                  <div>
                    <span className="font-medium text-gray-600">Agent:</span>
                    <span className="ml-2 text-gray-900">{data.ticket.agent.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold">Comments ({data.comments.length})</h3>
            </div>
            <div className="card-body">
              {data.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to add one!</p>
              ) : (
                <div className="space-y-4">
                  {data.comments.map(comment => (
                    <div key={comment._id} className="border-l-4 border-gray-200 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.user?.email || 'Unknown User'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add Comment Form */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Add a Comment</h4>
                <div className="form-group">
                  <textarea 
                    className="form-textarea"
                    value={comment} 
                    onChange={e=>setComment(e.target.value)} 
                    placeholder="Write your comment here..."
                    rows="4"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button 
                    onClick={addComment} 
                    className="btn btn-primary"
                    disabled={isSubmittingComment || !comment.trim()}
                  >
                    {isSubmittingComment ? (
                      <>
                        <div className="spinner"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Comment'
                    )}
                  </button>
                  <span className="text-sm text-gray-500">
                    {comment.length}/1000 characters
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline Section */}
          {data.activities && data.activities.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="font-semibold">Activity Timeline</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {data.activities.map((activity, index) => (
                    <div key={activity._id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.details.message}
                            </p>
                            {activity.details.field && (
                              <p className="text-xs text-gray-500 mt-1">
                                {activity.details.field}: {activity.details.oldValue} → {activity.details.newValue}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          by {activity.user?.email || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {msg && (
        <div className={`alert ${msg.includes('successfully') ? 'alert-success' : 'alert-error'} mt-4`}>
          {msg}
        </div>
      )}
    </div>
  );
}
