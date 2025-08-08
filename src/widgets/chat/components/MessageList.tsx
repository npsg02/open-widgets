import React, { useEffect, useRef } from 'react';
import { Bot, User, Clock, FileText } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import type { Message, FileAttachment } from '../types';

interface MessageListProps {
  messages: Message[];
  className?: string;
  autoScroll?: boolean;
}

export default function MessageList({ messages, className = '', autoScroll = true }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(timestamp));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderAttachments = (attachments: FileAttachment[]) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        {attachments.map((attachment) => (
          <div 
            key={attachment.id}
            className="flex items-center space-x-2 p-2 bg-gray-50 rounded border text-sm"
          >
            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {attachment.filename}
              </div>
              <div className="text-gray-500 text-xs">
                {attachment.type} • {formatFileSize(attachment.size)}
              </div>
              {attachment.summary && (
                <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                  {attachment.summary}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className={`message-list-empty ${className}`}>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <Bot className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Start a conversation
          </h3>
          <p className="text-gray-500 max-w-sm">
            Send a message to begin chatting with the AI. You can ask questions, 
            request help, or have a casual conversation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-list ${className}`}>
      <div className="space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-item flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div className={`
              max-w-[80%] flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} 
              items-start space-x-2 ${message.role === 'user' ? 'space-x-reverse' : ''}
            `}>
              {/* Avatar */}
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                ${message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Content */}
              <div className={`
                rounded-lg px-4 py-2 shadow-sm
                ${message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white border border-gray-200'
                }
              `}>
                {/* Attachments (for user messages) */}
                {message.role === 'user' && message.attachments && (
                  <div className="mb-2">
                    {renderAttachments(message.attachments)}
                  </div>
                )}

                {/* Message Text */}
                {message.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <div className="text-gray-900">
                    {message.isStreaming ? (
                      <div className="flex items-center space-x-2">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="animate-pulse">▋</div>
                      </div>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                  </div>
                )}

                {/* Message Metadata */}
                <div className={`
                  flex items-center justify-between mt-2 text-xs
                  ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}
                `}>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(message.timestamp)}</span>
                    {message.model && message.role === 'assistant' && (
                      <>
                        <span>•</span>
                        <span>{message.model}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}