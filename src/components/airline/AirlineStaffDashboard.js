import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import useAuth from '../../hooks/useAuth';
import FlightManagement from './FlightManagement';
import PassengerManagement from './PassengerManagement';
import FlightPassengers from './FlightPassengers';
import MessageBoard from './MessageBoard';
import '../../styles/dashboard.css';

const AirlineStaffDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('flights');

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-main">
        <h1 className="section-title">
          Airline Staff Dashboard - {currentUser.airline}
        </h1>

        <div className="tabs">
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
            className={`tab ${activeTab === 'flightPassengers' ? 'active' : ''}`}
            onClick={() => setActiveTab('flightPassengers')}
          >
            Flight Passengers
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </div>

        <div>
          {activeTab === 'flights' && <FlightManagement />}
          {activeTab === 'passengers' && <PassengerManagement />}
          {activeTab === 'flightPassengers' && <FlightPassengers />}
          {activeTab === 'messages' && <MessageBoard />}
        </div>
      </div>
    </div>
  );
};

export default AirlineStaffDashboard;
