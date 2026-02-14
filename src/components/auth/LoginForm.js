import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import FormInput from '../common/FormInput';
import ErrorMessage from '../common/ErrorMessage';
import { validateRequired, validateLoginForm } from '../../utils/validators';
import { ROLES } from '../../utils/constants';
import '../../styles/forms.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    // Clear field-specific error on change
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormErrors({});
    setLoading(true);

    // Validate form before attempting login
    const errors = validateLoginForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const user = login(formData.username, formData.password);

      // Redirect based on role
      switch (user.role) {
        case ROLES.ADMIN:
          navigate('/admin');
          break;
        case ROLES.AIRLINE_STAFF:
          navigate('/airline');
          break;
        case ROLES.GATE_STAFF:
          navigate('/gate');
          break;
        case ROLES.GROUND_STAFF:
          navigate('/ground');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <div className="card">
        <h2 style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
          Staff Login
        </h2>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            validator={validateRequired}
            error={formErrors.username}
            required
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            validator={validateRequired}
            error={formErrors.password}
            required
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
          <a href="/passenger-login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            Passenger Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
