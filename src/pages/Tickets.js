import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useUser } from '../contexts/UserContext';

export default function Tickets(){
  const [items, setItems] = useState([]);
  const [next, setNext] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit] = useState(10);
  const { isAuthenticated } = useUser();
  
  useEffect(() => { 
    if (isAuthenticated) {
      load(0); 
    }
  }, [isAuthenticated]);
  
  const load = async (offset, query = searchQuery, status = statusFilter) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      if (query) params.append('q', query);
      if (status) params.append('status', status);
      
      const r = await api.get(`/tickets?${params}`);
      setItems(r.data.items);
      setNext(r.data.next_offset);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    load(0, searchQuery, statusFilter);
  };
  
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    load(0, searchQuery, status);
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
  
  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading tickets...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Support Tickets</h1>
        <p className="page-subtitle">Manage and track all your support requests</p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-3 mb-3">
            <div className="flex-1">
              <input
                type="text"
                className="form-input"
                placeholder="Search tickets by title, description, or comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button 
              type="button" 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
                load(0, '', '');
              }}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </form>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleStatusFilter('')}
              className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('open')}
              className={`btn btn-sm ${statusFilter === 'open' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Open
            </button>
            <button
              onClick={() => handleStatusFilter('in_progress')}
              className={`btn btn-sm ${statusFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusFilter('resolved')}
              className={`btn btn-sm ${statusFilter === 'resolved' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Resolved
            </button>
            <button
              onClick={() => handleStatusFilter('closed')}
              className={`btn btn-sm ${statusFilter === 'closed' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <h3 className="text-gray-600 mb-3">No tickets found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter 
                ? 'No tickets match your search criteria.' 
                : "You don't have any tickets yet. Create your first ticket to get started."
              }
            </p>
            <Link to="/tickets/new" className="btn btn-primary">
              Create New Ticket
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">
                  {searchQuery || statusFilter ? 'Search Results' : 'All Tickets'} ({items.length})
                </h3>
                <Link to="/tickets/new" className="btn btn-primary btn-sm">
                  + New Ticket
                </Link>
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
                          <div className="flex gap-2">
                            <span className={`badge ${getStatusBadge(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className={`badge ${getPriorityBadge(ticket.priority)}`}>
                              {ticket.priority} priority
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500 ml-4">
                          <div>Created: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                          {ticket.sla_due && (
                            <div>SLA: {new Date(ticket.sla_due).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {next > 0 && (
            <div className="text-center mt-4">
              <button 
                onClick={() => load(next)} 
                className="btn btn-secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Loading...
                  </>
                ) : (
                  'Load More Tickets'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
