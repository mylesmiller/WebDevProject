import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useFlights from '../../hooks/useFlights';
import usePassengers from '../../hooks/usePassengers';
import useBags from '../../hooks/useBags';
import useMessages from '../../hooks/useMessages';
import Table from '../common/Table';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { PASSENGER_STATUS, FLIGHT_STATUS, MESSAGE_BOARDS, MESSAGE_PRIORITY } from '../../utils/constants';
import { getPassengerStatusDisplayName, formatDate, getBagLocationDisplayName } from '../../utils/helpers';
import { validateGate } from '../../utils/validators';
import '../../styles/dashboard.css';

const BoardingPanel = ({ selectedFlight, setSelectedFlight }) => {
  const { currentUser } = useAuth();
  const { getFlightsByAirline, updateFlight, changeGate } = useFlights();
  const { getPassengersByFlight, boardPassenger } = usePassengers();
  const { areAllBagsLoaded, getUnloadedBags, arePassengerBagsAtGate, hasPassengerSecurityViolation, getPassengerBagsNotAtGate, getBagsByPassenger } = useBags();
  const { addMessage } = useMessages();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGateModal, setShowGateModal] = useState(false);
  const [newGate, setNewGate] = useState('');

  const flights = getFlightsByAirline(currentUser.airline);

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    setError('');
    setSuccess('');
  };

  const handleBoardPassenger = (passengerId) => {
    setError('');
    setSuccess('');

    // Validate flight consistency - passenger's flight must match selected gate flight
    const passenger = getPassengersByFlight(selectedFlight.id).find(p => p.id === passengerId);
    if (!passenger) {
      setError('Passenger is not assigned to this flight. Flight information is inconsistent.');
      return;
    }

    if (passenger.flightId !== selectedFlight.id) {
      setError(`Flight mismatch: Passenger is on flight ${passenger.flightId} but gate is serving flight ${selectedFlight.flightNumber}. Cannot board.`);
      return;
    }

    // Check if passenger has a security violation on any bag
    if (hasPassengerSecurityViolation(passengerId)) {
      setError('Cannot board passenger. One or more bags have a security violation. The passenger must be removed.');
      return;
    }

    // Check if all of this passenger's bags have arrived at the gate
    if (!arePassengerBagsAtGate(passengerId)) {
      const bagsNotAtGate = getPassengerBagsNotAtGate(passengerId);
      const bagList = bagsNotAtGate.map(b => `${b.id} (${getBagLocationDisplayName(b.location)})`).join(', ');
      setError(`Cannot board passenger. Not all bags have arrived at the gate. Pending bags: ${bagList}`);
      return;
    }

    try {
      boardPassenger(passengerId, currentUser.id);
      setSuccess('Passenger boarded successfully');

      // Refresh flight selection to update status
      const updatedFlights = getFlightsByAirline(currentUser.airline);
      const updatedFlight = updatedFlights.find(f => f.id === selectedFlight.id);
      setSelectedFlight(updatedFlight);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateFlightStatus = (status) => {
    setError('');
    setSuccess('');

    try {
      updateFlight(selectedFlight.id, { status });
      setSuccess(`Flight status updated to ${status}`);

      // Refresh flight selection
      const updatedFlights = getFlightsByAirline(currentUser.airline);
      const updatedFlight = updatedFlights.find(f => f.id === selectedFlight.id);
      setSelectedFlight(updatedFlight);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenGateModal = () => {
    setShowGateModal(true);
    setNewGate(selectedFlight.gate);
    setError('');
  };

  const handleChangeGate = () => {
    setError('');
    setSuccess('');

    try {
      if (!newGate || !newGate.trim()) {
        setError('Gate is required');
        return;
      }

      const gateError = validateGate(newGate);
      if (gateError) {
        setError(gateError);
        return;
      }

      const result = changeGate(selectedFlight.id, newGate.toUpperCase());

      // Send notification to ground staff
      const messageContent = `GATE CHANGE - Flight ${result.flight.flightNumber} gate changed from ${result.oldGate} to ${result.newGate}. Please update baggage routing accordingly.`;

      addMessage(MESSAGE_BOARDS.GROUND, {
        author: currentUser.name,
        content: messageContent,
        priority: MESSAGE_PRIORITY.HIGH
      });

      setSuccess(`Gate changed from ${result.oldGate} to ${result.newGate}. Ground staff has been notified.`);
      setShowGateModal(false);
      setNewGate('');

      // Refresh flight selection
      const updatedFlights = getFlightsByAirline(currentUser.airline);
      const updatedFlight = updatedFlights.find(f => f.id === selectedFlight.id);
      setSelectedFlight(updatedFlight);
    } catch (err) {
      setError(err.message);
    }
  };

  const flightColumns = [
    { header: 'Flight', accessor: 'flightNumber' },
    { header: 'Gate', accessor: 'gate' },
    { header: 'Destination', accessor: 'destination' },
    { header: 'Departure', render: (row) => formatDate(row.departureTime) },
    { header: 'Status', render: (row) => <span className={`status-badge status-${row.status}`}>{row.status}</span> },
    {
      header: 'Actions',
      render: (row) => (
        <button className="btn btn-primary btn-sm" onClick={() => handleSelectFlight(row)}>
          Select
        </button>
      )
    }
  ];

  return (
    <div>
      <h2 className="mb-lg">Boarding Management</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <h3 className="mb-md">Select Flight</h3>
        <Table
          columns={flightColumns}
          data={flights}
          searchFields={['flightNumber', 'destination']}
          emptyMessage="No flights available"
        />
      </div>

      {selectedFlight && (
        <>
          <div className="card mb-lg">
            <h3 className="mb-md">Flight: {selectedFlight.flightNumber}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div>
                <strong>Gate:</strong> {selectedFlight.gate}
              </div>
              <div>
                <strong>Destination:</strong> {selectedFlight.destination}
              </div>
              <div>
                <strong>Departure:</strong> {formatDate(selectedFlight.departureTime)}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={`status-badge status-${selectedFlight.status}`}>
                  {selectedFlight.status}
                </span>
              </div>
            </div>

            <div className="mb-lg">
              <h4 className="mb-sm">Bag Status</h4>
              {areAllBagsLoaded(selectedFlight.id) ? (
                <div className="success-message">All bags are loaded onto aircraft</div>
              ) : (
                <div className="error-message">
                  {getUnloadedBags(selectedFlight.id).length} bag(s) not yet loaded onto aircraft
                  <ul style={{ marginTop: 'var(--spacing-sm)' }}>
                    {getUnloadedBags(selectedFlight.id).map(bag => (
                      <li key={bag.id}>
                        Bag {bag.id} - Current location: {getBagLocationDisplayName(bag.location)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="btn-group">
              <button
                className="btn btn-primary"
                onClick={handleOpenGateModal}
                disabled={selectedFlight.status === FLIGHT_STATUS.DEPARTED}
              >
                Change Gate
              </button>
              <button
                className="btn btn-warning"
                onClick={() => handleUpdateFlightStatus(FLIGHT_STATUS.BOARDING)}
                disabled={selectedFlight.status === FLIGHT_STATUS.BOARDING}
              >
                Start Boarding
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleUpdateFlightStatus(FLIGHT_STATUS.DEPARTED)}
                disabled={!areAllBagsLoaded(selectedFlight.id)}
              >
                Mark as Departed
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-md">Passengers</h3>
            <Table
              columns={[
                { header: 'Passenger ID', accessor: 'id' },
                { header: 'Name', accessor: 'name' },
                { header: 'Ticket Number', accessor: 'ticketNumber' },
                {
                  header: 'Status',
                  render: (row) => (
                    <span className={`status-badge status-${row.status}`}>
                      {getPassengerStatusDisplayName(row.status)}
                    </span>
                  )
                },
                { header: 'Bags', render: (row) => row.bagIds.length },
                {
                  header: 'Bag Check',
                  render: (row) => {
                    if (hasPassengerSecurityViolation(row.id)) {
                      return <span className="status-badge status-security-violation">Security Violation</span>;
                    }
                    if (!arePassengerBagsAtGate(row.id)) {
                      return <span className="status-badge status-pending">Bags Pending</span>;
                    }
                    return <span className="status-badge status-gate">Bags at Gate</span>;
                  }
                },
                {
                  header: 'Actions',
                  render: (row) => {
                    const hasSecurity = hasPassengerSecurityViolation(row.id);
                    const bagsReady = arePassengerBagsAtGate(row.id);
                    const canBoard = row.status === PASSENGER_STATUS.CHECKED_IN && bagsReady && !hasSecurity;

                    return (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleBoardPassenger(row.id)}
                        disabled={!canBoard}
                      >
                        {row.status === PASSENGER_STATUS.BOARDED ? 'Boarded' : hasSecurity ? 'Denied' : 'Board'}
                      </button>
                    );
                  }
                }
              ]}
              data={getPassengersByFlight(selectedFlight.id)}
              searchFields={['name', 'id', 'ticketNumber']}
              emptyMessage="No passengers on this flight"
            />
          </div>
        </>
      )}

      {showGateModal && selectedFlight && (
        <Modal
          title="Change Gate"
          onClose={() => {
            setShowGateModal(false);
            setNewGate('');
            setError('');
          }}
        >
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <p><strong>Flight:</strong> {selectedFlight.flightNumber}</p>
            <p><strong>Current Gate:</strong> {selectedFlight.gate}</p>
            <p><strong>Destination:</strong> {selectedFlight.destination}</p>
          </div>

          <FormInput
            label="New Gate"
            name="newGate"
            value={newGate}
            onChange={(e) => setNewGate(e.target.value)}
            validator={validateGate}
            placeholder="e.g., A12"
            required
          />

          <ErrorMessage message={error} />

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-md)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowGateModal(false);
                setNewGate('');
                setError('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleChangeGate}
            >
              Change Gate
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BoardingPanel;
