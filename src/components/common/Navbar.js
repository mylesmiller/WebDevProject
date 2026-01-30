import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getRoleDisplayName } from '../../utils/helpers';
import '../../styles/dashboard.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="dashboard-header">
      <div className="dashboard-nav">
        <div className="dashboard-title">Airport Baggage Tracking System</div>
        <div className="dashboard-user">
          <div>
            <div style={{ fontWeight: 'var(--weight-semibold)' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {getRoleDisplayName(currentUser.role)}
              {currentUser.airline && ` - ${currentUser.airline}`}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
