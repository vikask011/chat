import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, User, MessageCircle } from 'lucide-react';
import LoadingSpinner from '../settings/ui/LoadingSpinner';

const UserSearch = ({ onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Search users when search term changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim().length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/search?q=${encodeURIComponent(searchTerm.trim())}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError('Failed to search users');
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setError('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, API_BASE_URL]);

  const handleUserSelect = (user) => {
    onSelectUser(user);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">New Chat</h2>
              <p className="text-sm text-gray-500">Search for users to start chatting</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-6 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              {error}
            </div>
          ) : searchTerm.trim().length < 2 ? (
            <div className="p-6 text-center text-gray-500">
              Type at least 2 characters to search
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <div className="p-2">
              <AnimatePresence>
                {users.map((user, index) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => handleUserSelect(user)}
                    className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{user.username}</h3>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm text-gray-500">
                            {user.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      
                      <button className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            Start a new conversation with any user
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserSearch;
