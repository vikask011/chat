import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, Plus, Settings as SettingsIcon, Menu, X, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Sidebar from './Sidebar';
import ConversationList from './ConversationList';
import ChatArea from './ChatArea';
import UserSearch from './UserSearch';
import Profile from '../profile/Profile';
import Settings from '../settings/Settings';

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch recent conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        console.log('Fetching conversations for user:', user?._id);
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'Present' : 'Missing');
        
        const response = await fetch(`${API_BASE_URL}/messages/recent`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Conversations data:', data);
          setConversations(data);
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user, API_BASE_URL]);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('new-message', (data) => {
        // Update conversations with new message
        setConversations(prev => {
          const updated = [...prev];
          const conversationIndex = updated.findIndex(
            conv => conv.user._id === data.senderId
          );

          if (conversationIndex !== -1) {
            // Update existing conversation
            updated[conversationIndex] = {
              ...updated[conversationIndex],
              lastMessage: {
                content: data.message,
                createdAt: data.timestamp,
                sender: data.senderId
              },
              unreadCount: updated[conversationIndex].unreadCount + 1
            };
          } else {
            // Add new conversation (this would need user data)
            // For now, we'll just refresh the conversations
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }

          return updated;
        });
      });

      // Listen for typing indicators
      socket.on('user-typing', (data) => {
        // Handle typing indicator
        console.log('User typing:', data);
      });

      return () => {
        socket.off('new-message');
        socket.off('user-typing');
      };
    }
  }, [socket]);

  const handleLogout = async () => {
    await logout();
  };

  const handleNewConversation = (userData) => {
    setSelectedConversation({
      user: userData,
      messages: [],
      isNew: true
    });
    setShowUserSearch(false);
    setShowSidebar(false);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowSidebar(false);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setShowSidebar(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
    setShowSidebar(false);
  };

  const handleShowConversations = () => {
    // Close sidebar to show conversation list
    setShowSidebar(false);
  };

  const updateConversation = (updatedConversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.user._id === updatedConversation.user._id 
          ? updatedConversation 
          : conv
      )
    );
  };

  return (
    <div className="h-screen bg-chat-bg flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:relative lg:translate-x-0"
          >
            <Sidebar
              user={user}
              onLogout={handleLogout}
              onNewChat={() => setShowUserSearch(true)}
              onShowProfile={handleShowProfile}
              onShowSettings={handleShowSettings}
              onShowConversations={handleShowConversations}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-b border-chat-border px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">{user?.username}</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
            
                         <button
               onClick={() => setShowSidebar(!showSidebar)}
               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               title="Settings"
             >
               <SettingsIcon className="w-5 h-5 text-gray-600" />
             </button>
          </div>
        </motion.header>

        {/* Main Chat Area */}
        <div className="flex-1 flex">
          {/* Conversation List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white border-r border-chat-border hidden lg:block"
          >
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleConversationSelect}
              loading={loading}
              onNewChat={() => setShowUserSearch(true)}
            />
          </motion.div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ChatArea
                conversation={selectedConversation}
                onUpdateConversation={updateConversation}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-12 h-12 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    Welcome to Chat App
                  </h2>
                  <p className="text-gray-500 mb-4">
                    Select a conversation or start a new chat to begin messaging
                  </p>
                  <button
                    onClick={() => setShowUserSearch(true)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Start New Chat
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* User Search Modal */}
      <AnimatePresence>
        {showUserSearch && (
          <UserSearch
            onClose={() => setShowUserSearch(false)}
            onSelectUser={handleNewConversation}
          />
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <Profile
            onClose={() => setShowProfile(false)}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <Settings
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;
