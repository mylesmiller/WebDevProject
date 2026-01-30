import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import useAuth from '../../hooks/useAuth';
import BoardingPanel from './BoardingPanel';
import MessageBoard from './MessageBoard';
import '../../styles/dashboard.css';

const GateStaffDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('boarding');

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-main">
        <h1 className="section-title">
          Gate Staff Dashboard - {currentUser.airline}
        </h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'boarding' ? 'active' : ''}`}
            onClick={() => setActiveTab('boarding')}
          >
            Boarding
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </div>

        <div>
          {activeTab === 'boarding' && <BoardingPanel />}
          {activeTab === 'messages' && <MessageBoard />}
        </div>
      </div>
    </div>
  );
};

export default GateStaffDashboard;
