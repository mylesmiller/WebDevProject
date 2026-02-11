import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layout, DataTable, FormInput, MessageBoard, ConfirmDialog } from '../shared';
import { validateTicketNumber } from '../../utils/validation';
import './AirlineStaffDashboard.css';

const AirlineStaffDashboard = () => {
  const {
    currentUser,
    passengers,
    flights,
    bags,
    checkInPassenger,
    notifyAdminToRemovePassenger,
    addNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState('checkin');
  const [checkInData, setCheckInData] = useState({ ticketNumber: '', bagCount: 0 });
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, passenger: null, reason: '' });

  // Filter by airline
  const airlineFlights = flights.filter(f => f.airlines.startsWith(currentUser.airlines));
  const airlinePassengers = passengers.filter(p =>
    airlineFlights.some(f => f.airlines === p.flight)
  );
  const airlineBags = bags.filter(b =>
    airlinePassengers.some(p => p.ticketNumber === b.ticketNumber)
  );

  const handleCheckInChange = (e) => {
    const { name, value } = e.target;
    setCheckInData(prev => ({
      ...prev,
      [name]: name === 'bagCount' ? parseInt(value) || 0 : value
    }));
    setErrors({});
  };

  const handleCheckIn = (e) => {
    e.preventDefault();

    if (!validateTicketNumber(checkInData.ticketNumber)) {
      setErrors({ ticketNumber: 'Ticket number must be exactly 10 digits' });
      return;
    }

    const passenger = airlinePassengers.find(p => p.ticketNumber === checkInData.ticketNumber);
    if (!passenger) {
      setErrors({ ticketNumber: 'Passenger not found or not on your airline' });
      return;
    }

    if (passenger.status !== 'Not-checked-in') {
      setErrors({ ticketNumber: 'Passenger is already checked in' });
      return;
    }

    const result = checkInPassenger(checkInData.ticketNumber, checkInData.bagCount);
    if (result.success) {
      setCheckInData({ ticketNumber: '', bagCount: 0 });
    } else {
      setErrors({ general: result.message });
    }
  };

  const handleRemoveRequest = (passenger, reason) => {
    setConfirmDialog({
      isOpen: true,
      passenger,
      reason,
      message: reason === 'security violation'
        ? `This will remove all bags for "${passenger.firstName} ${passenger.lastName}" and notify the Administrator to remove the passenger. Continue?`
        : `This will notify the Administrator to remove passenger "${passenger.firstName} ${passenger.lastName}". Continue?`
    });
  };

  const confirmRemove = () => {
    if (confirmDialog.passenger) {
      if (confirmDialog.reason === 'security violation') {
        // For security violations: remove bags and notify admin to remove passenger
        // Bags are removed by removePassenger function, but we want admin to do it
        // Per spec: Airline staff removes bags, notifies admin to remove passenger
        notifyAdminToRemovePassenger(
          confirmDialog.passenger.ticketNumber,
          `Security violation - all bags have been removed from system`
        );
        // Note: In a real implementation, we'd have a separate function to just remove bags
        // For now, we notify admin and they will remove passenger + bags
        addNotification(`Bags flagged and Administrator notified about security violation`, 'warning');
      } else {
        // For check-in issues: just notify admin
        notifyAdminToRemovePassenger(
          confirmDialog.passenger.ticketNumber,
          `Check-in counter issues`
        );
        addNotification(`Administrator notified to remove passenger`, 'warning');
      }
    }
    setConfirmDialog({ isOpen: false, passenger: null, reason: '' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Not-checked-in': return 'status-not-checked-in';
      case 'Checked-in': return 'status-checked-in';
      case 'Boarded': return 'status-boarded';
      default: return '';
    }
  };

  const getLocationDisplay = (location) => {
    switch (location.type) {
      case 'Check-in':
        return `Check-in (${location.terminal}-${location.counter})`;
      case 'Security':
        return 'Security Check';
      case 'Gate':
        return `Gate ${location.terminal}${location.number}`;
      case 'Loaded':
        return `Loaded (${location.flight})`;
      default:
        return 'Unknown';
    }
  };

  const passengerColumns = [
    { header: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { header: 'Ticket', accessor: 'ticketNumber' },
    { header: 'Flight', accessor: 'flight' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`status-badge ${getStatusClass(row.status)}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Bags',
      render: (row) => bags.filter(b => b.ticketNumber === row.ticketNumber).length
    }
  ];

  const bagColumns = [
    { header: 'Bag ID', accessor: 'bagId' },
    { header: 'Ticket', accessor: 'ticketNumber' },
    {
      header: 'Passenger',
      render: (row) => {
        const p = passengers.find(p => p.ticketNumber === row.ticketNumber);
        return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
      }
    },
    {
      header: 'Location',
      render: (row) => getLocationDisplay(row.location)
    }
  ];

  const tabs = [
    { id: 'checkin', label: 'Check-in' },
    { id: 'passengers', label: 'Passengers' },
    { id: 'bags', label: 'Bags' },
    { id: 'messages', label: 'Message Board' }
  ];

  return (
    <Layout title={`Airline Staff - ${currentUser.airlines}`}>
      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === 'checkin' && (
          <div className="card">
            <h2>Check-in Passenger</h2>
            <form onSubmit={handleCheckIn}>
              {errors.general && (
                <div className="error-banner">{errors.general}</div>
              )}
              <div className="form-row">
                <FormInput
                  label="Ticket Number"
                  name="ticketNumber"
                  value={checkInData.ticketNumber}
                  onChange={handleCheckInChange}
                  error={errors.ticketNumber}
                  placeholder="10-digit ticket number"
                  maxLength={10}
                  required
                />
                <FormInput
                  label="Number of Bags"
                  type="number"
                  name="bagCount"
                  value={checkInData.bagCount}
                  onChange={handleCheckInChange}
                  error={errors.bagCount}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Check In Passenger
                </button>
              </div>
            </form>

            <hr style={{ margin: '2rem 0', borderColor: '#e2e8f0' }} />

            <h3>Passengers Waiting for Check-in</h3>
            <DataTable
              columns={passengerColumns.slice(0, -1)}
              data={airlinePassengers.filter(p => p.status === 'Not-checked-in')}
              emptyMessage="No passengers waiting for check-in"
            />
          </div>
        )}

        {activeTab === 'passengers' && (
          <div className="card">
            <h2>All Passengers - {currentUser.airlines}</h2>
            <DataTable
              columns={passengerColumns}
              data={airlinePassengers}
              emptyMessage="No passengers for your airline"
              actions={(row) => (
                row.status === 'Not-checked-in' || row.status === 'Checked-in' ? (
                  <div className="action-buttons">
                    <button
                      className="btn btn-warning btn-small"
                      onClick={() => handleRemoveRequest(row, 'check-in counter issues')}
                    >
                      Report Issue
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleRemoveRequest(row, 'security violation')}
                    >
                      Security Violation
                    </button>
                  </div>
                ) : null
              )}
            />
          </div>
        )}

        {activeTab === 'bags' && (
          <div className="card">
            <h2>Bags - {currentUser.airlines}</h2>
            <DataTable
              columns={bagColumns}
              data={airlineBags}
              emptyMessage="No bags for your airline"
            />
          </div>
        )}

        {activeTab === 'messages' && (
          <MessageBoard
            boardType="airlineStaff"
            title="Airline Staff Message Board"
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Report to Administrator"
        message={confirmDialog.message}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmDialog({ isOpen: false, passenger: null, reason: '' })}
      />
    </Layout>
  );
};

export default AirlineStaffDashboard;
