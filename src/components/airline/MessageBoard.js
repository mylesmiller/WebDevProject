import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useMessages from '../../hooks/useMessages';
import usePassengers from '../../hooks/usePassengers';
import useFlights from '../../hooks/useFlights';
import FormInput from '../common/FormInput';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { MESSAGE_BOARDS, MESSAGE_PRIORITY } from '../../utils/constants';
import { validatePassengerId } from '../../utils/validators';
import { formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const MessageBoard = () => {
  const { currentUser } = useAuth();
  const { getAirlineMessages, addMessage } = useMessages();
  const { getPassengerById } = usePassengers();
  const { getFlightsByAirline } = useFlights();
  const [passengerId, setPassengerId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const messages = getAirlineMessages(currentUser.airline);
  const flights = getFlightsByAirline(currentUser.airline);

  const handleSubmitRemovalRequest = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const passenger = getPassengerById(passengerId);
      if (!passenger) {
        setError('Passenger not found with this ID');
        return;
      }

      // Verify passenger is on this airline's flight
      const passengerFlight = flights.find(f => f.id === passenger.flightId);
      if (!passengerFlight) {
        setError('This passenger is not on a flight for your airline');
        return;
      }

      if (!reason.trim()) {
        setError('Reason for removal is required');
        return;
      }

      const messageContent = `PASSENGER REMOVAL REQUEST - Passenger: ${passenger.name} (ID: ${passengerId}), Ticket: ${passenger.ticketNumber}, Flight: ${passengerFlight.flightNumber}. Reason: ${reason.trim()}`;

      addMessage(MESSAGE_BOARDS.AIRLINE, {
        author: currentUser.name,
        airline: 'ADMIN',
        content: messageContent,
        priority: MESSAGE_PRIORITY.HIGH
      });

      setSuccess('Passenger removal request sent to administrator.');
      setPassengerId('');
      setReason('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-lg">Messages - {currentUser.airline}</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <h3 className="mb-md">Request Passenger Removal</h3>
        <p className="text-muted mb-md">
          Send a request to the administrator to remove a passenger due to security violation of one or more bags.
        </p>
        <form onSubmit={handleSubmitRemovalRequest}>
          <FormInput
            label="Passenger ID"
            name="passengerId"
            value={passengerId}
            onChange={(e) => setPassengerId(e.target.value)}
            validator={validatePassengerId}
            placeholder="6 digits"
            required
          />
          <div className="form-group">
            <label className="form-label">
              Reason for Removal <span style={{ color: 'var(--danger-color)' }}> *</span>
            </label>
            <textarea
              className="form-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the security violation..."
              required
            />
          </div>
          <button type="submit" className="btn btn-danger">
            Send Removal Request to Admin
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="mb-md">Message History</h3>
        {messages.length === 0 ? (
          <p className="text-muted text-center">No messages yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {messages.map(message => (
              <div
                key={message.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${
                    message.priority === MESSAGE_PRIORITY.HIGH
                      ? 'var(--danger-color)'
                      : message.priority === MESSAGE_PRIORITY.LOW
                      ? 'var(--secondary-color)'
                      : 'var(--primary-color)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                  <strong>{message.author}</strong>
                  <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                <p style={{ margin: 0 }}>{message.content}</p>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  <span className={`status-badge status-${message.priority === MESSAGE_PRIORITY.HIGH ? 'danger' : message.priority === MESSAGE_PRIORITY.LOW ? 'pending' : 'info'}`}>
                    {message.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBoard;
