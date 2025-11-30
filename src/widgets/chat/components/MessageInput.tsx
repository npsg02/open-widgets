import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, FileText } from 'lucide-react';
import FileUpload from './FileUpload';
import type { FileAttachment } from '../types';

interface MessageInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  className = ''
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;
    
    onSendMessage(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
    setShowFileUpload(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const handleFilesUploaded = (files: FileAttachment[]) => {
    setAttachments(prev => [...prev, ...files]);
    setShowFileUpload(false);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`message-input ${className}`}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="attachments-preview mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">
            Attached files ({attachments.length}):
          </div>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div 
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-white rounded border"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {attachment.filename}
                    </div>
                    <div className="text-xs text-gray-500">
                      {attachment.type} • {formatFileSize(attachment.size)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Area */}
      {showFileUpload && (
        <div className="mb-3">
          <FileUpload 
            onFilesUploaded={handleFilesUploaded}
            className="mb-2"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowFileUpload(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={`
                w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                min-h-[44px] max-h-32 overflow-y-auto
              `}
            />
            
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              disabled={disabled}
              className={`
                absolute right-2 top-1/2 transform -translate-y-1/2
                p-1 text-gray-400 hover:text-gray-600 transition-colors
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                ${showFileUpload ? 'text-blue-500' : ''}
              `}
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          className={`
            px-4 py-3 bg-blue-500 text-white rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${disabled || (!message.trim() && attachments.length === 0)
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-blue-600'
            }
          `}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}