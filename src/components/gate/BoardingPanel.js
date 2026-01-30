import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useFlights from '../../hooks/useFlights';
import usePassengers from '../../hooks/usePassengers';
import useBags from '../../hooks/useBags';
import Table from '../common/Table';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { PASSENGER_STATUS, FLIGHT_STATUS } from '../../utils/constants';
import { getPassengerStatusDisplayName, formatDate, getBagLocationDisplayName } from '../../utils/helpers';
import '../../styles/dashboard.css';

const BoardingPanel = () => {
  const { currentUser } = useAuth();
  const { getFlightsByAirline, updateFlight } = useFlights();
  const { getPassengersByFlight, boardPassenger } = usePassengers();
  const { getBagsByFlight, areAllBagsLoaded, getUnloadedBags } = useBags();
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const flights = getFlightsByAirline(currentUser.airline);

  const handleSelectFlight = (flight) => {
    setSelectedFlight(flight);
    setError('');
    setSuccess('');
  };

  const handleBoardPassenger = (passengerId) => {
    setError('');
    setSuccess('');

    // Check if all bags are loaded
    if (!areAllBagsLoaded(selectedFlight.id)) {
      setError('Cannot board passengers until all bags are loaded');
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
                <div className="success-message">All bags are loaded</div>
              ) : (
                <div className="error-message">
                  {getUnloadedBags(selectedFlight.id).length} bag(s) not yet loaded
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
                  header: 'Actions',
                  render: (row) => (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleBoardPassenger(row.id)}
                      disabled={row.status !== PASSENGER_STATUS.CHECKED_IN}
                    >
                      {row.status === PASSENGER_STATUS.BOARDED ? 'Boarded' : 'Board'}
                    </button>
                  )
                }
              ]}
              data={getPassengersByFlight(selectedFlight.id)}
              searchFields={['name', 'id', 'ticketNumber']}
              emptyMessage="No passengers on this flight"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BoardingPanel;
