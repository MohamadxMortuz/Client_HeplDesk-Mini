import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Tickets = lazy(() => import('./pages/Tickets'));
const TicketDetail = lazy(() => import('./pages/TicketDetail'));
const NewTicket = lazy(() => import('./pages/NewTicket'));
const BreachedTickets = lazy(() => import('./pages/BreachedTickets'));
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App(){
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Suspense fallback={<div className="loading"><div className="spinner"></div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/tickets" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tickets" element={<ProtectedRoute><Tickets/></ProtectedRoute>} />
              <Route path="/tickets/new" element={<ProtectedRoute><NewTicket/></ProtectedRoute>} />
              <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail/></ProtectedRoute>} />
              <Route path="/breached" element={<ProtectedRoute><BreachedTickets/></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
