import React, { useState, useEffect } from 'react';
import { Plus, Settings, Grid2x2, Layers, Bot, Moon, Sun } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import { useChatStore } from './store';
import { ChatAPI } from './utils/api';
import type { ExternalConfig } from './types';

interface ChatWidgetProps {
  config?: ExternalConfig;
}

export default function ChatWidget({ config: externalConfig }: ChatWidgetProps) {
  const {
    sessions,
    activeSessions,
    theme,
    config,
    addSession,
    removeSession,
    setActiveSession,
    setConfig,
    setTheme,
    getSession,
  } = useChatStore();

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'grid' | 'stack'>('single');

  const api = new ChatAPI(config);

  // Apply external configuration
  useEffect(() => {
    if (externalConfig) {
      if (externalConfig.apiBaseUrl) {
        setConfig({ apiBaseUrl: externalConfig.apiBaseUrl });
      }
      if (externalConfig.settings) {
        setConfig(externalConfig.settings);
      }
      if (externalConfig.theme?.darkMode !== undefined) {
        setTheme(externalConfig.theme.darkMode ? 'dark' : 'light');
      }
    }
  }, [externalConfig]);

  // Listen for postMessage configuration
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CHAT_CONFIG') {
        const { config: messageConfig } = event.data;
        if (messageConfig.apiBaseUrl) {
          setConfig({ apiBaseUrl: messageConfig.apiBaseUrl });
        }
        if (messageConfig.settings) {
          setConfig(messageConfig.settings);
        }
        if (messageConfig.theme) {
          setTheme(messageConfig.theme.darkMode ? 'dark' : 'light');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Load available models
  useEffect(() => {
    api.getModels().then(({ models, default: defaultModel }) => {
      setAvailableModels(models);
      if (defaultModel && config.defaultModel !== defaultModel) {
        setConfig({ defaultModel });
      }
    }).catch(console.error);
  }, [config.apiBaseUrl]);

  const handleNewChat = () => {
    const defaultModel = config.defaultModel || 'gpt-4o-mini';
    const sessionId = addSession(defaultModel);
    setActiveSession(sessionId, true);
  };

  const handleCloseSession = (sessionId: string) => {
    setActiveSession(sessionId, false);
    if (activeSessions.length <= 1) {
      // If this is the last active session, remove it entirely
      removeSession(sessionId);
    }
  };

  const activeSessionObjects = activeSessions
    .map(id => getSession(id))
    .filter(Boolean);

  const renderSessionGrid = () => {
    if (activeSessionObjects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Bot className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to AI Chat
          </h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Start a conversation with AI models. You can chat with multiple models 
            simultaneously, upload files, and chain model responses.
          </p>
          <button
            onClick={handleNewChat}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Chat</span>
          </button>
        </div>
      );
    }

    if (viewMode === 'single' || activeSessionObjects.length === 1) {
      return (
        <ChatInterface
          key={activeSessionObjects[0].id}
          session={activeSessionObjects[0]}
          onClose={() => handleCloseSession(activeSessionObjects[0].id)}
          className="h-full"
        />
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className={`grid gap-4 h-full p-4 ${
          activeSessionObjects.length === 2 ? 'grid-cols-2' : 
          activeSessionObjects.length === 3 ? 'grid-cols-2 grid-rows-2' :
          'grid-cols-2 grid-rows-2'
        }`}>
          {activeSessionObjects.map((session) => (
            <ChatInterface
              key={session.id}
              session={session}
              onClose={() => handleCloseSession(session.id)}
              className="min-h-0"
            />
          ))}
        </div>
      );
    }

    // Stack mode
    return (
      <div className="flex flex-col gap-4 h-full p-4 overflow-y-auto">
        {activeSessionObjects.map((session) => (
          <div key={session.id} className="flex-shrink-0 h-96">
            <ChatInterface
              session={session}
              onClose={() => handleCloseSession(session.id)}
              className="h-full"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`chat-widget w-full h-full ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Chat
            </h1>
            
            {activeSessionObjects.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('single')}
                  className={`p-1.5 rounded ${viewMode === 'single' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Single view"
                >
                  <Bot className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid view"
                >
                  <Grid2x2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('stack')}
                  className={`p-1.5 rounded ${viewMode === 'stack' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Stack view"
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              disabled={activeSessions.length >= 4} // Limit to 4 active sessions
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-[calc(100%-4rem)] relative">
          {renderSessionGrid()}

          {/* Settings Modal */}
          {showSettings && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chat Settings
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Base URL
                    </label>
                    <input
                      type="text"
                      value={config.apiBaseUrl || ''}
                      onChange={(e) => setConfig({ apiBaseUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="http://localhost:3001/api"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Model
                    </label>
                    <select
                      value={config.defaultModel || ''}
                      onChange={(e) => setConfig({ defaultModel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      {availableModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable File Uploads
                    </span>
                    <button
                      onClick={() => setConfig({ enableFileUploads: !config.enableFileUploads })}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        config.enableFileUploads ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        config.enableFileUploads ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Model Chains
                    </span>
                    <button
                      onClick={() => setConfig({ enableModelChains: !config.enableModelChains })}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        config.enableModelChains ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        config.enableModelChains ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}