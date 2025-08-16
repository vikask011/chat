import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user && token) {
      // Create socket connection
      const newSocket = io(SOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      // Socket event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
        
        // Join the chat room for the user
        newSocket.emit('join', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup function
      return () => {
        newSocket.close();
      };
    } else {
      // Close socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user, token, SOCKET_URL]);

  // Socket utility functions
  const sendMessage = (recipientId, content, messageType = 'text') => {
    if (socket && isConnected) {
      socket.emit('private-message', {
        senderId: user._id,
        recipientId,
        message: content,
        messageType
      });
    }
  };

  const sendTypingIndicator = (recipientId) => {
    if (socket && isConnected) {
      socket.emit('typing', {
        senderId: user._id,
        recipientId
      });
    }
  };

  const value = {
    socket,
    isConnected,
    sendMessage,
    sendTypingIndicator
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
