import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useStaff from '../../hooks/useStaff';
import FormInput from '../common/FormInput';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { validatePassword } from '../../utils/validators';
import { verifyPassword } from '../../utils/encryption';
import { STORAGE_KEYS } from '../../utils/constants';
import StorageService from '../../services/storageService';
import '../../styles/forms.css';

const ChangePassword = ({ isForced = false }) => {
  const navigate = useNavigate();
  const { currentUser, updateCurrentUser, logout } = useAuth();
  const { changePassword } = useStaff();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    try {
      // Verify current password
      const users = StorageService.get(STORAGE_KEYS.USERS) || {};
      const user = users[currentUser.id];

      if (!user) {
        setError('User not found');
        return;
      }

      if (!verifyPassword(formData.currentPassword, user.password)) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        return;
      }

      // Change password
      changePassword(currentUser.id, formData.newPassword);

      // Update current user session
      updateCurrentUser({ mustChangePassword: false });

      setSuccess('Password changed successfully!');

      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Redirect after successful change
      if (isForced) {
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    if (isForced) {
      // If forced, logout instead of canceling
      logout();
      navigate('/login');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Change Password</h1>

        {isForced && (
          <div className="error-message" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <strong>Password Change Required</strong>
            <p style={{ marginTop: 'var(--spacing-sm)', marginBottom: 0 }}>
              For security reasons, you must change your auto-generated password before continuing.
            </p>
          </div>
        )}

        <ErrorMessage message={error} />
        <SuccessMessage message={success} />

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            required
          />

          <FormInput
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            helpText="Must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number"
            required
          />

          <FormInput
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <div className="btn-group">
            <button type="submit" className="btn btn-primary">
              Change Password
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
            >
              {isForced ? 'Logout' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
