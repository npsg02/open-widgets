import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatSession, Message, User, ChatConfig, FileAttachment } from './types';

interface ChatStore {
  // State
  sessions: ChatSession[];
  activeSessions: string[];
  currentUser: User | null;
  config: ChatConfig;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  addSession: (model: string, name?: string) => string;
  removeSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string, active: boolean) => void;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  clearSession: (sessionId: string) => void;
  setUser: (user: User | null) => void;
  setConfig: (config: Partial<ChatConfig>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Getters
  getSession: (sessionId: string) => ChatSession | undefined;
  getActiveSessionIds: () => string[];
}

const defaultConfig: ChatConfig = {
  apiBaseUrl: 'http://localhost:3001/api',
  defaultModel: 'gpt-4o-mini',
  enableFileUploads: true,
  enableModelChains: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['.txt', '.md', '.pdf', '.png', '.jpg', '.jpeg'],
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessions: [],
      activeSessions: [],
      currentUser: null,
      config: defaultConfig,
      isAuthenticated: false,
      theme: 'light',

      // Actions
      addSession: (model: string, name?: string) => {
        const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session: ChatSession = {
          id,
          name: name || `Chat with ${model}`,
          model,
          messages: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessions: [...state.activeSessions, id],
        }));

        return id;
      },

      removeSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          activeSessions: state.activeSessions.filter(id => id !== sessionId),
        }));
      },

      setActiveSession: (sessionId: string, active: boolean) => {
        set((state) => {
          const activeSessions = active
            ? [...new Set([...state.activeSessions, sessionId])]
            : state.activeSessions.filter(id => id !== sessionId);

          return {
            sessions: state.sessions.map(s => 
              s.id === sessionId ? { ...s, isActive: active } : s
            ),
            activeSessions,
          };
        });
      },

      addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newMessage: Message = {
          ...message,
          id,
          timestamp: new Date(),
        };

        set((state) => ({
          sessions: state.sessions.map(s => 
            s.id === sessionId 
              ? { 
                  ...s, 
                  messages: [...s.messages, newMessage],
                  updatedAt: new Date(),
                }
              : s
          ),
        }));
      },

      updateMessage: (sessionId: string, messageId: string, updates: Partial<Message>) => {
        set((state) => ({
          sessions: state.sessions.map(s => 
            s.id === sessionId 
              ? {
                  ...s,
                  messages: s.messages.map(m => 
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: new Date(),
                }
              : s
          ),
        }));
      },

      clearSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map(s => 
            s.id === sessionId 
              ? { ...s, messages: [], updatedAt: new Date() }
              : s
          ),
        }));
      },

      setUser: (user: User | null) => {
        set({ currentUser: user, isAuthenticated: !!user });
      },

      setConfig: (config: Partial<ChatConfig>) => {
        set((state) => ({
          config: { ...state.config, ...config },
        }));
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },

      // Getters
      getSession: (sessionId: string) => {
        return get().sessions.find(s => s.id === sessionId);
      },

      getActiveSessionIds: () => {
        return get().activeSessions;
      },
    }),
    {
      name: 'chat-widget-store',
      // Only persist essential data
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessions: state.activeSessions,
        config: state.config,
        theme: state.theme,
      }),
    }
  )
);