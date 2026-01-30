import React, { createContext, useState, useCallback } from 'react';
import StorageService from '../services/storageService';
import { STORAGE_KEYS, MESSAGE_BOARDS, MESSAGE_PRIORITY } from '../utils/constants';
import { generateMessageId } from '../utils/generators';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState(() => {
    return StorageService.get(STORAGE_KEYS.MESSAGES) || {
      airline: [],
      gate: [],
      ground: []
    };
  });

  // Refresh messages from storage
  const refreshMessages = useCallback(() => {
    const messagesData = StorageService.get(STORAGE_KEYS.MESSAGES) || {
      airline: [],
      gate: [],
      ground: []
    };
    setMessages(messagesData);
  }, []);

  // Get messages by board
  const getMessagesByBoard = useCallback((board) => {
    return messages[board] || [];
  }, [messages]);

  // Get airline messages by airline code
  const getAirlineMessages = useCallback((airline) => {
    return (messages.airline || []).filter(m => m.airline === airline);
  }, [messages]);

  // Add message
  const addMessage = useCallback((board, messageData) => {
    const messagesData = StorageService.get(STORAGE_KEYS.MESSAGES) || {
      airline: [],
      gate: [],
      ground: []
    };

    const newMessage = {
      id: generateMessageId(),
      author: messageData.author,
      airline: messageData.airline || null,
      content: messageData.content,
      timestamp: new Date().toISOString(),
      priority: messageData.priority || MESSAGE_PRIORITY.NORMAL
    };

    if (!messagesData[board]) {
      messagesData[board] = [];
    }

    messagesData[board].unshift(newMessage); // Add to beginning

    StorageService.set(STORAGE_KEYS.MESSAGES, messagesData);
    setMessages(messagesData);

    return newMessage;
  }, []);

  // Delete message
  const deleteMessage = useCallback((board, messageId) => {
    const messagesData = StorageService.get(STORAGE_KEYS.MESSAGES) || {
      airline: [],
      gate: [],
      ground: []
    };

    if (messagesData[board]) {
      messagesData[board] = messagesData[board].filter(m => m.id !== messageId);
      StorageService.set(STORAGE_KEYS.MESSAGES, messagesData);
      setMessages(messagesData);
    }
  }, []);

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
