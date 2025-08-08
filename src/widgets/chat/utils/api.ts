import type { StreamingResponse, ChatConfig } from '../types';

export class ChatAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(config: ChatConfig) {
    this.baseUrl = config.apiBaseUrl || 'http://localhost:3001/api';
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async getModels(): Promise<{ models: string[]; default: string }> {
    const response = await fetch(`${this.baseUrl}/chat/models`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    return response.json();
  }

  async* streamChat(
    message: string,
    options: {
      model?: string;
      context?: any[];
      attachments?: any[];
      sessionId?: string;
    } = {}
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data as StreamingResponse;
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async completeChat(
    message: string,
    options: {
      model?: string;
      context?: any[];
      attachments?: any[];
    } = {}
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/complete`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async processModelChain(
    message: string,
    chain: any[],
    context: any = {}
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/chain`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        chain,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async uploadMultipleFiles(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${this.baseUrl}/upload/multiple`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async getSupportedFileTypes(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/upload/supported`);
    if (!response.ok) {
      throw new Error('Failed to fetch supported file types');
    }
    return response.json();
  }

  // Auth methods
  async login(username: string, password: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const result = await response.json();
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async register(username: string, password: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const result = await response.json();
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  async getGuestToken(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to get guest token');
    }

    const result = await response.json();
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }
}