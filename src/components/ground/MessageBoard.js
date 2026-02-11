import React from 'react';
import useMessages from '../../hooks/useMessages';
import { MESSAGE_BOARDS, MESSAGE_PRIORITY } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const MessageBoard = () => {
  const { getMessagesByBoard } = useMessages();

  const messages = getMessagesByBoard(MESSAGE_BOARDS.GROUND);

  return (
    <div>
      <h2 className="mb-lg">Ground Staff Messages</h2>

      <div className="card mb-lg" style={{ borderLeft: '4px solid var(--primary-color)' }}>
        <p className="text-muted">
          This message board displays system notifications such as gate change alerts and other operational updates. Security violation notifications are sent automatically to airline staff when you flag a bag during security clearance.
        </p>
      </div>

      <div className="card">
        <h3 className="mb-md">Notifications</h3>
        {messages.length === 0 ? (
          <p className="text-muted text-center">No notifications yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {messages.map(message => (
              <div
                key={message.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${
                    message.priority === MESSAGE_PRIORITY.HIGH
                      ? 'var(--danger-color)'
                      : message.priority === MESSAGE_PRIORITY.LOW
                      ? 'var(--secondary-color)'
                      : 'var(--primary-color)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                  <strong>{message.author}</strong>
                  <span className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                <p style={{ margin: 0 }}>{message.content}</p>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  <span className={`status-badge status-${message.priority === MESSAGE_PRIORITY.HIGH ? 'danger' : message.priority === MESSAGE_PRIORITY.LOW ? 'pending' : 'info'}`}>
                    {message.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBoard;
