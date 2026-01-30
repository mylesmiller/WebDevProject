import React, { useState } from 'react';
import useStaff from '../../hooks/useStaff';
import FormInput from '../common/FormInput';
import Table from '../common/Table';
import ConfirmDialog from '../common/ConfirmDialog';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { validateName, validateEmail, validatePhone } from '../../utils/validators';
import { ROLES, AIRLINES } from '../../utils/constants';
import { getRoleDisplayName } from '../../utils/helpers';
import '../../styles/dashboard.css';

const StaffManagement = () => {
  const { getAllStaff, addStaff, removeStaff } = useStaff();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    airline: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, staffId: null });

  const staff = getAllStaff().filter(s => s.role !== ROLES.ADMIN);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const newStaff = addStaff(formData);

      // Show credentials (only shown once!)
      setCredentials({
        username: newStaff.username,
        password: newStaff.plainPassword
      });

      setSuccess('Staff member added successfully. Please save the credentials below!');
      setFormData({
        name: '',
        role: '',
        airline: '',
        email: '',
        phone: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseCredentials = () => {
    setCredentials(null);
    setShowForm(false);
  };

  const handleDelete = (staffId) => {
    setDeleteDialog({ isOpen: true, staffId });
  };

  const confirmDelete = () => {
    try {
      removeStaff(deleteDialog.staffId);
      setSuccess('Staff member removed successfully');
      setDeleteDialog({ isOpen: false, staffId: null });
    } catch (err) {
      setError(err.message);
      setDeleteDialog({ isOpen: false, staffId: null });
    }
  };

  const requiresAirline = formData.role === ROLES.AIRLINE_STAFF || formData.role === ROLES.GATE_STAFF;

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Username', accessor: 'username' },
    { header: 'Role', render: (row) => getRoleDisplayName(row.role) },
    { header: 'Airline', render: (row) => row.airline || 'N/A' },
    { header: 'Email', accessor: 'email' },
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
        <h2>Staff Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Staff'}
        </button>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {credentials && (
        <div className="card mb-lg" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
          <h3 className="mb-md" style={{ color: '#92400e' }}>Generated Credentials</h3>
          <p style={{ marginBottom: 'var(--spacing-md)', color: '#92400e' }}>
            Please save these credentials. They will NOT be shown again!
          </p>
          <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-lg)' }}>
            <div><strong>Username:</strong> {credentials.username}</div>
            <div><strong>Password:</strong> {credentials.password}</div>
          </div>
          <button className="btn btn-primary mt-md" onClick={handleCloseCredentials}>
            I've Saved the Credentials
          </button>
        </div>
      )}

      {showForm && !credentials && (
        <div className="card mb-lg">
          <h3 className="mb-md">Add New Staff Member</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <FormInput
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                validator={validateName}
                placeholder="e.g., John Doe"
                required
              />
              <div className="form-group">
                <label className="form-label">
                  Role <span style={{ color: 'var(--danger-color)' }}> *</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a role</option>
                  <option value={ROLES.AIRLINE_STAFF}>Airline Staff</option>
                  <option value={ROLES.GATE_STAFF}>Gate Staff</option>
                  <option value={ROLES.GROUND_STAFF}>Ground Staff</option>
                </select>
              </div>
              {requiresAirline && (
                <div className="form-group">
                  <label className="form-label">
                    Airline <span style={{ color: 'var(--danger-color)' }}> *</span>
                  </label>
                  <select
                    name="airline"
                    value={formData.airline}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select an airline</option>
                    {AIRLINES.map(airline => (
                      <option key={airline.code} value={airline.code}>
                        {airline.code} - {airline.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                validator={validateEmail}
                placeholder="e.g., john@email.com"
                required
              />
              <FormInput
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                validator={validatePhone}
                placeholder="10 digits, first digit not 0"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary mt-md">
              Add Staff Member
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <Table
          columns={columns}
          data={staff}
          searchFields={['name', 'username', 'email']}
          emptyMessage="No staff members available"
        />
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Staff Member"
        message="Are you sure you want to delete this staff member? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, staffId: null })}
      />
    </div>
  );
};

export default StaffManagement;
