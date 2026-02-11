import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout, FormInput } from '../components/shared';
import { validatePassword } from '../utils/validation';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { currentUser, userType, changePassword, addNotification } = useApp();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  // Check if this is a mandatory password change (first login) or voluntary
  const isMandatory = currentUser?.mustChangePassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getDashboardPath = () => {
    switch (userType) {
      case 'airlineStaff':
        return '/airline-staff';
      case 'gateStaff':
        return '/gate-staff';
      case 'groundStaff':
        return '/ground-staff';
      default:
        return '/';
    }
  };

  const handleCancel = () => {
    navigate(getDashboardPath());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validate password
    const validation = validatePassword(formData.newPassword);
    if (!validation.valid) {
      setErrors({ newPassword: validation.message });
      return;
    }

    // Check passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    // Change password
    const success = changePassword(formData.newPassword);
    if (success) {
      addNotification('Password changed successfully', 'success');
      navigate(getDashboardPath());
    } else {
      setErrors({ general: 'Failed to change password' });
    }
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <Layout title="Change Password">
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2>Change Your Password</h2>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          {isMandatory
            ? 'You must change your password before continuing.'
            : 'Enter a new password below.'
          }
        </p>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}

          <FormInput
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            required
          />

          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <div className="password-requirements">
            <p><strong>Password requirements:</strong></p>
            <ul>
              <li>Minimum 6 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
            </ul>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '1rem' }}>
            {!isMandatory && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              Change Password
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ChangePassword;
