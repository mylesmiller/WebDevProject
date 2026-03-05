import React, { createContext, useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState({
    airline: [],
    gate: [],
    ground: []
  });

  const loadMessages = useCallback(async () => {
    try {
      const data = await apiService.get('/api/messages');
      // Group by board_type
      const grouped = { airline: [], gate: [], ground: [] };
      data.forEach(m => {
        const board = m.board_type || m.boardType;
        if (grouped[board]) {
          grouped[board].push(m);
        }
      });
      setMessages(grouped);
    } catch (err) {
      // Not authenticated yet
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Get messages by board
  const getMessagesByBoard = useCallback((board) => {
    return messages[board] || [];
  }, [messages]);

  // Get airline messages by airline code
  const getAirlineMessages = useCallback((airline) => {
    return (messages.airline || []).filter(m => m.airline === airline);
  }, [messages]);

  // Add message
  const addMessage = useCallback(async (board, messageData) => {
    const newMessage = await apiService.post('/api/messages', {
      ...messageData,
      boardType: board
    });

    setMessages(prev => ({
      ...prev,
      [board]: [newMessage, ...(prev[board] || [])]
    }));

    return newMessage;
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (board, messageId) => {
    await apiService.delete(`/api/messages/${messageId}`);
    setMessages(prev => ({
      ...prev,
      [board]: (prev[board] || []).filter(m => m.id !== messageId)
    }));
  }, []);

  // Refresh messages
  const refreshMessages = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);

  const value = {
    messages,
    getMessagesByBoard,
    getAirlineMessages,
    addMessage,
    deleteMessage,
    refreshMessages
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};
