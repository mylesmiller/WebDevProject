import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, FormInput, ConfirmDialog } from '../shared';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateAirlines
} from '../../utils/validation';

const StaffManagement = () => {
  const {
    airlineStaff,
    gateStaff,
    groundStaff,
    addStaff,
    removeStaff
  } = useApp();

  const [activeStaffTab, setActiveStaffTab] = useState('airlineStaff');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCredentials, setNewCredentials] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    airlines: ''
  });
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, staff: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'airlines' ? value.toUpperCase() : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      airlines: ''
    });
    setErrors({});
    setNewCredentials(null);
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
    if (!validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format (XXX@XXX.XXX)' }));
      return;
    }
    if (!validatePhone(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Phone must be 10 digits, first digit not zero' }));
      return;
    }
    if (activeStaffTab !== 'groundStaff' && !validateAirlines(formData.airlines)) {
      setErrors(prev => ({ ...prev, airlines: 'Airlines must be exactly 2 uppercase letters' }));
      return;
    }

    const result = addStaff(activeStaffTab, formData);
    if (result.success) {
      setNewCredentials({
        username: result.username,
        password: result.password
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        airlines: ''
      });
    } else {
      setErrors({ general: result.message });
    }
  };

  const handleRemove = (staff) => {
    setConfirmDialog({
      isOpen: true,
      staff,
      message: `Are you sure you want to remove staff member "${staff.firstName} ${staff.lastName}" (${staff.username})?`
    });
  };

  const confirmRemove = () => {
    if (confirmDialog.staff) {
      removeStaff(activeStaffTab, confirmDialog.staff.username);
    }
    setConfirmDialog({ isOpen: false, staff: null });
  };

  const getStaffData = () => {
    switch (activeStaffTab) {
      case 'airlineStaff': return airlineStaff;
      case 'gateStaff': return gateStaff;
      case 'groundStaff': return groundStaff;
      default: return [];
    }
  };

  const getStaffLabel = () => {
    switch (activeStaffTab) {
      case 'airlineStaff': return 'Airline Staff';
      case 'gateStaff': return 'Gate Staff';
      case 'groundStaff': return 'Ground Staff';
      default: return 'Staff';
    }
  };

  const baseColumns = [
    { header: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
    { header: 'Username', accessor: 'username' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' }
  ];

  const airlinesColumn = { header: 'Airlines', accessor: 'airlines' };

  const columns = activeStaffTab === 'groundStaff'
    ? baseColumns
    : [...baseColumns.slice(0, 2), airlinesColumn, ...baseColumns.slice(2)];

  const staffData = getStaffData();

  return (
    <div>
      <div className="card">
        <div className="section-header">
          <h2>Staff Management</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAddForm(!showAddForm);
              resetForm();
            }}
          >
            {showAddForm ? 'Cancel' : `Add ${getStaffLabel()}`}
          </button>
        </div>

        <div className="staff-tabs">
          <button
            className={`staff-tab-btn ${activeStaffTab === 'airlineStaff' ? 'active' : ''}`}
            onClick={() => { setActiveStaffTab('airlineStaff'); resetForm(); setShowAddForm(false); }}
          >
            Airline Staff ({airlineStaff.length})
          </button>
          <button
            className={`staff-tab-btn ${activeStaffTab === 'gateStaff' ? 'active' : ''}`}
            onClick={() => { setActiveStaffTab('gateStaff'); resetForm(); setShowAddForm(false); }}
          >
            Gate Staff ({gateStaff.length})
          </button>
          <button
            className={`staff-tab-btn ${activeStaffTab === 'groundStaff' ? 'active' : ''}`}
            onClick={() => { setActiveStaffTab('groundStaff'); resetForm(); setShowAddForm(false); }}
          >
            Ground Staff ({groundStaff.length})
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="add-form">
            {errors.general && (
              <div className="error-banner">{errors.general}</div>
            )}

            {newCredentials && (
              <div className="credentials-display">
                <h4>New Staff Credentials (send to user via email)</h4>
                <p><strong>Username:</strong> {newCredentials.username}</p>
                <p><strong>Password:</strong> {newCredentials.password}</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#276749' }}>
                  User must change password after first login.
                </p>
              </div>
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
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="example@email.com"
                required
              />
              <FormInput
                label="Phone (10 digits)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="e.g., 1234567890"
                maxLength={10}
                required
              />
            </div>

            {activeStaffTab !== 'groundStaff' && (
              <FormInput
                label="Airlines (2 letters)"
                name="airlines"
                value={formData.airlines}
                onChange={handleChange}
                error={errors.airlines}
                placeholder="e.g., AA"
                maxLength={2}
                required
              />
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                Add {getStaffLabel()}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <h3>{getStaffLabel()} ({staffData.length})</h3>
        <DataTable
          columns={columns}
          data={staffData}
          emptyMessage={`No ${getStaffLabel().toLowerCase()} in the system`}
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
        title="Remove Staff Member"
        message={confirmDialog.message}
        onConfirm={confirmRemove}
        onCancel={() => setConfirmDialog({ isOpen: false, staff: null })}
      />
    </div>
  );
};

export default StaffManagement;
