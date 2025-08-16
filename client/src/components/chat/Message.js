import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Trash2, Clock } from 'lucide-react';

const Message = ({ message, isOwn, onDelete, canDelete }) => {
  const [showOptions, setShowOptions] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    onDelete(message._id);
    setShowOptions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
             <div className={`max-w-xs lg:max-w-md relative group`}>

         
         {/* Message Bubble */}
         <div
           className={`px-4 py-2 rounded-2xl break-words ${
             isOwn
               ? 'bg-blue-500 text-white ml-auto'
               : 'bg-white text-gray-800 border border-gray-200'
           }`}
         >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Message Time and Read Status */}
          <div className={`flex items-center justify-end mt-2 space-x-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <Clock className="w-3 h-3" />
            <span className="text-xs">{formatTime(message.createdAt)}</span>
            
            {/* Read Indicator for Own Messages */}
            {isOwn && (
              <div className="flex items-center ml-2">
                {message.read ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="w-3 h-3 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Options */}
        {canDelete && (
          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 bg-gray-800 bg-opacity-75 text-white rounded-full hover:bg-opacity-100 transition-all duration-200"
            >
              <MoreVertical className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                >
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Temporary Message Indicator */}
        {message.isTemp && (
          <div className="absolute -bottom-6 right-0">
            <span className="text-xs text-gray-500 italic">Sending...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;
