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
import { getPassengerStatusDisplayName, formatDate, getBagLocationDisplayName } from '../../utils/helpers';
import '../../styles/dashboard.css';

const BagManagement = () => {
  const { currentUser } = useAuth();
  const { getFlightsByAirline } = useFlights();
  const { getPassengerByTicket } = usePassengers();
  const { addBag, getBagsByPassenger } = useBags();

  const [ticketNumber, setTicketNumber] = useState('');
  const [passenger, setPassenger] = useState(null);
  const [flight, setFlight] = useState(null);
  const [bagId, setBagId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addedBag, setAddedBag] = useState(null);

  const flights = getFlightsByAirline(currentUser.airline);

  const handleSearchPassenger = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPassenger(null);
    setFlight(null);
    setAddedBag(null);

    try {
      const foundPassenger = getPassengerByTicket(ticketNumber);

      if (!foundPassenger) {
        setError('Passenger not found with this ticket number');
        return;
      }

      const passengerFlight = flights.find(f => f.id === foundPassenger.flightId);
      if (!passengerFlight) {
        setError('This passenger is not on a flight for your airline');
        return;
      }

      if (foundPassenger.status === PASSENGER_STATUS.NOT_CHECKED_IN) {
        setError('Passenger must be checked in before adding bags. Please check in the passenger first.');
        return;
      }

      setPassenger(foundPassenger);
      setFlight(passengerFlight);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddBag = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAddedBag(null);

    try {
      const newBag = addBag({ bagId, ticketNumber: passenger.ticketNumber }, currentUser.id);
      setAddedBag(newBag);
      setSuccess(`Bag ${bagId} added successfully`);
      setBagId('');

      // Refresh passenger data
      const updatedPassenger = getPassengerByTicket(passenger.ticketNumber);
      setPassenger(updatedPassenger);
    } catch (err) {
      setError(err.message);
    }
  };

  const passengerBags = passenger ? getBagsByPassenger(passenger.id) : [];

  return (
    <div>
      <h2 className="mb-lg">Bag Management</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <h3 className="mb-md">Search Passenger by Ticket Number</h3>
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

      {passenger && flight && (
        <>
          <div className="card mb-lg">
            <h3 className="mb-md">Passenger & Flight Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
              <div>
                <strong>Passenger Name:</strong> {passenger.name}
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
              <div>
                <strong>Flight Number:</strong> {flight.flightNumber}
              </div>
              <div>
                <strong>Gate:</strong> {flight.gate}
              </div>
              {flight.destination && (
                <div>
                  <strong>Destination:</strong> {flight.destination}
                </div>
              )}
              {flight.departureTime && (
                <div>
                  <strong>Departure:</strong> {formatDate(flight.departureTime)}
                </div>
              )}
              <div>
                <strong>Flight Status:</strong>{' '}
                <span className={`status-badge status-${flight.status}`}>
                  {flight.status}
                </span>
              </div>
              <div>
                <strong>Total Bags:</strong> {passenger.bagIds.length}
              </div>
            </div>

            <h4 className="mb-md">Add New Bag</h4>
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

          {addedBag && (
            <div className="card mb-lg" style={{ borderLeft: '4px solid var(--success-color)' }}>
              <h3 className="mb-md">Bag Added Successfully</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div>
                  <strong>Bag ID:</strong> {addedBag.id}
                </div>
                <div>
                  <strong>Ticket Number:</strong> {addedBag.ticketNumber}
                </div>
                <div>
                  <strong>Passenger:</strong> {passenger.name} ({passenger.id})
                </div>
                <div>
                  <strong>Flight:</strong> {flight.flightNumber}
                </div>
                <div>
                  <strong>Gate:</strong> {flight.gate}
                </div>
                {flight.destination && (
                  <div>
                    <strong>Destination:</strong> {flight.destination}
                  </div>
                )}
                {flight.departureTime && (
                  <div>
                    <strong>Departure:</strong> {formatDate(flight.departureTime)}
                  </div>
                )}
                <div>
                  <strong>Current Location:</strong>{' '}
                  <span className={`status-badge status-${addedBag.location}`}>
                    {getBagLocationDisplayName(addedBag.location)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {passengerBags.length > 0 && (
            <div className="card">
              <h3 className="mb-md">All Bags for This Passenger</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {passengerBags.map(bag => (
                  <div
                    key={bag.id}
                    className="card"
                    style={{ borderLeft: `3px solid var(--primary-color)` }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-sm)' }}>
                      <div>
                        <strong>Bag ID:</strong> {bag.id}
                      </div>
                      <div>
                        <strong>Ticket:</strong> {bag.ticketNumber}
                      </div>
                      <div>
                        <strong>Flight:</strong> {flight.flightNumber} - Gate {flight.gate}
                      </div>
                      <div>
                        <strong>Location:</strong>{' '}
                        <span className={`status-badge status-${bag.location}`}>
                          {getBagLocationDisplayName(bag.location)}
                        </span>
                      </div>
                      {bag.timeline && bag.timeline.length > 0 && (
                        <div>
                          <strong>Last Update:</strong>{' '}
                          {formatDate(bag.timeline[bag.timeline.length - 1].timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BagManagement;
