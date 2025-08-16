import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Plus, Settings, User, MessageCircle } from 'lucide-react';

const Sidebar = ({ user, onLogout, onNewChat, onShowProfile, onShowSettings, onShowConversations }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-chat-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 text-lg">{user?.username}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <motion.button
            whileHover={{ x: 4 }}
            onClick={onShowConversations}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Conversations</span>
          </motion.button>
          
          <motion.button
            whileHover={{ x: 4 }}
            onClick={onShowProfile}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </motion.button>
          
          <motion.button
            whileHover={{ x: 4 }}
            onClick={onShowSettings}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </motion.button>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-chat-border">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
