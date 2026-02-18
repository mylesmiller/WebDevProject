import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useFlights from '../../hooks/useFlights';
import usePassengers from '../../hooks/usePassengers';
import useBags from '../../hooks/useBags';
import FormInput from '../common/FormInput';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { validateTicketNumber, validateBagId } from '../../utils/validators';
import { PASSENGER_STATUS } from '../../utils/constants';
import { getPassengerStatusDisplayName, formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const CheckInPanel = () => {
  const { currentUser } = useAuth();
  const { getFlightsByAirline } = useFlights();
  const { getPassengerByTicket, checkInPassenger } = usePassengers();
  const { addBag, getBagsByPassenger } = useBags();

  const [ticketNumber, setTicketNumber] = useState('');
  const [passenger, setPassenger] = useState(null);
  const [bagId, setBagId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const flights = getFlightsByAirline(currentUser.airline);

  const handleSearchPassenger = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPassenger(null);

    // Validate ticket number format before searching
    const ticketError = validateTicketNumber(ticketNumber);
    if (ticketError) {
      setError(ticketError);
      return;
    }

    try {
      const foundPassenger = getPassengerByTicket(ticketNumber.trim());

      if (!foundPassenger) {
        setError('Passenger not found with this ticket number');
        return;
      }

      // Check if passenger is on this airline
      const passengerFlight = flights.find(f => f.id === foundPassenger.flightId);
      if (!passengerFlight) {
        setError('This passenger is not on a flight for your airline');
        return;
      }

      setPassenger(foundPassenger);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckIn = () => {
    setError('');
    setSuccess('');

    try {
      checkInPassenger(passenger.id, currentUser.id);
      setSuccess('Passenger checked in successfully');
      setPassenger({ ...passenger, status: PASSENGER_STATUS.CHECKED_IN });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddBag = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate bag ID format before adding
    const bagError = validateBagId(bagId);
    if (bagError) {
      setError(bagError);
      return;
    }

    try {
      addBag({ bagId, ticketNumber: passenger.ticketNumber }, currentUser.id);
      setSuccess(`Bag ${bagId} added successfully`);
      setBagId('');

      // Refresh passenger data
      const updatedPassenger = getPassengerByTicket(passenger.ticketNumber);
      setPassenger(updatedPassenger);
    } catch (err) {
      setError(err.message);
    }
  };

  const getFlightInfo = (flightId) => {
    const flight = flights.find(f => f.id === flightId);
    return flight || null;
  };

  return (
    <div>
      <h2 className="mb-lg">Passenger Check-In</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <h3 className="mb-md">Search Passenger</h3>
        <form onSubmit={handleSearchPassenger}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Ticket Number"
                name="ticketNumber"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                validator={validateTicketNumber}
                placeholder="10 digits"
                required
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--spacing-md)' }}>
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {passenger && passenger.status === PASSENGER_STATUS.BOARDED && (
        <div className="card">
          <h3 className="mb-md">Passenger Already Boarded</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <strong>Name:</strong> {passenger.name}
            </div>
            <div>
              <strong>Ticket Number:</strong> {passenger.ticketNumber}
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <span className={`status-badge status-${passenger.status}`}>
                {getPassengerStatusDisplayName(passenger.status)}
              </span>
            </div>
          </div>
          <p className="text-muted">This passenger has already boarded the aircraft.</p>
        </div>
      )}

      {passenger && passenger.status === PASSENGER_STATUS.NOT_CHECKED_IN && (
        <div className="card">
          <h3 className="mb-md">Confirm Passenger</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <strong>Name:</strong> {passenger.name}
            </div>
            <div>
              <strong>Ticket Number:</strong> {passenger.ticketNumber}
            </div>
          </div>

          <button className="btn btn-success mb-lg" onClick={handleCheckIn}>
            Check In Passenger
          </button>
        </div>
      )}

      {passenger && passenger.status === PASSENGER_STATUS.CHECKED_IN && (
        <div className="card">
          <h3 className="mb-md">Passenger Details</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
            <div>
              <strong>Name:</strong> {passenger.name}
            </div>
            <div>
              <strong>Passenger ID:</strong> {passenger.id}
            </div>
            <div>
              <strong>Ticket Number:</strong> {passenger.ticketNumber}
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <span className={`status-badge status-${passenger.status}`}>
                {getPassengerStatusDisplayName(passenger.status)}
              </span>
            </div>
            {getFlightInfo(passenger.flightId) && (
              <>
                <div>
                  <strong>Flight:</strong> {getFlightInfo(passenger.flightId).flightNumber}
                </div>
                <div>
                  <strong>Gate:</strong> {getFlightInfo(passenger.flightId).gate}
                </div>
                <div>
                  <strong>Destination:</strong> {getFlightInfo(passenger.flightId).destination}
                </div>
                <div>
                  <strong>Departure:</strong> {formatDate(getFlightInfo(passenger.flightId).departureTime)}
                </div>
              </>
            )}
            <div>
              <strong>Bags:</strong> {passenger.bagIds.length}
            </div>
          </div>

          {passenger.bagIds.length > 0 && (
            <div className="mb-lg">
              <h4 className="mb-md">Checked Bags</h4>
              {getBagsByPassenger(passenger.id).map(bag => {
                const bagFlight = getFlightInfo(bag.flightId);
                return (
                  <div key={bag.id} className="card mb-sm" style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-sm)' }}>
                      <div><strong>Bag ID:</strong> {bag.id}</div>
                      <div><strong>Ticket:</strong> {bag.ticketNumber}</div>
                      <div><strong>Flight:</strong> {bagFlight ? bagFlight.flightNumber : '-'}</div>
                      <div><strong>Destination:</strong> {bagFlight ? (bagFlight.destination || '-') : '-'}</div>
                      <div><strong>Gate:</strong> {bagFlight ? bagFlight.gate : '-'}</div>
                      <div><strong>Location:</strong> {bag.location}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <h4 className="mb-md">Add Bag</h4>
            <form onSubmit={handleAddBag}>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <div style={{ flex: 1 }}>
                  <FormInput
                    label="Bag ID"
                    name="bagId"
                    value={bagId}
                    onChange={(e) => setBagId(e.target.value)}
                    validator={validateBagId}
                    placeholder="6 digits"
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--spacing-md)' }}>
                  <button type="submit" className="btn btn-primary">
                    Add Bag
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInPanel;
