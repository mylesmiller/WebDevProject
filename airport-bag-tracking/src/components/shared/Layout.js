import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Notification from './Notification';
import './Layout.css';

const Layout = ({ children, title }) => {
  const { currentUser, userType, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const getUserTypeDisplay = () => {
    switch (userType) {
      case 'admin': return 'Administrator';
      case 'airlineStaff': return `Airline Staff (${currentUser.airlines})`;
      case 'gateStaff': return `Gate Staff (${currentUser.airlines})`;
      case 'groundStaff': return 'Ground Staff';
      case 'passenger': return 'Passenger';
      default: return '';
    }
  };

  // Staff users can change password (not admin or passenger)
  const canChangePassword = ['airlineStaff', 'gateStaff', 'groundStaff'].includes(userType);

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <h1>Airport Bag Tracking System</h1>
          {title && <span className="page-title">/ {title}</span>}
        </div>
        <div className="header-right">
          {currentUser && (
            <>
              <span className="user-info">
                {userType === 'passenger'
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : currentUser.username
                } ({getUserTypeDisplay()})
              </span>
              {canChangePassword && (
                <button onClick={handleChangePassword} className="btn btn-outline">
                  Change Password
                </button>
              )}
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          )}
        </div>
      </header>
      <Notification />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>Airport Bag Tracking System - Web Development Project</p>
      </footer>
    </div>
  );
};

export default Layout;
