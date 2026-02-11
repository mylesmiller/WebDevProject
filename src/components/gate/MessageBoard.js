import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useMessages from '../../hooks/useMessages';
import useFlights from '../../hooks/useFlights';
import useBags from '../../hooks/useBags';
import usePassengers from '../../hooks/usePassengers';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { MESSAGE_BOARDS, MESSAGE_PRIORITY, PASSENGER_STATUS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const MessageBoard = () => {
  const { currentUser } = useAuth();
  const { getMessagesByBoard, addMessage } = useMessages();
  const { getFlightsByAirline } = useFlights();
  const { areAllBagsLoaded } = useBags();
  const { getPassengersByFlight } = usePassengers();
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const messages = getMessagesByBoard(MESSAGE_BOARDS.GATE);
  const flights = getFlightsByAirline(currentUser.airline);

  const handleNotifyDepartureReady = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFlightId) {
      setError('Please select a flight');
      return;
    }

    const flight = flights.find(f => f.id === selectedFlightId);
    if (!flight) {
      setError('Flight not found');
      return;
    }

    // Check if all passengers are boarded
    const passengers = getPassengersByFlight(flight.id);
    const allBoarded = passengers.every(p => p.status === PASSENGER_STATUS.BOARDED);
    const boardedCount = passengers.filter(p => p.status === PASSENGER_STATUS.BOARDED).length;

    // Check if all bags are loaded
    const allBagsLoaded = areAllBagsLoaded(flight.id);

    if (!allBoarded) {
      setError(`Not all passengers are boarded (${boardedCount}/${passengers.length}). All passengers must board before departure notification.`);
      return;
    }

    if (!allBagsLoaded) {
      setError('Not all bags are loaded onto the aircraft.');
      return;
    }

    const messageContent = `DEPARTURE READY - Flight ${flight.flightNumber} at Gate ${flight.gate}${flight.destination ? ` to ${flight.destination}` : ''} is ready for departure. All ${passengers.length} passenger(s) boarded and all bags loaded.`;

    addMessage(MESSAGE_BOARDS.GATE, {
      author: currentUser.name,
      airline: currentUser.airline,
      content: messageContent,
      priority: MESSAGE_PRIORITY.HIGH
    });

    setSuccess(`Administrator has been notified that flight ${flight.flightNumber} is ready for departure.`);
    setSelectedFlightId('');
  };

  return (
    <div>
      <h2 className="mb-lg">Messages - Departure Notifications</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <h3 className="mb-md">Notify Admin - Plane Ready for Departure</h3>
        <p className="text-muted mb-md">
          Send a notification to the administrator that a plane is ready for departure. All passengers must be boarded and all bags loaded.
        </p>
        <form onSubmit={handleNotifyDepartureReady}>
          <div className="form-group">
            <label className="form-label">
              Select Flight <span style={{ color: 'var(--danger-color)' }}> *</span>
            </label>
            <select
              className="form-select"
              value={selectedFlightId}
              onChange={(e) => setSelectedFlightId(e.target.value)}
              required
            >
              <option value="">Select a flight</option>
              {flights.map(flight => (
                <option key={flight.id} value={flight.id}>
                  {flight.flightNumber} - Gate {flight.gate}{flight.destination ? ` - ${flight.destination}` : ''}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-success">
            Notify Admin - Ready for Departure
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="mb-md">Departure Notification History</h3>
        {messages.length === 0 ? (
          <p className="text-muted text-center">No departure notifications sent yet</p>
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
                  <div>
                    <strong>{message.author}</strong>
                    {message.airline && <span className="text-muted"> ({message.airline})</span>}
                  </div>
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
