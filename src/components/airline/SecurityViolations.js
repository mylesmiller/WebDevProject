import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useMessages from '../../hooks/useMessages';
import useBags from '../../hooks/useBags';
import usePassengers from '../../hooks/usePassengers';
import useFlights from '../../hooks/useFlights';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Modal from '../common/Modal';
import { MESSAGE_BOARDS, MESSAGE_PRIORITY, BAG_LOCATIONS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const SecurityViolations = () => {
  const { currentUser } = useAuth();
  const { getAirlineMessages, addMessage, deleteMessage } = useMessages();
  const { getAllBags, removeBag } = useBags();
  const { getPassengerById } = usePassengers();
  const { getFlightById } = useFlights();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter messages to show only security violations
  const messages = getAirlineMessages(currentUser.airline).filter(msg =>
    msg.content.includes('SECURITY VIOLATION')
  );

  const extractPassengerId = (messageContent) => {
    // Extract passenger ID from message content
    const match = messageContent.match(/ID:\s*(\d{6})/);
    return match ? match[1] : null;
  };

  const extractTicketNumber = (messageContent) => {
    // Extract ticket number from message content
    const match = messageContent.match(/Ticket:\s*(\d{10})/);
    return match ? match[1] : null;
  };

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleRemovePassengerBags = () => {
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
        setError('Passenger not found');
        return;
      }

      // Get all bags for this passenger
      const allBags = getAllBags();
      const passengerBags = allBags.filter(bag => bag.passengerId === passengerId);

      if (passengerBags.length === 0) {
        setError('No bags found for this passenger');
        return;
      }

      // Remove all bags
      passengerBags.forEach(bag => {
        removeBag(bag.id);
      });

      // Send message to Admin to remove passenger
      const adminMessage = `PASSENGER REMOVAL REQUEST - Passenger: ${passenger.name} (ID: ${passengerId}), Ticket: ${ticketNumber}. Reason: Security violation detected. All ${passengerBags.length} bag(s) have been removed. Please remove passenger from the system.`;

      addMessage(MESSAGE_BOARDS.AIRLINE, {
        author: currentUser.name,
        airline: 'ADMIN',
        content: adminMessage,
        priority: MESSAGE_PRIORITY.HIGH
      });

      // Delete the security violation message
      deleteMessage(MESSAGE_BOARDS.AIRLINE, selectedMessage.id);

      setSuccess(`Removed ${passengerBags.length} bag(s). Admin has been notified to remove passenger.`);
      setShowModal(false);
      setSelectedMessage(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-lg">Security Violations - {currentUser.airline}</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card">
        <h3 className="mb-md">Security Violation Alerts</h3>
        {messages.length === 0 ? (
          <p className="text-muted text-center">No security violations reported</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {messages.map(message => (
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
                    Handle Violation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedMessage && (
        <Modal
          title="Handle Security Violation"
          onClose={() => {
            setShowModal(false);
            setSelectedMessage(null);
            setError('');
          }}
        >
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <p><strong>Message:</strong></p>
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
              <li>Remove all bags checked in by this passenger</li>
              <li>Send notification to Administrator to remove passenger from system</li>
              <li>Mark this violation as handled</li>
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
              onClick={handleRemovePassengerBags}
            >
              Remove Bags & Notify Admin
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SecurityViolations;
