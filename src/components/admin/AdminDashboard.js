import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import SystemOverview from './SystemOverview';
import FlightManagement from './FlightManagement';
import PassengerManagement from './PassengerManagement';
import StaffManagement from './StaffManagement';
import AdminMessages from './AdminMessages';
import '../../styles/dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-main">
        <h1 className="section-title">Admin Dashboard</h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'flights' ? 'active' : ''}`}
            onClick={() => setActiveTab('flights')}
          >
            Flights
          </button>
          <button
            className={`tab ${activeTab === 'passengers' ? 'active' : ''}`}
            onClick={() => setActiveTab('passengers')}
          >
            Passengers
          </button>
          <button
            className={`tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </div>

        <div>
          {activeTab === 'overview' && <SystemOverview />}
          {activeTab === 'flights' && <FlightManagement />}
          {activeTab === 'passengers' && <PassengerManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'messages' && <AdminMessages />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
