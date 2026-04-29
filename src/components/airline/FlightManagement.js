import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useFlights from '../../hooks/useFlights';
import useMessages from '../../hooks/useMessages';
import FormInput from '../common/FormInput';
import Table from '../common/Table';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { validateFlightNumber, validateGate, validateFlightForm } from '../../utils/validators';
import { formatDate, getAirlineName } from '../../utils/helpers';
import { MESSAGE_BOARDS, MESSAGE_PRIORITY, FLIGHT_STATUS } from '../../utils/constants';
import '../../styles/dashboard.css';

const FlightManagement = () => {
  const { currentUser } = useAuth();
  const { getFlightsByAirline, addFlight, removeFlight, updateFlight, changeGate } = useFlights();
  const { addMessage } = useMessages();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    flightNumber: '',
    gate: '',
    destination: '',
    departureTime: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, flightId: null });
  const [formErrors, setFormErrors] = useState({});
  const [gateChangeModal, setGateChangeModal] = useState({ isOpen: false, flight: null });
  const [newGate, setNewGate] = useState('');

  const flights = getFlightsByAirline(currentUser.airline);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormErrors({});

    const errors = validateFlightForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please fix the validation errors below');
      return;
    }

    try {
      await addFlight({
        airline: currentUser.airline,
        flightNumber: formData.flightNumber.toUpperCase(),
        gate: formData.gate.toUpperCase(),
        destination: formData.destination,
        departureTime: formData.departureTime
      });

      setSuccess('Flight added successfully');
      setFormData({ flightNumber: '', gate: '', destination: '', departureTime: '' });
      setFormErrors({});
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (flightId) => {
    setDeleteDialog({ isOpen: true, flightId });
  };

  const confirmDelete = async () => {
    try {
      await removeFlight(deleteDialog.flightId);
      setSuccess('Flight removed successfully');
      setDeleteDialog({ isOpen: false, flightId: null });
    } catch (err) {
      setError(err.message);
      setDeleteDialog({ isOpen: false, flightId: null });
    }
  };

  const handleUpdateStatus = async (flightId, status) => {
    setError('');
    setSuccess('');
    try {
      await updateFlight(flightId, { status });
      setSuccess(`Flight status updated to ${status}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangeGate = (flight) => {
    setGateChangeModal({ isOpen: true, flight });
    setNewGate(flight.gate);
    setError('');
    setSuccess('');
  };

  const confirmChangeGate = async () => {
    setError('');
    setSuccess('');

    try {
      if (!newGate || !newGate.trim()) {
        setError('Gate is required');
        return;
      }

      const gateError = validateGate(newGate);
      if (gateError) {
        setError(gateError);
        return;
      }

      const result = await changeGate(gateChangeModal.flight.id, newGate.toUpperCase());

      const messageContent = `GATE CHANGE - Flight ${result.flight.flightNumber} gate changed from ${result.oldGate} to ${result.newGate}. Please update baggage routing accordingly.`;

      await addMessage(MESSAGE_BOARDS.GROUND, {
        author: currentUser.name,
        content: messageContent,
        priority: MESSAGE_PRIORITY.HIGH
      });

      setSuccess(`Gate changed from ${result.oldGate} to ${result.newGate}. Ground staff has been notified.`);
      setGateChangeModal({ isOpen: false, flight: null });
      setNewGate('');
    } catch (err) {
      setError(err.message);
    }
  };

  const columns = [
    { header: 'Flight Number', accessor: 'flightNumber' },
    { header: 'Airline', render: (row) => getAirlineName(row.airline) },
    { header: 'Gate', accessor: 'gate' },
    { header: 'Destination', render: (row) => row.destination || '-' },
    { header: 'Departure', render: (row) => row.departureTime ? formatDate(row.departureTime) : '-' },
    { header: 'Status', render: (row) => <span className={`status-badge status-${row.status}`}>{row.status}</span> },
    { header: 'Passengers', render: (row) => row.passengerIds ? row.passengerIds.length : 0 },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={() => handleChangeGate(row)}>
            Change Gate
          </button>
          {row.status === FLIGHT_STATUS.SCHEDULED && (
            <button className="btn btn-warning btn-sm" onClick={() => handleUpdateStatus(row.id, FLIGHT_STATUS.BOARDING)}>
              Start Boarding
            </button>
          )}
          {row.status === FLIGHT_STATUS.BOARDING && (
            <button className="btn btn-success btn-sm" onClick={() => handleUpdateStatus(row.id, FLIGHT_STATUS.DEPARTED)}>
              Mark Departed
            </button>
          )}
          {row.status !== FLIGHT_STATUS.CANCELLED && row.status !== FLIGHT_STATUS.DEPARTED && (
            <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(row.id, FLIGHT_STATUS.CANCELLED)}>
              Cancel
            </button>
          )}
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="section-header">
        <h2>Flight Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Flight'}
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {showForm && (
        <div className="card mb-lg">
          <h3 className="mb-md">Add New Flight</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <FormInput
                label="Flight Number"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleChange}
                validator={validateFlightNumber}
                error={formErrors.flightNumber}
                placeholder={`e.g., ${currentUser.airline}1234`}
                required
              />
              <FormInput
                label="Gate"
                name="gate"
                value={formData.gate}
                onChange={handleChange}
                validator={validateGate}
                error={formErrors.gate}
                placeholder="e.g., A12"
                required
              />
              <FormInput
                label="Destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                error={formErrors.destination}
                placeholder="e.g., New York (JFK)"
              />
              <FormInput
                label="Departure Time"
                name="departureTime"
                type="datetime-local"
                value={formData.departureTime}
                onChange={handleChange}
                error={formErrors.departureTime}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-md">
              Add Flight
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <Table
          columns={columns}
          data={flights}
          searchFields={['flightNumber', 'destination', 'gate']}
          emptyMessage="No flights available"
        />
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Flight"
        message="Are you sure you want to delete this flight? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, flightId: null })}
      />

      {gateChangeModal.isOpen && gateChangeModal.flight && (
        <Modal
          title="Change Gate"
          onClose={() => {
            setGateChangeModal({ isOpen: false, flight: null });
            setNewGate('');
            setError('');
          }}
        >
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <p><strong>Flight:</strong> {gateChangeModal.flight.flightNumber}</p>
            <p><strong>Current Gate:</strong> {gateChangeModal.flight.gate}</p>
            <p><strong>Destination:</strong> {gateChangeModal.flight.destination}</p>
          </div>

          <FormInput
            label="New Gate"
            name="newGate"
            value={newGate}
            onChange={(e) => setNewGate(e.target.value)}
            validator={validateGate}
            placeholder="e.g., A12"
            required
          />

          <ErrorMessage message={error} />

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-md)' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setGateChangeModal({ isOpen: false, flight: null });
                setNewGate('');
                setError('');
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={confirmChangeGate}
            >
              Change Gate
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FlightManagement;
