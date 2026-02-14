import React, { useState } from 'react';
import usePassengers from '../../hooks/usePassengers';
import useFlights from '../../hooks/useFlights';
import FormInput from '../common/FormInput';
import Table from '../common/Table';
import ConfirmDialog from '../common/ConfirmDialog';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import {
  validatePassengerId,
  validateTicketNumber,
  validateName,
  validatePassengerForm,
  validateEmailOptional,
  validatePhoneOptional
} from '../../utils/validators';
import { getPassengerStatusDisplayName } from '../../utils/helpers';
import '../../styles/dashboard.css';

const PassengerManagement = () => {
  const { getAllPassengers, addPassenger, removePassenger } = usePassengers();
  const { getAllFlights } = useFlights();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    passengerId: '',
    ticketNumber: '',
    flightId: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, passengerId: null });

  const passengers = getAllPassengers();
  const flights = getAllFlights();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormErrors({});

    // Validate all fields before submission
    const errors = validatePassengerForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please fix the validation errors below');
      return;
    }

    try {
      addPassenger(formData);
      setSuccess('Passenger added successfully');
      setFormData({
        name: '',
        passengerId: '',
        ticketNumber: '',
        flightId: '',
        email: '',
        phone: ''
      });
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (passengerId) => {
    setDeleteDialog({ isOpen: true, passengerId });
  };

  const confirmDelete = () => {
    try {
      removePassenger(deleteDialog.passengerId);
      setSuccess('Passenger removed successfully');
      setDeleteDialog({ isOpen: false, passengerId: null });
    } catch (err) {
      setError(err.message);
      setDeleteDialog({ isOpen: false, passengerId: null });
    }
  };

  const getFlightInfo = (flightId) => {
    const flight = flights.find(f => f.id === flightId);
    return flight ? `${flight.flightNumber} - ${flight.destination}` : 'N/A';
  };

  const columns = [
    { header: 'Passenger ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Ticket Number', accessor: 'ticketNumber' },
    { header: 'Flight', render: (row) => getFlightInfo(row.flightId) },
    { header: 'Status', render: (row) => (
      <span className={`status-badge status-${row.status}`}>
        {getPassengerStatusDisplayName(row.status)}
      </span>
    )},
    { header: 'Bags', render: (row) => row.bagIds.length },
    {
      header: 'Actions',
      render: (row) => (
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
          Delete
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="section-header">
        <h2>Passenger Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Passenger'}
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {showForm && (
        <div className="card mb-lg">
          <h3 className="mb-md">Add New Passenger</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <FormInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                validator={validateName}
                error={formErrors.name}
                placeholder="e.g., John Smith"
                required
              />
              <FormInput
                label="Passenger ID"
                name="passengerId"
                value={formData.passengerId}
                onChange={handleChange}
                validator={validatePassengerId}
                error={formErrors.passengerId}
                placeholder="6 digits"
                required
              />
              <FormInput
                label="Ticket Number"
                name="ticketNumber"
                value={formData.ticketNumber}
                onChange={handleChange}
                validator={validateTicketNumber}
                error={formErrors.ticketNumber}
                placeholder="10 digits"
                required
              />
              <div className="form-group">
                <label className="form-label">
                  Flight <span style={{ color: 'var(--danger-color)' }}> *</span>
                </label>
                <select
                  name="flightId"
                  value={formData.flightId}
                  onChange={handleChange}
                  className={`form-select ${formErrors.flightId ? 'error' : ''}`}
                  required
                >
                  <option value="">Select a flight</option>
                  {flights.map(flight => (
                    <option key={flight.id} value={flight.id}>
                      {flight.flightNumber} - {flight.destination}
                    </option>
                  ))}
                </select>
                {formErrors.flightId && <div className="form-error">{formErrors.flightId}</div>}
              </div>
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                validator={validateEmailOptional}
                error={formErrors.email}
                placeholder="e.g., john@email.com"
              />
              <FormInput
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                validator={validatePhoneOptional}
                error={formErrors.phone}
                placeholder="10 digits"
              />
            </div>
            <button type="submit" className="btn btn-primary mt-md">
              Add Passenger
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <Table
          columns={columns}
          data={passengers}
          searchFields={['name', 'id', 'ticketNumber']}
          emptyMessage="No passengers available"
        />
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Passenger"
        message="Are you sure you want to delete this passenger? This will also remove all associated bags."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, passengerId: null })}
      />
    </div>
  );
};

export default PassengerManagement;
