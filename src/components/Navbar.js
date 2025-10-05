import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function Navbar(){
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return 'U';
    const base = nameOrEmail.trim();
    if (!base) return 'U';
    const parts = base.includes(' ') ? base.split(/\s+/) : [base];
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    const initials = (first + last).toUpperCase();
    return initials || base[0].toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/tickets" className="navbar-brand">
          HelpDesk Mini
        </Link>
        <ul className="navbar-nav">
          {isAuthenticated ? (
            <>
              <li>
                <Link 
                  to="/tickets" 
                  className={`navbar-link ${location.pathname === '/tickets' ? 'active' : ''}`}
                >
                  Tickets
                </Link>
              </li>
              <li>
                <Link 
                  to="/tickets/new" 
                  className={`navbar-link ${location.pathname === '/tickets/new' ? 'active' : ''}`}
                >
                  New Ticket
                </Link>
              </li>
              {isAdmin() && (
                <li>
                  <Link 
                    to="/breached" 
                    className={`navbar-link ${location.pathname === '/breached' ? 'active' : ''}`}
                  >
                    Breached Tickets
                  </Link>
                </li>
              )}
              <li className={`navbar-user ${open ? 'open' : ''}`} ref={menuRef}>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => setOpen(v => !v)}
                >
                  <span className="avatar avatar-sm">{getInitials(displayName)}</span>
                </button>
                {open && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="font-semibold">{user?.name || displayName}</div>
                      <div className="text-xs text-gray-600">{user?.email}</div>
                    </div>
                    <button className="dropdown-item" onClick={logout}>Logout</button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/login" 
                  className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={`navbar-link ${location.pathname === '/register' ? 'active' : ''}`}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
