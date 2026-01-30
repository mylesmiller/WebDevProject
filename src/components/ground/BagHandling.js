import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useBags from '../../hooks/useBags';
import usePassengers from '../../hooks/usePassengers';
import useFlights from '../../hooks/useFlights';
import Table from '../common/Table';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { BAG_LOCATIONS, PASSENGER_STATUS } from '../../utils/constants';
import { getBagLocationDisplayName, formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const BagHandling = () => {
  const { currentUser } = useAuth();
  const { getAllBags, updateBagLocation } = useBags();
  const { getPassengerById } = usePassengers();
  const { getFlightById } = useFlights();
  const [selectedBag, setSelectedBag] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');

  const allBags = getAllBags();
  const bags = locationFilter === 'all' ? allBags : allBags.filter(b => b.location === locationFilter);

  const handleSelectBag = (bag) => {
    setSelectedBag(bag);
    setError('');
    setSuccess('');
  };

  const handleUpdateLocation = (newLocation) => {
    setError('');
    setSuccess('');

    try {
      updateBagLocation(selectedBag.id, newLocation, currentUser.id);
      setSuccess(`Bag moved to ${getBagLocationDisplayName(newLocation)}`);

      // Refresh bag selection
      const updatedBags = getAllBags();
      const updatedBag = updatedBags.find(b => b.id === selectedBag.id);
      setSelectedBag(updatedBag);
    } catch (err) {
      setError(err.message);
    }
  };

  const getNextLocation = (currentLocation) => {
    const sequence = [
      BAG_LOCATIONS.CHECK_IN,
      BAG_LOCATIONS.SECURITY,
      BAG_LOCATIONS.GATE,
      BAG_LOCATIONS.LOADED
    ];
    const currentIndex = sequence.indexOf(currentLocation);
    return currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null;
  };

  const getPassengerInfo = (passengerId) => {
    const passenger = getPassengerById(passengerId);
    return passenger ? `${passenger.name} (${passenger.id})` : 'N/A';
  };

  const getFlightInfo = (flightId) => {
    const flight = getFlightById(flightId);
    return flight ? `${flight.flightNumber} - Gate ${flight.gate}` : 'N/A';
  };

  const canLoadBag = (bag) => {
    const passenger = getPassengerById(bag.passengerId);
    return passenger && passenger.status === PASSENGER_STATUS.BOARDED;
  };

  const columns = [
    { header: 'Bag ID', accessor: 'id' },
    { header: 'Ticket Number', accessor: 'ticketNumber' },
    { header: 'Passenger', render: (row) => getPassengerInfo(row.passengerId) },
    { header: 'Flight', render: (row) => getFlightInfo(row.flightId) },
    {
      header: 'Location',
      render: (row) => (
        <span className={`status-badge status-${row.location}`}>
          {getBagLocationDisplayName(row.location)}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button className="btn btn-primary btn-sm" onClick={() => handleSelectBag(row)}>
          Select
        </button>
      )
    }
  ];

  return (
    <div>
      <h2 className="mb-lg">Bag Handling</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Filter by Location:</label>
          <select
            className="form-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="all">All Locations</option>
            <option value={BAG_LOCATIONS.CHECK_IN}>Check-In</option>
            <option value={BAG_LOCATIONS.SECURITY}>Security</option>
            <option value={BAG_LOCATIONS.GATE}>Gate</option>
            <option value={BAG_LOCATIONS.LOADED}>Loaded</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={bags}
          searchFields={['id', 'ticketNumber']}
          emptyMessage="No bags available"
        />
      </div>

      {selectedBag && (
        <div className="card">
          <h3 className="mb-md">Bag Details: {selectedBag.id}</h3>

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
                    borderLeft: `3px solid var(--primary-color)`
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

          <div className="btn-group">
            {selectedBag.location === BAG_LOCATIONS.CHECK_IN && (
              <button
                className="btn btn-primary"
                onClick={() => handleUpdateLocation(BAG_LOCATIONS.SECURITY)}
              >
                Move to Security
              </button>
            )}
            {selectedBag.location === BAG_LOCATIONS.SECURITY && (
              <button
                className="btn btn-primary"
                onClick={() => handleUpdateLocation(BAG_LOCATIONS.GATE)}
              >
                Move to Gate
              </button>
            )}
            {selectedBag.location === BAG_LOCATIONS.GATE && (
              <>
                {canLoadBag(selectedBag) ? (
                  <button
                    className="btn btn-success"
                    onClick={() => handleUpdateLocation(BAG_LOCATIONS.LOADED)}
                  >
                    Load onto Aircraft
                  </button>
                ) : (
                  <div className="error-message">
                    Passenger must be boarded before loading bags
                  </div>
                )}
              </>
            )}
            {selectedBag.location === BAG_LOCATIONS.LOADED && (
              <div className="success-message">Bag is loaded on aircraft</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BagHandling;
