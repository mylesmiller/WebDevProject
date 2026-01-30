import React from 'react';
import useFlights from '../../hooks/useFlights';
import usePassengers from '../../hooks/usePassengers';
import useBags from '../../hooks/useBags';
import useStaff from '../../hooks/useStaff';
import { ROLES } from '../../utils/constants';
import '../../styles/dashboard.css';

const SystemOverview = () => {
  const { getAllFlights } = useFlights();
  const { getAllPassengers } = usePassengers();
  const { getAllBags } = useBags();
  const { getAllStaff } = useStaff();

  const flights = getAllFlights();
  const passengers = getAllPassengers();
  const bags = getAllBags();
  const staff = getAllStaff();

  const stats = [
    {
      label: 'Total Flights',
      value: flights.length,
      color: 'var(--primary-color)'
    },
    {
      label: 'Total Passengers',
      value: passengers.length,
      color: 'var(--success-color)'
    },
    {
      label: 'Total Bags',
      value: bags.length,
      color: 'var(--warning-color)'
    },
    {
      label: 'Staff Members',
      value: staff.filter(s => s.role !== ROLES.ADMIN).length,
      color: 'var(--info-color)'
    }
  ];

  return (
    <div>
      <h2 className="mb-lg">System Statistics</h2>
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-lg">
        <h3 className="mb-md">Recent Activity</h3>
        <p className="text-muted">
          System is operational. All services are running normally.
        </p>
      </div>
    </div>
  );
};

export default SystemOverview;
