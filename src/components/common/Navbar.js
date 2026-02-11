import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getRoleDisplayName } from '../../utils/helpers';
import { ROLES } from '../../utils/constants';
import '../../styles/dashboard.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  if (!currentUser) return null;

  const isStaffUser = currentUser.role !== ROLES.PASSENGER;

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
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {isStaffUser && (
              <button className="btn btn-secondary btn-sm" onClick={handleChangePassword}>
                Change Password
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
