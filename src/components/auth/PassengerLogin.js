import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import FormInput from '../common/FormInput';
import ErrorMessage from '../common/ErrorMessage';
import { validatePassengerId, validateTicketNumber } from '../../utils/validators';
import '../../styles/forms.css';

const PassengerLogin = () => {
  const [formData, setFormData] = useState({ passengerId: '', ticketNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginPassenger } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      loginPassenger(formData.passengerId, formData.ticketNumber);
      navigate('/passenger');
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
          Passenger Login
        </h2>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Passenger ID"
            name="passengerId"
            value={formData.passengerId}
            onChange={handleChange}
            validator={validatePassengerId}
            placeholder="6 digits"
            required
          />

          <FormInput
            label="Ticket Number"
            name="ticketNumber"
            value={formData.ticketNumber}
            onChange={handleChange}
            validator={validateTicketNumber}
            placeholder="10 digits"
            required
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
          <a href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            Staff Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default PassengerLogin;
