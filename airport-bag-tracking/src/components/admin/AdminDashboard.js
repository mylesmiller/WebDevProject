import React, { useState } from 'react';
import { Layout, MessageBoard } from '../shared';
import FlightManagement from './FlightManagement';
import PassengerManagement from './PassengerManagement';
import StaffManagement from './StaffManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('flights');

  const tabs = [
    { id: 'flights', label: 'Flights' },
    { id: 'passengers', label: 'Passengers' },
    { id: 'staff', label: 'Staff Members' },
    { id: 'messages', label: 'Messages' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'flights':
        return <FlightManagement />;
      case 'passengers':
        return <PassengerManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'messages':
        return (
          <MessageBoard
            boardType="admin"
            title="Administrator Notifications"
          />
        );
      default:
        return <FlightManagement />;
    }
  };

  return (
    <Layout title="Administrator Dashboard">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
