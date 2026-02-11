import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, FormInput, ConfirmDialog } from '../shared';
import { validateFlightNumber, validateGate } from '../../utils/validation';

const FlightManagement = () => {
  const { flights, addFlight, removeFlight, passengers } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ airlines: '', airlineName: '', destination: '', gate: '' });
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, flight: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only uppercase flight number and gate
    const processedValue = (name === 'airlines' || name === 'gate') ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Validate
    if (!validateFlightNumber(formData.airlines)) {
      setErrors(prev => ({ ...prev, airlines: 'Must be 2 letters + 4 digits (e.g., AA1234)' }));
      return;
    }
    if (!formData.airlineName || formData.airlineName.trim().length < 2) {
      setErrors(prev => ({ ...prev, airlineName: 'Airline name is required' }));
      return;
    }
    if (!formData.destination || formData.destination.trim().length < 2) {
      setErrors(prev => ({ ...prev, destination: 'Destination is required' }));
      return;
    }
    if (!validateGate(formData.gate)) {
      setErrors(prev => ({ ...prev, gate: 'Must be terminal letter + gate number (e.g., A12)' }));
      return;
    }

    const result = addFlight(formData);
    if (result.success) {
      setFormData({ airlines: '', airlineName: '', destination: '', gate: '' });
      setShowAddForm(false);
    } else {
      setErrors({ general: result.message });
    }
  };

  const handleRemove = (flight) => {
    setConfirmDialog({
      isOpen: true,
      flight,
      message: `Are you sure you want to remove flight ${flight.airlines}? This will also remove all passengers and bags associated with this flight.`
    });
  };

  const confirmRemove = () => {
    if (confirmDialog.flight) {
      removeFlight(confirmDialog.flight.airlines);
    }
    setConfirmDialog({ isOpen: false, flight: null });
  };

  const columns = [
    { header: 'Flight', accessor: 'airlines' },
    { header: 'Airline', accessor: 'airlineName' },
    { header: 'Destination', accessor: 'destination' },
    { header: 'Gate', accessor: 'gate' },
    {
      header: 'Passengers',
      render: (row) => {
        const flightPassengers = passengers.filter(p => p.flight === row.airlines);
        return flightPassengers.length;
      }
    },
    {
      header: 'Status',
      render: (row) => {
        const flightPassengers = passengers.filter(p => p.flight === row.airlines);
        const boarded = flightPassengers.filter(p => p.status === 'Boarded').length;
        const total = flightPassengers.length;
        if (total === 0) return 'No passengers';
        if (boarded === total) return <span style={{ color: '#38a169' }}>All boarded</span>;
        return `${boarded}/${total} boarded`;
      }
    }
  ];

  return (
    <div>
      <div className="card">
        <div className="section-header">
          <h2>Flight Management</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Flight'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="add-form">
            {errors.general && (
              <div className="error-banner">{errors.general}</div>
            )}
            <div className="form-row">
              <FormInput
                label="Flight Number"
                name="airlines"
                value={formData.airlines}
                onChange={handleChange}
                error={errors.airlines}
                placeholder="e.g., AA1234"
                maxLength={6}
                required
              />
              <FormInput
                label="Airline Name"
                name="airlineName"
                value={formData.airlineName}
                onChange={handleChange}
                error={errors.airlineName}
                placeholder="e.g., American Airlines"
                required
              />
            </div>
            <div className="form-row">
              <FormInput
                label="Destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                error={errors.destination}
                placeholder="e.g., Los Angeles, CA"
                required
              />
              <FormInput
                label="Gate"
                name="gate"
                value={formData.gate}
                onChange={handleChange}
                error={errors.gate}
                placeholder="e.g., A12"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Add Flight
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <h3>All Flights</h3>
        <DataTable
          columns={columns}
          data={flights}
          emptyMessage="No flights in the system"
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
        title="Remove Flight"
        message={confirmDialog.message}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmDialog({ isOpen: false, flight: null })}
      />
    </div>
  );
};

export default FlightManagement;
