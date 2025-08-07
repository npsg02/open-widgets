export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  progress: number; // 0-100
  color?: string;
  order: number; // for sorting
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapSettings {
  darkMode: boolean;
  viewMode: 'timeline' | 'list';
  timelineView: 'quarters' | 'months' | 'weeks';
  showProgress: boolean;
  showLabels: boolean;
  showDates: boolean;
  availableLabels: string[];
  labelColors: Record<string, string>;
  statusColors: Record<string, string>;
  autoSave: boolean;
}

export interface RoadmapState {
  items: Record<string, RoadmapItem>;
  settings: RoadmapSettings;
  searchQuery: string;
  selectedLabels: string[];
  selectedStatus: string[];
  selectedPriority: string[];
  startDate: string; // View range start
  endDate: string; // View range end
}

export interface ExternalConfig {
  initialItems?: RoadmapItem[];
  settings?: Partial<RoadmapSettings>;
  theme?: {
    darkMode?: boolean;
    primaryColor?: string;
  };
}

export interface TimelineColumn {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  type: 'quarter' | 'month' | 'week';
}