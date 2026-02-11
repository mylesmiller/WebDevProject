import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Layout, DataTable, FormInput, MessageBoard } from '../shared';
import { validateBagId } from '../../utils/validation';
import './GroundStaffDashboard.css';

const GroundStaffDashboard = () => {
  const {
    passengers,
    flights,
    bags,
    updateBagLocation,
    loadBag,
    reportSecurityViolation,
    addNotification
  } = useApp();

  // Work location state - null means not selected yet
  const [workLocation, setWorkLocation] = useState(null); // 'security' or gate string like 'A12'
  const [activeTab, setActiveTab] = useState('bags');
  const [selectedBag, setSelectedBag] = useState(null);
  const [newLocation, setNewLocation] = useState({ type: '', terminal: '', number: '' });
  const [violationData, setViolationData] = useState({ bagId: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: name === 'terminal' ? value.toUpperCase() : value
    }));
    setErrors({});
  };

  const handleViolationChange = (e) => {
    const { name, value } = e.target;
    setViolationData(prev => ({ ...prev, [name]: value }));
    setErrors({});
  };

  const handleUpdateLocation = (e) => {
    e.preventDefault();

    if (!newLocation.type) {
      setErrors({ type: 'Please select a location type' });
      return;
    }

    if (newLocation.type === 'Gate' && (!newLocation.terminal || !newLocation.number)) {
      setErrors({ terminal: 'Terminal and gate number are required' });
      return;
    }

    let locationData;
    switch (newLocation.type) {
      case 'Security':
        locationData = { type: 'Security' };
        break;
      case 'Gate':
        locationData = { type: 'Gate', terminal: newLocation.terminal, number: newLocation.number };
        break;
      default:
        return;
    }

    updateBagLocation(selectedBag.bagId, locationData);
    setShowLocationModal(false);
    setSelectedBag(null);
    setNewLocation({ type: '', terminal: '', number: '' });
  };

  const handleLoadBag = (bag) => {
    const result = loadBag(bag.bagId);
    if (!result.success) {
      addNotification(result.message, 'error');
    }
  };

  const handleReportViolation = (e) => {
    e.preventDefault();

    if (!validateBagId(violationData.bagId)) {
      setErrors({ bagId: 'Bag ID must be exactly 6 digits' });
      return;
    }

    if (!violationData.reason.trim()) {
      setErrors({ reason: 'Please provide a reason for the violation' });
      return;
    }

    const bag = bags.find(b => b.bagId === violationData.bagId);
    if (!bag) {
      setErrors({ bagId: 'Bag not found' });
      return;
    }

    reportSecurityViolation(violationData.bagId, violationData.reason);
    setViolationData({ bagId: '', reason: '' });
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

  const getLocationClass = (location) => {
    switch (location.type) {
      case 'Check-in': return 'location-checkin';
      case 'Security': return 'location-security';
      case 'Gate': return 'location-gate';
      case 'Loaded': return 'location-loaded';
      default: return '';
    }
  };

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
      header: 'Flight',
      render: (row) => {
        const p = passengers.find(p => p.ticketNumber === row.ticketNumber);
        return p ? p.flight : 'Unknown';
      }
    },
    {
      header: 'Location',
      render: (row) => (
        <span className={`location-badge ${getLocationClass(row.location)}`}>
          {getLocationDisplay(row.location)}
        </span>
      )
    }
  ];

  // Get flight for a gate
  const getFlightAtGate = (gate) => {
    return flights.find(f => f.gate === gate);
  };

  // Get bags for a specific gate (bags heading to or at this gate)
  const getBagsForGate = (gate) => {
    const flight = getFlightAtGate(gate);
    if (!flight) return [];

    // Get all passengers on this flight
    const flightPassengers = passengers.filter(p => p.flight === flight.airlines);
    const ticketNumbers = flightPassengers.map(p => p.ticketNumber);

    // Get bags belonging to these passengers that are at the gate or loaded
    return bags.filter(b =>
      ticketNumbers.includes(b.ticketNumber) &&
      (b.location.type === 'Gate' || b.location.type === 'Loaded')
    );
  };

  // Filter bags by location type
  const bagsAtCheckIn = bags.filter(b => b.location.type === 'Check-in');
  const bagsAtSecurity = bags.filter(b => b.location.type === 'Security');

  const locationTypes = [
    { value: 'Security', label: 'Security Check' },
    { value: 'Gate', label: 'Gate' }
  ];

  // Handle work location selection
  const handleSelectWorkLocation = (location) => {
    setWorkLocation(location);
    // Reset to appropriate default tab
    if (location === 'security') {
      setActiveTab('checkin');
    } else {
      setActiveTab('gate-bags');
    }
    addNotification(`Now working at: ${location === 'security' ? 'Security Clearance' : `Gate ${location}`}`, 'info');
  };

  const handleChangeWorkLocation = () => {
    setWorkLocation(null);
    setActiveTab('bags');
  };

  // WORK LOCATION SELECTION SCREEN
  if (!workLocation) {
    return (
      <Layout title="Ground Staff Dashboard">
        <div className="work-location-selector">
          <div className="card">
            <h2>Select Your Work Location</h2>
            <p className="info-text">
              Please select where you will be working. Your operations will differ based on location.
            </p>

            <div className="location-options">
              <div
                className="location-option security-option"
                onClick={() => handleSelectWorkLocation('security')}
              >
                <div className="location-icon">🔒</div>
                <h3>Security Clearance</h3>
                <p>Process bags through security check, clear or report violations</p>
                <div className="location-stats">
                  <span>{bagsAtCheckIn.length} bags at check-in</span>
                  <span>{bagsAtSecurity.length} bags at security</span>
                </div>
              </div>

              <div className="location-divider">
                <span>OR</span>
              </div>

              <div className="gate-selection">
                <h3>Select a Gate</h3>
                <p>Load bags onto aircraft after passengers board</p>
                <div className="gate-grid">
                  {flights.map(flight => {
                    const gateBags = getBagsForGate(flight.gate);
                    const flightPassengers = passengers.filter(p => p.flight === flight.airlines);
                    const boardedCount = flightPassengers.filter(p => p.status === 'Boarded').length;

                    return (
                      <div
                        key={flight.gate}
                        className="gate-option"
                        onClick={() => handleSelectWorkLocation(flight.gate)}
                      >
                        <div className="gate-number">Gate {flight.gate}</div>
                        <div className="gate-flight">{flight.airlines}</div>
                        <div className="gate-info">
                          <span>{boardedCount}/{flightPassengers.length} boarded</span>
                          <span>{gateBags.length} bags</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {flights.length === 0 && (
                  <p className="no-flights">No flights currently at gates</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // SECURITY CLEARANCE VIEW
  if (workLocation === 'security') {
    const securityTabs = [
      { id: 'checkin', label: `From Check-in (${bagsAtCheckIn.length})` },
      { id: 'security', label: `At Security (${bagsAtSecurity.length})` },
      { id: 'violation', label: 'Report Violation' },
      { id: 'messages', label: 'Message Board' }
    ];

    return (
      <Layout title="Ground Staff - Security Clearance">
        <div className="work-location-header">
          <div className="current-location">
            <span className="location-badge location-security">🔒 Security Clearance</span>
            <button className="btn btn-secondary btn-small" onClick={handleChangeWorkLocation}>
              Change Location
            </button>
          </div>
        </div>

        <div className="dashboard-tabs">
          {securityTabs.map(tab => (
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
              <h2>Bags from Check-in</h2>
              <p className="info-text">These bags need to be moved to Security Check.</p>
              <DataTable
                columns={bagColumns}
                data={bagsAtCheckIn}
                emptyMessage="No bags waiting from check-in"
                actions={(row) => (
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => {
                      updateBagLocation(row.bagId, { type: 'Security' });
                    }}
                  >
                    Send to Security
                  </button>
                )}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <h2>Bags at Security Check</h2>
              <p className="info-text">After clearance, send bags to their designated gate.</p>
              <DataTable
                columns={bagColumns}
                data={bagsAtSecurity}
                emptyMessage="No bags at security"
                actions={(row) => {
                  const passenger = passengers.find(p => p.ticketNumber === row.ticketNumber);
                  const flight = passenger ? flights.find(f => f.airlines === passenger.flight) : null;
                  return (
                    <div className="action-buttons">
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => {
                          if (flight) {
                            updateBagLocation(row.bagId, {
                              type: 'Gate',
                              terminal: flight.gate[0],
                              number: flight.gate.substring(1)
                            });
                          }
                        }}
                        disabled={!flight}
                      >
                        {flight ? `Clear → Gate ${flight.gate}` : 'No Flight Info'}
                      </button>
                      <button
                        className="btn btn-warning btn-small"
                        onClick={() => {
                          setViolationData({ bagId: row.bagId, reason: '' });
                          setActiveTab('violation');
                        }}
                      >
                        Flag Violation
                      </button>
                    </div>
                  );
                }}
              />
            </div>
          )}

          {activeTab === 'violation' && (
            <div className="card">
              <h2>Report Security Violation</h2>
              <form onSubmit={handleReportViolation}>
                <FormInput
                  label="Bag ID"
                  name="bagId"
                  value={violationData.bagId}
                  onChange={handleViolationChange}
                  error={errors.bagId}
                  placeholder="6-digit bag ID"
                  maxLength={6}
                  required
                />
                <div className="form-group">
                  <label>Reason for Violation <span className="required">*</span></label>
                  <textarea
                    name="reason"
                    value={violationData.reason}
                    onChange={handleViolationChange}
                    placeholder="Describe the security violation..."
                    rows={4}
                    className={errors.reason ? 'error' : ''}
                  />
                  {errors.reason && <span className="error-message">{errors.reason}</span>}
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-warning">
                    Report Violation
                  </button>
                </div>
              </form>
              <p className="info-text">
                This will notify Airline Staff about the violation. They will inform the Administrator to remove the bag and passenger from the system.
              </p>
            </div>
          )}

          {activeTab === 'messages' && (
            <MessageBoard
              boardType="groundStaff"
              title="Ground Staff Message Board"
            />
          )}
        </div>
      </Layout>
    );
  }

  // GATE VIEW - workLocation is a gate like 'A12'
  const currentFlight = getFlightAtGate(workLocation);
  const gateBags = currentFlight ? getBagsForGate(workLocation) : [];
  const gatePassengers = currentFlight
    ? passengers.filter(p => p.flight === currentFlight.airlines)
    : [];
  const bagsAtThisGate = gateBags.filter(b => b.location.type === 'Gate');
  const bagsLoadedForFlight = gateBags.filter(b => b.location.type === 'Loaded');

  const gateTabs = [
    { id: 'gate-bags', label: `Bags at Gate (${bagsAtThisGate.length})` },
    { id: 'loaded', label: `Loaded (${bagsLoadedForFlight.length})` },
    { id: 'messages', label: 'Message Board' }
  ];

  return (
    <Layout title={`Ground Staff - Gate ${workLocation}`}>
      <div className="work-location-header">
        <div className="current-location">
          <span className="location-badge location-gate">✈️ Gate {workLocation}</span>
          <button className="btn btn-secondary btn-small" onClick={handleChangeWorkLocation}>
            Change Location
          </button>
        </div>
      </div>

      {/* Gate Information Card */}
      {currentFlight ? (
        <div className="gate-info-card">
          <div className="gate-info-header">
            <h2>Gate {workLocation} - Flight {currentFlight.airlines}</h2>
          </div>
          <div className="gate-info-details">
            <div className="info-item">
              <span className="info-label">Flight</span>
              <span className="info-value">{currentFlight.airlines}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Gate</span>
              <span className="info-value">{currentFlight.gate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Passengers</span>
              <span className="info-value">
                {gatePassengers.filter(p => p.status === 'Boarded').length} / {gatePassengers.length} boarded
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Bags</span>
              <span className="info-value">
                {bagsLoadedForFlight.length} / {gateBags.length} loaded
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card warning-card">
          <p>⚠️ No flight currently assigned to Gate {workLocation}</p>
          <button className="btn btn-primary" onClick={handleChangeWorkLocation}>
            Select Different Location
          </button>
        </div>
      )}

      {currentFlight && (
        <>
          <div className="dashboard-tabs">
            {gateTabs.map(tab => (
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
            {activeTab === 'gate-bags' && (
              <div className="card">
                <h2>Bags at Gate {workLocation}</h2>
                <p className="info-text">Load bags after passengers have boarded.</p>
                <DataTable
                  columns={[
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
                      header: 'Passenger Status',
                      render: (row) => {
                        const p = passengers.find(p => p.ticketNumber === row.ticketNumber);
                        if (!p) return 'Unknown';
                        const statusClass = p.status === 'Boarded' ? 'status-boarded' : 'status-pending';
                        return <span className={`status-badge ${statusClass}`}>{p.status}</span>;
                      }
                    }
                  ]}
                  data={bagsAtThisGate}
                  emptyMessage="No bags at this gate"
                  actions={(row) => {
                    const passenger = passengers.find(p => p.ticketNumber === row.ticketNumber);
                    const canLoad = passenger && passenger.status === 'Boarded';
                    return (
                      <button
                        className="btn btn-success btn-small"
                        onClick={() => handleLoadBag(row)}
                        disabled={!canLoad}
                        title={!canLoad ? 'Passenger must board first' : 'Load bag onto plane'}
                      >
                        {canLoad ? 'Load onto Plane' : 'Awaiting Boarding'}
                      </button>
                    );
                  }}
                />
              </div>
            )}

            {activeTab === 'loaded' && (
              <div className="card">
                <h2>Loaded Bags - Flight {currentFlight.airlines}</h2>
                <DataTable
                  columns={[
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
                      header: 'Status',
                      render: () => (
                        <span className="status-badge status-loaded">✅ Loaded</span>
                      )
                    }
                  ]}
                  data={bagsLoadedForFlight}
                  emptyMessage="No bags loaded yet"
                />
              </div>
            )}

            {activeTab === 'messages' && (
              <MessageBoard
                boardType="groundStaff"
                title="Ground Staff Message Board"
              />
            )}
          </div>
        </>
      )}

      {/* Location Change Modal */}
      {showLocationModal && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Update Bag Location</h3>
            <p>Bag ID: {selectedBag?.bagId}</p>
            <form onSubmit={handleUpdateLocation}>
              <FormInput
                type="select"
                label="New Location"
                name="type"
                value={newLocation.type}
                onChange={handleLocationChange}
                error={errors.type}
                options={locationTypes}
                required
              />
              {newLocation.type === 'Gate' && (
                <div className="form-row">
                  <FormInput
                    label="Terminal"
                    name="terminal"
                    value={newLocation.terminal}
                    onChange={handleLocationChange}
                    error={errors.terminal}
                    placeholder="e.g., A"
                    maxLength={1}
                    required
                  />
                  <FormInput
                    label="Gate Number"
                    name="number"
                    value={newLocation.number}
                    onChange={handleLocationChange}
                    error={errors.number}
                    placeholder="e.g., 12"
                    required
                  />
                </div>
              )}
              <div className="dialog-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLocationModal(false);
                    setSelectedBag(null);
                    setNewLocation({ type: '', terminal: '', number: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GroundStaffDashboard;
