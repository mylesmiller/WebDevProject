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
    <div style={{ maxWidth: '440px', margin: '0 auto', padding: '2rem' }}>
      <div className="card" style={{ padding: 'var(--spacing-xl)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--spacing-md)',
            fontSize: '1.5rem',
            color: 'white'
          }}>
            🔒
          </div>
          <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Change Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            Update your account password
          </p>
        </div>

        {isForced && (
          <div style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            color: '#9a3412'
          }}>
            <strong style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
              Password Change Required
            </strong>
            <span style={{ fontSize: 'var(--text-sm)' }}>
              For security reasons, you must change your auto-generated password before continuing.
            </span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-lg)' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 'var(--spacing-sm) var(--spacing-lg)' }}>
              Update Password
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%' }}
              onClick={handleCancel}
            >
              {isForced ? 'Logout Instead' : 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
