import React from 'react';
import { useApp } from '../../context/AppContext';
import './Notification.css';

const Notification = () => {
  const { notifications } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default Notification;
