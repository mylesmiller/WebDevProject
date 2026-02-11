import React, { useState } from 'react';
import useMessages from '../../hooks/useMessages';
import usePassengers from '../../hooks/usePassengers';
import useBags from '../../hooks/useBags';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Modal from '../common/Modal';
import { MESSAGE_BOARDS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const AdminMessages = () => {
  const { getMessagesByBoard, deleteMessage } = useMessages();
  const { removePassenger, getPassengerById } = usePassengers();
  const { getAllBags } = useBags();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Passenger removal requests from airline staff
  const allAirlineMessages = getMessagesByBoard(MESSAGE_BOARDS.AIRLINE);
  const removalRequests = allAirlineMessages.filter(msg =>
    msg.airline === 'ADMIN' && msg.content.includes('PASSENGER REMOVAL REQUEST')
  );

  // Departure notifications from gate staff
  const gateMessages = getMessagesByBoard(MESSAGE_BOARDS.GATE);
  const departureNotifications = gateMessages.filter(msg =>
    msg.content.includes('DEPARTURE READY')
  );

  const extractPassengerId = (messageContent) => {
    const match = messageContent.match(/ID:\s*(\d{6})/);
    return match ? match[1] : null;
  };

  const extractTicketNumber = (messageContent) => {
    const match = messageContent.match(/Ticket:\s*(\d{10})/);
    return match ? match[1] : null;
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleRemovePassenger = () => {
    setError('');
    setSuccess('');

    try {
      const passengerId = extractPassengerId(selectedMessage.content);
      const ticketNumber = extractTicketNumber(selectedMessage.content);

      if (!passengerId || !ticketNumber) {
        setError('Unable to extract passenger information from message');
        return;
      }

      const passenger = getPassengerById(passengerId);
      if (!passenger) {
        setError('Passenger not found or already removed');
        deleteMessage(MESSAGE_BOARDS.AIRLINE, selectedMessage.id);
        setShowModal(false);
        setSelectedMessage(null);
        return;
      }

      if (passenger.ticketNumber !== ticketNumber) {
        setError('Ticket number mismatch');
        return;
      }

      const allBags = getAllBags();
      const remainingBags = allBags.filter(bag => bag.passengerId === passengerId);

      if (remainingBags.length > 0) {
        setError(`Warning: Passenger still has ${remainingBags.length} bag(s) in the system. Airline staff should remove all bags first.`);
        return;
      }

      removePassenger(passengerId);
      deleteMessage(MESSAGE_BOARDS.AIRLINE, selectedMessage.id);

      setSuccess(`Passenger ${passenger.name} (ID: ${passengerId}) has been removed from the system.`);
      setShowModal(false);
      setSelectedMessage(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAcknowledgeDeparture = (message) => {
    deleteMessage(MESSAGE_BOARDS.GATE, message.id);
    setSuccess('Departure notification acknowledged.');
  };

  return (
    <div>
      <h2 className="mb-lg">Administrator Messages</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <h3 className="mb-md">Passenger Removal Requests</h3>
        <p className="text-muted mb-md">Requests from airline staff to remove passengers due to security violations.</p>
        {removalRequests.length === 0 ? (
          <p className="text-muted text-center">No pending removal requests</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {removalRequests.map(message => (
              <div
                key={message.id}
                className="card"
                style={{
                  borderLeft: '4px solid var(--danger-color)',
                  backgroundColor: 'rgba(220, 38, 38, 0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                  <strong>{message.author}</strong>
                  <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                <p style={{ margin: '0 0 var(--spacing-md) 0' }}>{message.content}</p>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <span className="status-badge status-danger">
                    {message.priority}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleSelectMessage(message)}
                  >
                    Process Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="mb-md">Departure Notifications</h3>
        <p className="text-muted mb-md">Notifications from gate staff that a plane is ready for departure.</p>
        {departureNotifications.length === 0 ? (
          <p className="text-muted text-center">No departure notifications</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {departureNotifications.map(message => (
              <div
                key={message.id}
                className="card"
                style={{
                  borderLeft: '4px solid var(--success-color)',
                  backgroundColor: 'rgba(34, 197, 94, 0.05)'
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
                <p style={{ margin: '0 0 var(--spacing-md) 0' }}>{message.content}</p>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <span className="status-badge status-success">
                    departure ready
                  </span>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAcknowledgeDeparture(message)}
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedMessage && (
        <Modal
          title="Process Passenger Removal Request"
          onClose={() => {
            setShowModal(false);
            setSelectedMessage(null);
            setError('');
          }}
        >
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <p><strong>Request Details:</strong></p>
            <p style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)'
            }}>
              {selectedMessage.content}
            </p>
          </div>

          <div className="error-message" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <strong>Action to be taken:</strong>
            <ul style={{ marginTop: 'var(--spacing-sm)', marginBottom: 0, paddingLeft: 'var(--spacing-lg)' }}>
              <li>Verify passenger has no remaining bags in system</li>
              <li>Remove passenger from the system permanently</li>
              <li>Mark this request as processed</li>
            </ul>
          </div>

          <ErrorMessage message={error} />

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowModal(false);
                setSelectedMessage(null);
                setError('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleRemovePassenger}
            >
              Remove Passenger
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminMessages;
