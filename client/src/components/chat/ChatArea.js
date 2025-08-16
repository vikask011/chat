import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, MoreVertical, Trash2, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import Message from './Message';
import LoadingSpinner from '../settings/ui/LoadingSpinner';

const ChatArea = ({ conversation, onUpdateConversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  
  const { user } = useAuth();
  const { sendMessage, sendTypingIndicator } = useSocket();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation && !conversation.isNew) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [conversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if user is blocked
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!conversation?.user?._id) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/users/blocked/list`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const blockedUsers = await response.json();
          const isBlocked = blockedUsers.some(blockedUser => 
            blockedUser._id === conversation.user._id
          );
          setIsUserBlocked(isBlocked);
        }
      } catch (error) {
        console.error('Error checking block status:', error);
      }
    };

    checkBlockStatus();
  }, [conversation, API_BASE_URL]);

  const fetchMessages = async () => {
    if (!conversation?.user?._id) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/conversation/${conversation.user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        
        // Update conversation with messages
        onUpdateConversation({
          ...conversation,
          messages: data.messages
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    // Add message to local state immediately for optimistic UI
    const tempMessage = {
      _id: Date.now().toString(),
      content: messageContent,
      sender: user._id,
      recipient: conversation.user._id,
      createdAt: new Date(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      // Send message via API
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: conversation.user._id,
          content: messageContent
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        
        // Replace temp message with real message
        setMessages(prev => 
          prev.map(msg => 
            msg.isTemp ? sentMessage : msg
          )
        );

        // Update conversation
        onUpdateConversation({
          ...conversation,
          messages: [...messages, sentMessage],
          lastMessage: sentMessage
        });

        // Send via socket for real-time delivery
        sendMessage(conversation.user._id, messageContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => !msg.isTemp));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    sendTypingIndicator(conversation.user._id);
    
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator after delay
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!conversation?.user?._id) return;
    
    setBlockLoading(true);
    try {
      const method = isUserBlocked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE_URL}/users/block/${conversation.user._id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsUserBlocked(!isUserBlocked);
        setShowOptions(false);
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
    } finally {
      setBlockLoading(false);
    }
  };

  if (!conversation) return null;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-chat-border bg-white">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {conversation.user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800">{conversation.user.username}</h3>
            <p className="text-sm text-gray-500">
              {conversation.user.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <button
                  onClick={handleBlockUser}
                  disabled={blockLoading}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {blockLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : isUserBlocked ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                  <span>{isUserBlocked ? 'Unblock User' : 'Block User'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                                                              <Message
                       message={message}
                       isOwn={String(message.sender) === String(user._id)}
                       onDelete={() => deleteMessage(message._id)}
                       canDelete={String(message.sender) === String(user._id)}
                     />
                     
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-chat-border bg-white">
        {isUserBlocked ? (
          <div className="text-center text-gray-500 py-4">
            <UserX className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>You cannot send messages to this user</p>
            <button
              onClick={handleBlockUser}
              disabled={blockLoading}
              className="mt-2 text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {blockLoading ? 'Loading...' : 'Unblock User'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatArea;
