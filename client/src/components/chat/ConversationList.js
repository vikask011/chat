import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Check, CheckCheck } from 'lucide-react';
import LoadingSpinner from '../settings/ui/LoadingSpinner';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, loading, onNewChat }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  // Filter conversations based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    
    const content = message.content;
    if (content.length > 30) {
      return content.substring(0, 30) + '...';
    }
    return content;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* New Chat Button */}
      <div className="p-4 border-b border-chat-border">
        <button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Header */}
      <div className="p-4 border-b border-chat-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <AnimatePresence>
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  selectedConversation?.user?._id === conversation.user._id
                    ? 'bg-blue-50 border-l-4 border-l-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {conversation.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.user.username}
                      </h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(conversation.lastMessage?.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {getMessagePreview(conversation.lastMessage)}
                      </p>
                      
                      {/* Unread count and read status */}
                      <div className="flex items-center space-x-2 ml-2">
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                        
                        {conversation.lastMessage && (
                          <div className="text-gray-400">
                            {conversation.lastMessage.sender === conversation.user._id ? (
                              // Show read status for messages sent by the other user
                              conversation.lastMessage.read ? (
                                <div className="flex items-center space-x-0.5">
                                  <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  </div>
                                  <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  </div>
                                </div>
                              ) : (
                                <Check className="w-4 h-4" />
                              )
                            ) : (
                              // Show read status for messages sent by current user
                              conversation.lastMessage.read ? (
                                <div className="flex items-center space-x-0.5">
                                  <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  </div>
                                  <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  </div>
                                </div>
                              ) : (
                                <Check className="w-4 h-4" />
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
