import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useUser } from '../contexts/UserContext';

export default function BreachedTickets(){
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isAuthenticated } = useUser();
  
  useEffect(() => { 
    if (isAuthenticated && isAdmin()) {
      loadBreachedTickets(); 
    }
  }, [isAuthenticated, isAdmin]);
  
  const loadBreachedTickets = async () => {
    try {
      setIsLoading(true);
      const r = await api.get('/tickets/breached');
      setItems(r.data.items);
    } catch (error) {
      console.error('Failed to load breached tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusMap = {
      'open': 'badge-open',
      'in_progress': 'badge-in-progress',
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
  
  const getBreachTime = (slaDue) => {
    const now = new Date();
    const sla = new Date(slaDue);
    const diffMs = now - sla;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} overdue`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} overdue`;
    } else {
      return 'Just breached';
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
  
  if (!isAdmin()) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <h3>Access Denied</h3>
          <p>You don't have permission to view breached tickets. This page is only available to administrators.</p>
          <Link to="/tickets" className="btn btn-primary mt-3">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading breached tickets...
      </div>
    );
  }
  
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Breached Tickets</h1>
        <p className="page-subtitle">Tickets that have exceeded their SLA deadline</p>
      </div>
      
      {items.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <h3 className="text-gray-600 mb-3">No Breached Tickets</h3>
            <p className="text-gray-500 mb-4">Great! All tickets are within their SLA deadlines.</p>
            <Link to="/tickets" className="btn btn-primary">
              View All Tickets
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Breached Tickets ({items.length})</h3>
              <button 
                onClick={loadBreachedTickets}
                className="btn btn-secondary btn-sm"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <ul className="list">
              {items.map(ticket => (
                <li key={ticket._id} className="list-item">
                  <Link to={`/tickets/${ticket._id}`} className="list-item-link">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {ticket.description?.substring(0, 100)}
                          {ticket.description?.length > 100 && '...'}
                        </p>
                        <div className="flex gap-2 mb-2">
                          <span className={`badge ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`badge ${getPriorityBadge(ticket.priority)}`}>
                            {ticket.priority} priority
                          </span>
                          <span className="badge badge-error">
                            {getBreachTime(ticket.sla_due)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <div>Created: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                          <div>SLA Due: {new Date(ticket.sla_due).toLocaleString()}</div>
                          {ticket.user && (
                            <div>User: {ticket.user.email}</div>
                          )}
                          {ticket.agent && (
                            <div>Agent: {ticket.agent.email}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
