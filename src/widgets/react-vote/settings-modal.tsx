import React from 'react';
import { X, Settings, RefreshCw, Palette, Eye, Zap, MousePointer } from 'lucide-react';
import { useVoteStore } from './react-vote-store';
import { DEFAULT_REACTIONS } from './react-vote-types';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, setSettings, resetVotes } = useVoteStore();

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ [key]: value });
  };

  const handleReactionToggle = (emojiId: string) => {
    const updatedReactions = settings.availableReactions.map(reaction =>
      reaction.emoji === emojiId
        ? { ...reaction, enabled: !reaction.enabled }
        : reaction
    );
    setSettings({ availableReactions: updatedReactions });
  };

  const themeClasses = settings.darkMode
    ? 'bg-gray-900 text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';

  const buttonClasses = settings.darkMode
    ? 'bg-gray-800 hover:bg-gray-700 border-gray-600'
    : 'bg-gray-100 hover:bg-gray-200 border-gray-300';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeClasses} border rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Settings size={20} />
            <h2 className="text-xl font-bold">Widget Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${buttonClasses} transition-colors`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Appearance Settings */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Palette size={18} />
              <span>Appearance</span>
            </h3>
            
            <div className="space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Dark Mode</label>
                <button
                  onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Button Size */}
              <div>
                <label className="block text-sm font-medium mb-2">Button Size</label>
                <div className="flex space-x-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => handleSettingChange('buttonSize', size)}
                      className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                        settings.buttonSize === size
                          ? 'bg-blue-500 text-white'
                          : buttonClasses
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Behavior Settings */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <MousePointer size={18} />
              <span>Behavior</span>
            </h3>
            
            <div className="space-y-4">
              {/* Show Counts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye size={16} />
                  <label className="text-sm font-medium">Show Vote Counts</label>
                </div>
                <button
                  onClick={() => handleSettingChange('showCounts', !settings.showCounts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showCounts ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showCounts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Multiple Reactions */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Allow Multiple Reactions</label>
                <button
                  onClick={() => handleSettingChange('allowMultipleReactions', !settings.allowMultipleReactions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.allowMultipleReactions ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.allowMultipleReactions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap size={16} />
                  <label className="text-sm font-medium">Enable Animations</label>
                </div>
                <button
                  onClick={() => handleSettingChange('animationsEnabled', !settings.animationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.animationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Available Reactions */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Available Reactions</h3>
            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_REACTIONS.map(reaction => {
                const isEnabled = settings.availableReactions.find(
                  r => r.emoji === reaction.emoji
                )?.enabled ?? true;
                
                return (
                  <button
                    key={reaction.emoji}
                    onClick={() => handleReactionToggle(reaction.emoji)}
                    className={`p-2 rounded-lg border-2 transition-colors flex items-center space-x-2 ${
                      isEnabled
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 opacity-50'
                    }`}
                  >
                    <span className="text-lg">{reaction.emoji}</span>
                    <span className="text-sm">{reaction.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <button
              onClick={() => {
                resetVotes();
                onClose();
              }}
              className={`w-full ${buttonClasses} border px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors`}
            >
              <RefreshCw size={16} />
              <span>Reset All Votes</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;