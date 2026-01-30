import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import useAuth from '../../hooks/useAuth';
import CheckInPanel from './CheckInPanel';
import FlightPassengers from './FlightPassengers';
import MessageBoard from './MessageBoard';
import '../../styles/dashboard.css';

const AirlineStaffDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('checkin');

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-main">
        <h1 className="section-title">
          Airline Staff Dashboard - {currentUser.airline}
        </h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'checkin' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkin')}
          >
            Check-In
          </button>
          <button
            className={`tab ${activeTab === 'passengers' ? 'active' : ''}`}
            onClick={() => setActiveTab('passengers')}
          >
            Passengers
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </div>

        <div>
          {activeTab === 'checkin' && <CheckInPanel />}
          {activeTab === 'passengers' && <FlightPassengers />}
          {activeTab === 'messages' && <MessageBoard />}
        </div>
      </div>
    </div>
  );
};

export default AirlineStaffDashboard;
