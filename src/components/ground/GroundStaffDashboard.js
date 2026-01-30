import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import BagHandling from './BagHandling';
import MessageBoard from './MessageBoard';
import '../../styles/dashboard.css';

const GroundStaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('bags');

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-main">
        <h1 className="section-title">Ground Staff Dashboard</h1>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'bags' ? 'active' : ''}`}
            onClick={() => setActiveTab('bags')}
          >
            Bag Handling
          </button>
          <button
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>
        </div>

        <div>
          {activeTab === 'bags' && <BagHandling />}
          {activeTab === 'messages' && <MessageBoard />}
        </div>
      </div>
    </div>
  );
};

export default GroundStaffDashboard;
