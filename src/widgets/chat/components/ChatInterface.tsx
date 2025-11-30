import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Trash2, Download, Copy } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from './ModelSelector';
import { useChatStore } from '../store';
import { ChatAPI } from '../utils/api';
import type { Message, FileAttachment, ChatSession } from '../types';

interface ChatInterfaceProps {
  session: ChatSession;
  onClose?: () => void;
  className?: string;
}

export default function ChatInterface({ session, onClose, className = '' }: ChatInterfaceProps) {
  const { config, addMessage, updateMessage, clearSession } = useChatStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState(session.model);
  const abortControllerRef = useRef<AbortController | null>(null);

  const api = new ChatAPI(config);

  useEffect(() => {
    // Load available models
    api.getModels().then(({ models }) => {
      setAvailableModels(models);
    }).catch(console.error);
  }, []);

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    // Add user message
    const userMessage: Omit<Message, 'id' | 'timestamp'> = {
      content,
      role: 'user',
      attachments,
    };
    addMessage(session.id, userMessage);

    // Start streaming response
    setIsStreaming(true);
    
    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Add initial assistant message
      const assistantMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        model: selectedModel,
        isStreaming: true,
      };
      
      addMessage(session.id, assistantMessage);

      // Build context from previous messages
      const context = session.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = '';

      // Stream the response
      for await (const chunk of api.streamChat(content, {
        model: selectedModel,
        context,
        attachments,
        sessionId: session.id,
      })) {
        if (chunk.type === 'chunk' && chunk.content) {
          fullResponse += chunk.content;
          updateMessage(session.id, assistantMessageId, {
            content: fullResponse,
            isStreaming: true,
          });
        } else if (chunk.type === 'complete') {
          updateMessage(session.id, assistantMessageId, {
            content: chunk.fullResponse || fullResponse,
            isStreaming: false,
            model: chunk.model,
          });
          break;
        } else if (chunk.type === 'error') {
          updateMessage(session.id, assistantMessageId, {
            content: `Error: ${chunk.error}`,
            isStreaming: false,
          });
          break;
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Update the last message with error
      const lastMessage = session.messages[session.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        updateMessage(session.id, lastMessage.id, {
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          isStreaming: false,
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear this chat?')) {
      clearSession(session.id);
    }
  };

  const handleExportChat = () => {
    const chatData = {
      session: session.name,
      model: session.model,
      timestamp: new Date().toISOString(),
      messages: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        model: msg.model,
      })),
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `chat-${session.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyChat = async () => {
    const chatText = session.messages
      .map(msg => `**${msg.role}**: ${msg.content}`)
      .join('\n\n');
    
    try {
      await navigator.clipboard.writeText(chatText);
      alert('Chat copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy chat:', error);
      alert('Failed to copy chat to clipboard');
    }
  };

  return (
    <div className={`chat-interface flex flex-col h-full bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{session.name}</h3>
            <p className="text-xs text-gray-500">
              {session.messages.length} messages • Model: {selectedModel}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Model Selector */}
          <div className="w-48">
            <ModelSelector
              selectedModel={selectedModel}
              availableModels={availableModels}
              onModelChange={setSelectedModel}
              disabled={isStreaming}
            />
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleCopyChat}
            disabled={session.messages.length === 0}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Copy chat"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportChat}
            disabled={session.messages.length === 0}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Export chat"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearChat}
            disabled={session.messages.length === 0}
            className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={session.messages}
          className="h-full overflow-y-auto"
        />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isStreaming}
          placeholder={isStreaming ? 'AI is responding...' : 'Type your message...'}
        />
      </div>
    </div>
  );
}