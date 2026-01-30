import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import useMessages from '../../hooks/useMessages';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { MESSAGE_BOARDS, MESSAGE_PRIORITY } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import '../../styles/dashboard.css';

const MessageBoard = () => {
  const { currentUser } = useAuth();
  const { getMessagesByBoard, addMessage } = useMessages();
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState(MESSAGE_PRIORITY.NORMAL);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const messages = getMessagesByBoard(MESSAGE_BOARDS.GATE);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!content.trim()) {
      setError('Message content is required');
      return;
    }

    try {
      addMessage(MESSAGE_BOARDS.GATE, {
        author: currentUser.name,
        airline: currentUser.airline,
        content: content.trim(),
        priority
      });

      setSuccess('Message posted successfully');
      setContent('');
      setPriority(MESSAGE_PRIORITY.NORMAL);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-lg">Gate Staff Message Board</h2>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div className="card mb-lg">
        <h3 className="mb-md">Post Message</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message here..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value={MESSAGE_PRIORITY.LOW}>Low</option>
              <option value={MESSAGE_PRIORITY.NORMAL}>Normal</option>
              <option value={MESSAGE_PRIORITY.HIGH}>High</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Post Message
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="mb-md">Recent Messages</h3>
        {messages.length === 0 ? (
          <p className="text-muted text-center">No messages yet</p>
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
                  <div>
                    <strong>{message.author}</strong>
                    {message.airline && <span className="text-muted"> ({message.airline})</span>}
                  </div>
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
