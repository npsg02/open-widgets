import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { RoadmapItem, RoadmapSettings, RoadmapState, ExternalConfig } from './roadmap-types';

const defaultSettings: RoadmapSettings = {
  darkMode: false,
  viewMode: 'timeline',
  timelineView: 'quarters',
  showProgress: true,
  showLabels: true,
  showDates: true,
  availableLabels: ['Feature', 'Bug Fix', 'Research', 'Infrastructure', 'Release'],
  labelColors: {
    'Feature': 'bg-blue-100 text-blue-800',
    'Bug Fix': 'bg-red-100 text-red-800',
    'Research': 'bg-purple-100 text-purple-800',
    'Infrastructure': 'bg-gray-100 text-gray-800',
    'Release': 'bg-green-100 text-green-800',
  },
  statusColors: {
    'planned': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'on-hold': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800',
  },
  autoSave: true,
};

const STORAGE_KEY = 'roadmap-widget-data';

// Load initial state from localStorage
const loadFromStorage = (): Partial<RoadmapState> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Save state to localStorage
const saveToStorage = (state: RoadmapState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: state.items,
      settings: state.settings,
      startDate: state.startDate,
      endDate: state.endDate,
    }));
  } catch {
    // Handle storage errors silently
  }
};

// Generate date range based on current date
const generateDateRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1); // Start of current year
  const endDate = new Date(now.getFullYear() + 2, 11, 31); // End of next year
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

export const useRoadmapStore = create<RoadmapState & {
  // Item actions
  addItem: (item: Omit<RoadmapItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateItem: (id: string, updates: Partial<RoadmapItem>) => void;
  deleteItem: (id: string) => void;
  reorderItems: (itemIds: string[]) => void;
  moveItem: (itemId: string, newStartDate: string, newEndDate: string) => void;
  
  // Settings actions
  updateSettings: (updates: Partial<RoadmapSettings>) => void;
  toggleDarkMode: () => void;
  setViewMode: (mode: 'timeline' | 'list') => void;
  setTimelineView: (view: 'quarters' | 'months' | 'weeks') => void;
  addLabel: (label: string, color?: string) => void;
  
  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedLabels: (labels: string[]) => void;
  setSelectedStatus: (statuses: string[]) => void;
  setSelectedPriority: (priorities: string[]) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  clearFilters: () => void;
  
  // External config
  applyExternalConfig: (config: ExternalConfig) => void;
  
  // Export/Import
  exportData: () => string;
  importData: (data: string) => boolean;
  
  // Utilities
  getFilteredItems: () => RoadmapItem[];
  getItemsByDateRange: (start: string, end: string) => RoadmapItem[];
}>((set, get) => {
  const storedData = loadFromStorage();
  const dateRange = generateDateRange();
  
  const initialState: RoadmapState = {
    items: storedData.items || {},
    settings: { ...defaultSettings, ...storedData.settings },
    searchQuery: '',
    selectedLabels: [],
    selectedStatus: [],
    selectedPriority: [],
    startDate: storedData.startDate || dateRange.startDate,
    endDate: storedData.endDate || dateRange.endDate,
  };

  return {
    ...initialState,

    addItem: (itemData) => {
      const item: RoadmapItem = {
        ...itemData,
        id: uuidv4(),
        order: Object.keys(get().items).length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => {
        const newState = {
          ...state,
          items: { ...state.items, [item.id]: item },
        };
        if (state.settings.autoSave) saveToStorage(newState);
        return newState;
      });
    },

    updateItem: (id, updates) => {
      set((state) => {
        if (!state.items[id]) return state;
        
        const newState = {
          ...state,
          items: {
            ...state.items,
            [id]: {
              ...state.items[id],
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        };
        if (state.settings.autoSave) saveToStorage(newState);
        return newState;
      });
    },

    deleteItem: (id) => {
      set((state) => {
        const { [id]: deleted, ...remainingItems } = state.items;
        const newState = { ...state, items: remainingItems };
        if (state.settings.autoSave) saveToStorage(newState);
        return newState;
      });
    },

    reorderItems: (itemIds) => {
      set((state) => {
        const updatedItems = { ...state.items };
        itemIds.forEach((id, index) => {
          if (updatedItems[id]) {
            updatedItems[id] = { ...updatedItems[id], order: index };
          }
        });
        
        const newState = { ...state, items: updatedItems };
        if (state.settings.autoSave) saveToStorage(newState);
        return newState;
      });
    },

    moveItem: (itemId, newStartDate, newEndDate) => {
      get().updateItem(itemId, {
        startDate: newStartDate,
        endDate: newEndDate,
      });
    },

    updateSettings: (updates) => {
      set((state) => {
        const newState = {
          ...state,
          settings: { ...state.settings, ...updates },
        };
        if (state.settings.autoSave) saveToStorage(newState);
        return newState;
      });
    },

    toggleDarkMode: () => {
      const settings = get().settings;
      get().updateSettings({ darkMode: !settings.darkMode });
    },

    setViewMode: (mode) => {
      get().updateSettings({ viewMode: mode });
    },

    setTimelineView: (view) => {
      get().updateSettings({ timelineView: view });
    },

    addLabel: (label, color) => {
      const settings = get().settings;
      if (settings.availableLabels.includes(label)) return;
      
      const labelColor = color || 'bg-gray-100 text-gray-800';
      
      get().updateSettings({
        availableLabels: [...settings.availableLabels, label],
        labelColors: { ...settings.labelColors, [label]: labelColor },
      });
    },

    setSearchQuery: (query) => {
      set((state) => ({ ...state, searchQuery: query }));
    },

    setSelectedLabels: (labels) => {
      set((state) => ({ ...state, selectedLabels: labels }));
    },

    setSelectedStatus: (statuses) => {
      set((state) => ({ ...state, selectedStatus: statuses }));
    },

    setSelectedPriority: (priorities) => {
      set((state) => ({ ...state, selectedPriority: priorities }));
    },

    setDateRange: (startDate, endDate) => {
      set((state) => {
        const newState = { ...state, startDate, endDate };
        if (state.settings.autoSave) saveToStorage(newState);
        return newState;
      });
    },

    clearFilters: () => {
      set((state) => ({
        ...state,
        searchQuery: '',
        selectedLabels: [],
        selectedStatus: [],
        selectedPriority: [],
      }));
    },

    applyExternalConfig: (config) => {
      if (config.initialItems) {
        const items: Record<string, RoadmapItem> = {};
        config.initialItems.forEach((item) => {
          items[item.id] = item;
        });
        set((state) => ({ ...state, items }));
      }
      
      if (config.settings) {
        get().updateSettings(config.settings);
      }
      
      if (config.theme?.darkMode !== undefined) {
        get().updateSettings({ darkMode: config.theme.darkMode });
      }
    },

    exportData: () => {
      const state = get();
      const exportData = {
        items: Object.values(state.items),
        settings: state.settings,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      return JSON.stringify(exportData, null, 2);
    },

    importData: (data) => {
      try {
        const importedData = JSON.parse(data);
        
        if (!importedData.items || !Array.isArray(importedData.items)) {
          return false;
        }
        
        const items: Record<string, RoadmapItem> = {};
        importedData.items.forEach((item: RoadmapItem) => {
          // Validate required fields
          if (item.id && item.title && item.startDate && item.endDate) {
            items[item.id] = {
              ...item,
              updatedAt: new Date().toISOString(),
            };
          }
        });
        
        set((state) => {
          const newState = {
            ...state,
            items,
            settings: importedData.settings ? { ...state.settings, ...importedData.settings } : state.settings,
          };
          if (state.settings.autoSave) saveToStorage(newState);
          return newState;
        });
        
        return true;
      } catch {
        return false;
      }
    },

    getFilteredItems: () => {
      const state = get();
      const { items, searchQuery, selectedLabels, selectedStatus, selectedPriority } = state;
      
      return Object.values(items).filter((item) => {
        // Search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = 
            item.title.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.labels.some((label) => label.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) return false;
        }
        
        // Label filter
        if (selectedLabels.length > 0) {
          const hasSelectedLabel = selectedLabels.some((label) => item.labels.includes(label));
          if (!hasSelectedLabel) return false;
        }
        
        // Status filter
        if (selectedStatus.length > 0) {
          if (!selectedStatus.includes(item.status)) return false;
        }
        
        // Priority filter
        if (selectedPriority.length > 0) {
          if (!selectedPriority.includes(item.priority)) return false;
        }
        
        return true;
      }).sort((a, b) => a.order - b.order);
    },

    getItemsByDateRange: (start, end) => {
      const items = get().getFilteredItems();
      return items.filter((item) => {
        const itemStart = new Date(item.startDate);
        const itemEnd = new Date(item.endDate);
        const rangeStart = new Date(start);
        const rangeEnd = new Date(end);
        
        // Item overlaps with the date range
        return itemStart <= rangeEnd && itemEnd >= rangeStart;
      });
    },
  };
});