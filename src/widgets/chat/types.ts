export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  model?: string;
  attachments?: FileAttachment[];
  isStreaming?: boolean;
}

export interface FileAttachment {
  id: string;
  filename: string;
  type: string;
  size: number;
  content?: string;
  summary?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  model: string;
  messages: Message[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelChainStep {
  name: string;
  model: string;
  prompt_template?: string;
  transform?: (input: string) => string;
}

export interface ModelChain {
  id: string;
  name: string;
  steps: ModelChainStep[];
  description?: string;
}

export interface User {
  id: string;
  username: string;
  isGuest?: boolean;
}

export interface ChatConfig {
  apiBaseUrl?: string;
  defaultModel?: string;
  enableFileUploads?: boolean;
  enableModelChains?: boolean;
  maxFileSize?: number;
  supportedFileTypes?: string[];
}

export interface StreamingResponse {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  fullResponse?: string;
  error?: string;
  model?: string;
  timestamp: string;
}

export interface ExternalConfig {
  apiBaseUrl?: string;
  theme?: {
    darkMode?: boolean;
    primaryColor?: string;
  };
  settings?: {
    defaultModel?: string;
    enableAuth?: boolean;
    enableFileUploads?: boolean;
    enableModelChains?: boolean;
  };
}