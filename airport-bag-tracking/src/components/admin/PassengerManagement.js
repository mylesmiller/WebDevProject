import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, FormInput, ConfirmDialog } from '../shared';
import {
  validateName,
  validateIdentification,
  validateTicketNumber,
  validateFlightNumber
} from '../../utils/validation';

const PassengerManagement = () => {
  const { passengers, flights, addPassenger, removePassenger } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    identification: '',
    ticketNumber: '',
    flight: ''
  });
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, passenger: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validate
    if (!validateName(formData.firstName)) {
      setErrors(prev => ({ ...prev, firstName: 'First name must be at least 2 letters' }));
      return;
    }
    if (!validateName(formData.lastName)) {
      setErrors(prev => ({ ...prev, lastName: 'Last name must be at least 2 letters' }));
      return;
    }
    if (!validateIdentification(formData.identification)) {
      setErrors(prev => ({ ...prev, identification: 'Identification must be exactly 6 digits' }));
      return;
    }
    if (!validateTicketNumber(formData.ticketNumber)) {
      setErrors(prev => ({ ...prev, ticketNumber: 'Ticket number must be exactly 10 digits' }));
      return;
    }
    if (!validateFlightNumber(formData.flight)) {
      setErrors(prev => ({ ...prev, flight: 'Please select a valid flight' }));
      return;
    }

    const result = addPassenger(formData);
    if (result.success) {
      setFormData({
        firstName: '',
        lastName: '',
        identification: '',
        ticketNumber: '',
        flight: ''
      });
      setShowAddForm(false);
    } else {
      setErrors({ general: result.message });
    }
  };

  const handleRemove = (passenger) => {
    setConfirmDialog({
      isOpen: true,
      passenger,
      message: `Are you sure you want to remove the passenger "${passenger.firstName} ${passenger.lastName}"? This will also remove all their bags.`
    });
  };

  const confirmRemove = () => {
    if (confirmDialog.passenger) {
      removePassenger(confirmDialog.passenger.ticketNumber);
    }
    setConfirmDialog({ isOpen: false, passenger: null });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Not-checked-in': return 'status-not-checked-in';
      case 'Checked-in': return 'status-checked-in';
      case 'Boarded': return 'status-boarded';
      default: return '';
    }
  };

  const columns = [
    { header: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { header: 'ID', accessor: 'identification' },
    { header: 'Ticket', accessor: 'ticketNumber' },
    { header: 'Flight', accessor: 'flight' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`status-badge ${getStatusClass(row.status)}`}>
          {row.status}
        </span>
      )
    }
  ];

  const flightOptions = flights.map(f => ({ value: f.airlines, label: `${f.airlines} (Gate ${f.gate})` }));

  return (
    <div>
      <div className="card">
        <div className="section-header">
          <h2>Passenger Management</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Passenger'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="add-form">
            {errors.general && (
              <div className="error-banner">{errors.general}</div>
            )}
            <div className="form-row">
              <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="Min 2 letters"
                required
              />
              <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Min 2 letters"
                required
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Identification (6 digits)"
                name="identification"
                value={formData.identification}
                onChange={handleChange}
                error={errors.identification}
                placeholder="e.g., 123456"
                maxLength={6}
                required
              />
              <FormInput
                label="Ticket Number (10 digits)"
                name="ticketNumber"
                value={formData.ticketNumber}
                onChange={handleChange}
                error={errors.ticketNumber}
                placeholder="e.g., 1234567890"
                maxLength={10}
                required
              />
            </div>
            <FormInput
              type="select"
              label="Flight"
              name="flight"
              value={formData.flight}
              onChange={handleChange}
              error={errors.flight}
              options={flightOptions}
              required
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Add Passenger
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <h3>All Passengers ({passengers.length})</h3>
        <DataTable
          columns={columns}
          data={passengers}
          emptyMessage="No passengers in the system"
          actions={(row) => (
            <button
              className="btn btn-danger btn-small"
              onClick={() => handleRemove(row)}
            >
              Remove
            </button>
          )}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Remove Passenger"
        message={confirmDialog.message}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmDialog({ isOpen: false, passenger: null })}
      />
    </div>
  );
};

export default PassengerManagement;
