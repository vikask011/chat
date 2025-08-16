import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Palette, X, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = ({ onClose }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      newMessage: true,
      typingIndicator: true,
      sound: true
    },
    privacy: {
      showStatus: true,
      showLastSeen: true,
      allowMessagesFrom: 'all' // 'all', 'contacts', 'none'
    },
    appearance: {
      theme: 'light', // 'light', 'dark', 'auto'
      fontSize: 'medium', // 'small', 'medium', 'large'
      compactMode: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Here you would typically save settings to the backend
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Notifications Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">New Message Notifications</h4>
                  <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newMessage}
                    onChange={(e) => handleSettingChange('notifications', 'newMessage', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">Typing Indicators</h4>
                  <p className="text-sm text-gray-500">Show when someone is typing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.typingIndicator}
                    onChange={(e) => handleSettingChange('notifications', 'typingIndicator', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">Sound Notifications</h4>
                  <p className="text-sm text-gray-500">Play sound for new messages</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sound}
                    onChange={(e) => handleSettingChange('notifications', 'sound', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Privacy</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">Show Online Status</h4>
                  <p className="text-sm text-gray-500">Let others see when you're online</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showStatus}
                    onChange={(e) => handleSettingChange('privacy', 'showStatus', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">Show Last Seen</h4>
                  <p className="text-sm text-gray-500">Let others see when you were last active</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showLastSeen}
                    onChange={(e) => handleSettingChange('privacy', 'showLastSeen', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Who Can Message Me</h4>
                <select
                  value={settings.privacy.allowMessagesFrom}
                  onChange={(e) => handleSettingChange('privacy', 'allowMessagesFrom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Everyone</option>
                  <option value="contacts">Contacts Only</option>
                  <option value="none">No One</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">Control who can send you messages</p>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">Appearance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Theme</h4>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Font Size</h4>
                <select
                  value={settings.appearance.fontSize}
                  onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-700">Compact Mode</h4>
                  <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.appearance.compactMode}
                    onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;
