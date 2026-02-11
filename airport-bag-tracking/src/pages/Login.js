import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FormInput } from '../components/shared';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, passengerLogin, addNotification } = useApp();

  const [loginType, setLoginType] = useState('admin');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    identification: '',
    ticketNumber: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (loginType === 'passenger') {
      // Passenger login
      if (!formData.identification || formData.identification.length !== 6) {
        setErrors(prev => ({ ...prev, identification: 'Identification must be 6 digits' }));
        return;
      }
      if (!formData.ticketNumber || formData.ticketNumber.length !== 10) {
        setErrors(prev => ({ ...prev, ticketNumber: 'Ticket number must be 10 digits' }));
        return;
      }

      const result = passengerLogin(formData.identification, formData.ticketNumber);
      if (result.success) {
        addNotification('Login successful', 'success');
        navigate('/passenger');
      } else {
        setErrors({ general: result.message });
      }
    } else {
      // Staff login
      if (!formData.username) {
        setErrors(prev => ({ ...prev, username: 'Username is required' }));
        return;
      }
      if (!formData.password) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
        return;
      }

      const result = login(formData.username, formData.password, loginType);
      if (result.success) {
        addNotification('Login successful', 'success');
        if (result.mustChangePassword) {
          navigate('/change-password');
        } else {
          switch (loginType) {
            case 'admin':
              navigate('/admin');
              break;
            case 'airlineStaff':
              navigate('/airline-staff');
              break;
            case 'gateStaff':
              navigate('/gate-staff');
              break;
            case 'groundStaff':
              navigate('/ground-staff');
              break;
            default:
              navigate('/');
          }
        }
      } else {
        setErrors({ general: result.message });
      }
    }
  };

  const loginTypes = [
    { value: 'admin', label: 'Administrator' },
    { value: 'airlineStaff', label: 'Airline Staff' },
    { value: 'gateStaff', label: 'Gate Staff' },
    { value: 'groundStaff', label: 'Ground Staff' },
    { value: 'passenger', label: 'Passenger (Bonus)' },
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Airport Bag Tracking System</h1>
          <p>Please login to continue</p>
        </div>

        <div className="login-type-selector">
          {loginTypes.map(type => (
            <button
              key={type.value}
              className={`login-type-btn ${loginType === type.value ? 'active' : ''}`}
              onClick={() => {
                setLoginType(type.value);
                setErrors({});
              }}
            >
              {type.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}

          {loginType === 'passenger' ? (
            <>
              <FormInput
                label="Identification Number"
                name="identification"
                value={formData.identification}
                onChange={handleChange}
                error={errors.identification}
                placeholder="6-digit ID"
                maxLength={6}
                required
              />
              <FormInput
                label="Ticket Number"
                name="ticketNumber"
                value={formData.ticketNumber}
                onChange={handleChange}
                error={errors.ticketNumber}
                placeholder="10-digit ticket number"
                maxLength={10}
                required
              />
            </>
          ) : (
            <>
              <FormInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="Enter your username"
                required
              />
              <FormInput
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                required
              />
            </>
          )}

          <button type="submit" className="btn btn-primary login-btn">
            Login
          </button>
        </form>

        {loginType === 'admin' && (
          <div className="login-hint">
            <p><strong>Demo Admin:</strong> username: admin, password: Admin123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
