import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useBags from '../../hooks/useBags';
import usePassengers from '../../hooks/usePassengers';
import useFlights from '../../hooks/useFlights';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { BAG_LOCATIONS, PASSENGER_STATUS } from '../../utils/constants';
import { getBagLocationDisplayName, getPassengerStatusDisplayName, formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const GateWork = () => {
  const { currentUser } = useAuth();
  const { getAllBags, updateBagLocation, refreshBags } = useBags();
  const { getPassengerById, refreshPassengers } = usePassengers();
  const { getAllFlights, getFlightById } = useFlights();
  const [selectedGate, setSelectedGate] = useState('');
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const allFlights = getAllFlights();

  // Get unique gates with active flights
  const gateOptions = allFlights
    .filter(f => f.status !== 'departed' && f.status !== 'cancelled')
    .map(f => ({ gate: f.gate, flightId: f.id, flightNumber: f.flightNumber, destination: f.destination }));

  const handleSelectGate = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedGate) {
      setError('Please select a gate');
      return;
    }

    const gateInfo = gateOptions.find(g => g.gate === selectedGate);
    if (!gateInfo) {
      setError('No active flight at this gate');
      return;
    }

    const flight = getFlightById(gateInfo.flightId);
    if (!flight) {
      setError('Flight not found');
      return;
    }

    setSelectedFlight(flight);
  };

  const handleBackToGateSelection = () => {
    setSelectedFlight(null);
    setSelectedGate('');
    setError('');
    setSuccess('');
  };

  const handleRefresh = () => {
    refreshPassengers();
    refreshBags();
    setError('');
    setSuccess('Boarding status refreshed.');
  };

  // Get bags at this gate that need to be loaded
  const gateBags = selectedFlight
    ? getAllBags().filter(b => b.flightId === selectedFlight.id && b.location === BAG_LOCATIONS.GATE)
    : [];

  // Get bags already loaded for this flight
  const loadedBags = selectedFlight
    ? getAllBags().filter(b => b.flightId === selectedFlight.id && b.location === BAG_LOCATIONS.LOADED)
    : [];

  const handleLoadBag = (bag) => {
    setError('');
    setSuccess('');

    try {
      const passenger = getPassengerById(bag.passengerId);

      if (!passenger) {
        setError('Passenger not found for this bag');
        return;
      }

      if (passenger.status !== PASSENGER_STATUS.BOARDED) {
        setError(`Cannot load bag - passenger ${passenger.name} has not boarded yet (status: ${getPassengerStatusDisplayName(passenger.status)})`);
        return;
      }

      updateBagLocation(bag.id, BAG_LOCATIONS.LOADED, currentUser.id);
      setSuccess(`Bag ${bag.id} loaded onto aircraft for passenger ${passenger.name}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const getPassengerInfo = (passengerId) => {
    const passenger = getPassengerById(passengerId);
    return passenger || null;
  };

  return (
    <div>
      <h2 className="mb-lg">Gate Work</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {!selectedFlight ? (
        <div className="card">
          <h3 className="mb-md">Select a Gate to Work At</h3>
          <p className="text-muted mb-md">
            Choose a gate with an active flight to begin loading bags.
          </p>
          <form onSubmit={handleSelectGate}>
            <div className="form-group">
              <label className="form-label">
                Gate <span style={{ color: 'var(--danger-color)' }}> *</span>
              </label>
              <select
                className="form-select"
                value={selectedGate}
                onChange={(e) => setSelectedGate(e.target.value)}
                required
              >
                <option value="">Select a gate</option>
                {gateOptions.map(option => (
                  <option key={option.gate} value={option.gate}>
                    Gate {option.gate} - {option.flightNumber}{option.destination ? ` to ${option.destination}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Start Working at Gate
            </button>
          </form>

          {gateOptions.length === 0 && (
            <div className="error-message mt-md">
              No active flights at any gate. Please check back later.
            </div>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleBackToGateSelection}>
              &larr; Change Gate
            </button>
          </div>

          <div className="card mb-lg">
            <h3 className="mb-md">Gate Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <strong>Gate Number:</strong> {selectedFlight.gate}
              </div>
              <div>
                <strong>Flight Number:</strong> {selectedFlight.flightNumber}
              </div>
              {selectedFlight.destination && (
                <div>
                  <strong>Destination:</strong> {selectedFlight.destination}
                </div>
              )}
              {selectedFlight.departureTime && (
                <div>
                  <strong>Departure:</strong> {formatDate(selectedFlight.departureTime)}
                </div>
              )}
              <div>
                <strong>Flight Status:</strong>{' '}
                <span className={`status-badge status-${selectedFlight.status}`}>
                  {selectedFlight.status}
                </span>
              </div>
              <div>
                <strong>Bags to Load:</strong> {gateBags.length}
              </div>
              <div>
                <strong>Bags Loaded:</strong> {loadedBags.length}
              </div>
            </div>
          </div>

          <div className="card mb-lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3>Bags to Load ({gateBags.length})</h3>
              <button className="btn btn-secondary btn-sm" onClick={handleRefresh}>
                Refresh Boarding Status
              </button>
            </div>
            <p className="text-muted mb-md">
              Load bags onto the aircraft once the passenger has boarded. Click "Refresh Boarding Status" if a passenger recently boarded in another session.
            </p>
            {gateBags.length === 0 ? (
              <div className="success-message">All bags at this gate have been loaded.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {gateBags.map(bag => {
                  const passenger = getPassengerInfo(bag.passengerId);

                  return (
                    <div
                      key={bag.id}
                      className="card"
                      style={{
                        borderLeft: `4px solid ${passenger && passenger.status === PASSENGER_STATUS.BOARDED ? 'var(--success-color)' : 'var(--warning-color)'}`
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                        <div>
                          <strong>Bag ID:</strong> {bag.id}
                        </div>
                        <div>
                          <strong>Ticket Number:</strong> {bag.ticketNumber}
                        </div>
                        <div>
                          <strong>Passenger:</strong> {passenger ? `${passenger.name} (${passenger.id})` : 'N/A'}
                        </div>
                        <div>
                          <strong>Passenger Status:</strong>{' '}
                          <span className={`status-badge status-${passenger ? passenger.status : 'unknown'}`}>
                            {passenger ? getPassengerStatusDisplayName(passenger.status) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {passenger && passenger.status === PASSENGER_STATUS.BOARDED ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleLoadBag(bag)}
                        >
                          Load onto Aircraft
                        </button>
                      ) : (
                        <div className="error-message" style={{ fontSize: 'var(--text-sm)' }}>
                          Waiting for passenger to board before loading bag
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {loadedBags.length > 0 && (
            <div className="card">
              <h3 className="mb-md">Loaded Bags ({loadedBags.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bag ID</th>
                      <th>Ticket Number</th>
                      <th>Passenger</th>
                      <th>Status</th>
                      <th>Loaded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadedBags.map(bag => {
                      const lastTimeline = bag.timeline[bag.timeline.length - 1];
                      const passenger = getPassengerInfo(bag.passengerId);
                      return (
                        <tr key={bag.id}>
                          <td>{bag.id}</td>
                          <td>{bag.ticketNumber}</td>
                          <td>{passenger ? `${passenger.name} (${passenger.id})` : 'N/A'}</td>
                          <td>
                            <span className="status-badge status-loaded">
                              {getBagLocationDisplayName(BAG_LOCATIONS.LOADED)}
                            </span>
                          </td>
                          <td>{lastTimeline ? formatDate(lastTimeline.timestamp) : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GateWork;
