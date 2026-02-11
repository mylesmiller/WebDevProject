import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import SecurityClearance from './SecurityClearance';
import GateWork from './GateWork';
import MessageBoard from './MessageBoard';
import '../../styles/dashboard.css';

const GroundStaffDashboard = () => {
  const [workMode, setWorkMode] = useState(null); // null = selection screen, 'security' or 'gate'
  const [activeTab, setActiveTab] = useState('work');

  const handleSelectMode = (mode) => {
    setWorkMode(mode);
    setActiveTab('work');
  };

  const handleBackToSelection = () => {
    setWorkMode(null);
    setActiveTab('work');
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-main">
        <h1 className="section-title">Ground Staff Dashboard</h1>

        {!workMode ? (
          <div>
            <h2 className="mb-lg" style={{ textAlign: 'center' }}>Select Your Work Assignment</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)', maxWidth: '800px', margin: '0 auto' }}>
              <div
                className="card"
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: 'var(--spacing-xl)',
                  border: '2px solid var(--primary-color)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onClick={() => handleSelectMode('security')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>&#128270;</div>
                <h3 className="mb-md">Security Clearance</h3>
                <p className="text-muted">
                  Screen bags arriving from check-in counters. Clear bags for gate delivery or flag security violations.
                </p>
              </div>

              <div
                className="card"
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  padding: 'var(--spacing-xl)',
                  border: '2px solid var(--success-color)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onClick={() => handleSelectMode('gate')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>&#9992;&#65039;</div>
                <h3 className="mb-md">Gate Assignment</h3>
                <p className="text-muted">
                  Work at a specific gate. Load bags onto aircraft after verifying passenger boarding status.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'work' ? 'active' : ''}`}
                onClick={() => setActiveTab('work')}
              >
                {workMode === 'security' ? 'Security Clearance' : 'Gate Work'}
              </button>
              <button
                className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                Messages
              </button>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <button className="btn btn-secondary btn-sm" onClick={handleBackToSelection}>
                &larr; Back to Work Selection
              </button>
            </div>

            <div>
              {activeTab === 'work' && workMode === 'security' && <SecurityClearance />}
              {activeTab === 'work' && workMode === 'gate' && <GateWork />}
              {activeTab === 'messages' && <MessageBoard />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroundStaffDashboard;
