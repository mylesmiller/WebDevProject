import React from 'react';
import useAuth from '../../hooks/useAuth';
import useFlights from '../../hooks/useFlights';
import usePassengers from '../../hooks/usePassengers';
import Table from '../common/Table';
import { getPassengerStatusDisplayName, formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const FlightPassengers = () => {
  const { currentUser } = useAuth();
  const { getFlightsByAirline } = useFlights();
  const { getPassengersByFlight } = usePassengers();

  const flights = getFlightsByAirline(currentUser.airline);

  const columns = [
    { header: 'Flight', accessor: 'flightNumber' },
    { header: 'Gate', accessor: 'gate' },
    { header: 'Destination', accessor: 'destination' },
    { header: 'Departure', render: (row) => formatDate(row.departureTime) },
    { header: 'Passengers', render: (row) => row.passengerIds.length },
    {
      header: 'Checked In',
      render: (row) => {
        const passengers = getPassengersByFlight(row.id);
        const checkedIn = passengers.filter(p => p.status !== 'not-checked-in').length;
        return `${checkedIn}/${passengers.length}`;
      }
    }
  ];

  return (
    <div>
      <h2 className="mb-lg">Flight Passengers</h2>

      <div className="card">
        <Table
          columns={columns}
          data={flights}
          searchFields={['flightNumber', 'destination']}
          emptyMessage="No flights available"
        />
      </div>

      {flights.map(flight => {
        const passengers = getPassengersByFlight(flight.id);
        if (passengers.length === 0) return null;

        return (
          <div key={flight.id} className="card mt-lg">
            <h3 className="mb-md">{flight.flightNumber} - {flight.destination}</h3>
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
                { header: 'Bags', render: (row) => row.bagIds.length }
              ]}
              data={passengers}
              searchFields={['name', 'id', 'ticketNumber']}
              emptyMessage="No passengers"
            />
          </div>
        );
      })}
    </div>
  );
};

export default FlightPassengers;
