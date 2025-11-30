import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface FeedConfig {
  feedUrls: string[];
  maxItems: number;
  showDescription: boolean;
  showDate: boolean;
  updateInterval: number;
}

interface FeedSettingsModalProps {
  config: FeedConfig;
  onSave: (config: FeedConfig) => void;
  onCancel: () => void;
}

const FeedSettingsModal: React.FC<FeedSettingsModalProps> = ({ config, onSave, onCancel }) => {
  const [localConfig, setLocalConfig] = useState<FeedConfig>(config);
  const [newFeedUrl, setNewFeedUrl] = useState('');

  const addFeedUrl = () => {
    if (newFeedUrl.trim() && !localConfig.feedUrls.includes(newFeedUrl.trim())) {
      setLocalConfig(prev => ({
        ...prev,
        feedUrls: [...prev.feedUrls, newFeedUrl.trim()]
      }));
      setNewFeedUrl('');
    }
  };

  const removeFeedUrl = (index: number) => {
    setLocalConfig(prev => ({
      ...prev,
      feedUrls: prev.feedUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Feed Settings</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Feed URLs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              RSS Feed URLs
            </label>
            <div className="space-y-2">
              {localConfig.feedUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    onClick={() => removeFeedUrl(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addFeedUrl()}
                />
                <button
                  onClick={addFeedUrl}
                  disabled={!newFeedUrl.trim()}
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Max Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Items to Display
            </label>
            <input
              type="number"
              value={localConfig.maxItems}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, maxItems: parseInt(e.target.value) || 10 }))}
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Update Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Interval (minutes)
            </label>
            <input
              type="number"
              value={localConfig.updateInterval}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, updateInterval: parseInt(e.target.value) || 5 }))}
              min="1"
              max="60"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Display Options</h3>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localConfig.showDescription}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, showDescription: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show item descriptions</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localConfig.showDate}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, showDate: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show publication dates</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedSettingsModal;