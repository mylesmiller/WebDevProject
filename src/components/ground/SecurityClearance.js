import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useBags from '../../hooks/useBags';
import usePassengers from '../../hooks/usePassengers';
import useFlights from '../../hooks/useFlights';
import useMessages from '../../hooks/useMessages';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { BAG_LOCATIONS, MESSAGE_BOARDS, MESSAGE_PRIORITY } from '../../utils/constants';
import { getBagLocationDisplayName, formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const SecurityClearance = () => {
  const { currentUser } = useAuth();
  const { getAllBags, updateBagLocation, refreshBags } = useBags();
  const { getPassengerById } = usePassengers();
  const { getFlightById } = useFlights();
  const { addMessage } = useMessages();
  const [selectedBag, setSelectedBag] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Only show bags at check-in (waiting for security check)
  const bagsAtCheckIn = getAllBags().filter(b => b.location === BAG_LOCATIONS.CHECK_IN);

  const getPassengerInfo = (passengerId) => {
    const passenger = getPassengerById(passengerId);
    return passenger ? `${passenger.name} (${passenger.id})` : 'N/A';
  };

  const getFlightInfo = (flightId) => {
    const flight = getFlightById(flightId);
    return flight ? `${flight.flightNumber} - Gate ${flight.gate}` : 'N/A';
  };

  const handleSelectBag = (bag) => {
    setSelectedBag(bag);
    setError('');
    setSuccess('');
  };

  const handleClearBag = () => {
    setError('');
    setSuccess('');

    try {
      updateBagLocation(selectedBag.id, BAG_LOCATIONS.GATE, currentUser.id);
      setSuccess(`Bag ${selectedBag.id} cleared and sent to gate.`);
      setSelectedBag(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSecurityViolation = () => {
    setError('');
    setSuccess('');

    try {
      const passenger = getPassengerById(selectedBag.passengerId);
      const flight = getFlightById(selectedBag.flightId);

      if (!passenger || !flight) {
        setError('Unable to find passenger or flight information');
        return;
      }

      // Update bag location to security violation
      updateBagLocation(selectedBag.id, BAG_LOCATIONS.SECURITY_VIOLATION, currentUser.id);

      // Send message to airline staff about security violation
      const messageContent = `SECURITY VIOLATION - Bag ID: ${selectedBag.id}, Passenger: ${passenger.name} (ID: ${passenger.id}), Ticket: ${passenger.ticketNumber}, Flight: ${flight.flightNumber}. Security violation detected during screening. Please remove passenger bags and notify admin to remove passenger.`;

      addMessage(MESSAGE_BOARDS.AIRLINE, {
        author: currentUser.name,
        airline: flight.airline,
        content: messageContent,
        priority: MESSAGE_PRIORITY.HIGH
      });

      setSuccess('Security violation flagged. Airline staff has been notified.');
      setSelectedBag(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-lg">Security Clearance</h2>
      <p className="text-muted mb-lg">
        Bags arriving from check-in counters waiting for security screening. Clear bags to send them to the gate, or flag security violations.
      </p>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3>Bags Awaiting Security Check ({bagsAtCheckIn.length})</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => { refreshBags(); setSuccess('Bag list refreshed.'); }}>
            Refresh
          </button>
        </div>
        {bagsAtCheckIn.length === 0 ? (
          <p className="text-muted text-center">No bags waiting for security check</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bag ID</th>
                  <th>Ticket Number</th>
                  <th>Passenger</th>
                  <th>Flight</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bagsAtCheckIn.map(bag => (
                  <tr key={bag.id} style={selectedBag && selectedBag.id === bag.id ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}>
                    <td>{bag.id}</td>
                    <td>{bag.ticketNumber}</td>
                    <td>{getPassengerInfo(bag.passengerId)}</td>
                    <td>{getFlightInfo(bag.flightId)}</td>
                    <td>
                      <span className={`status-badge status-${bag.location}`}>
                        {getBagLocationDisplayName(bag.location)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleSelectBag(bag)}>
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedBag && (
        <div className="card">
          <h3 className="mb-md">Screening Bag: {selectedBag.id}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <strong>Bag ID:</strong> {selectedBag.id}
            </div>
            <div>
              <strong>Ticket Number:</strong> {selectedBag.ticketNumber}
            </div>
            <div>
              <strong>Passenger:</strong> {getPassengerInfo(selectedBag.passengerId)}
            </div>
            <div>
              <strong>Flight:</strong> {getFlightInfo(selectedBag.flightId)}
            </div>
            <div>
              <strong>Current Location:</strong>{' '}
              <span className={`status-badge status-${selectedBag.location}`}>
                {getBagLocationDisplayName(selectedBag.location)}
              </span>
            </div>
          </div>

          {selectedBag.timeline && selectedBag.timeline.length > 0 && (
            <div className="mb-lg">
              <h4 className="mb-sm">Timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {selectedBag.timeline.map((entry, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '3px solid var(--primary-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{getBagLocationDisplayName(entry.location)}</strong>
                      <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                      Handled by: {entry.handledBy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="btn-group">
            <button
              className="btn btn-success"
              onClick={handleClearBag}
            >
              Clear - Send to Gate
            </button>
            <button
              className="btn btn-danger"
              onClick={handleSecurityViolation}
            >
              Security Violation - Send Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityClearance;
