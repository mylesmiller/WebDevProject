import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import './MessageBoard.css';

const MessageBoard = ({ boardType, title }) => {
  const { messageBoards, addMessage, currentUser } = useApp();
  const [newMessage, setNewMessage] = useState('');

  const messages = messageBoards[boardType] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const author = currentUser.firstName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : currentUser.username;
      addMessage(boardType, newMessage.trim(), author);
      setNewMessage('');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="message-board">
      <h3>{title}</h3>
      <div className="messages-container">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="message">
              <div className="message-header">
                <span className="message-author">{msg.author}</span>
                <span className="message-time">{formatDate(msg.timestamp)}</span>
              </div>
              <p className="message-content">{msg.message}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default MessageBoard;
