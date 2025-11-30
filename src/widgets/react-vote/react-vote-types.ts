export interface Reaction {
  id: string;
  emoji: string;
  label: string;
  count: number;
}

export interface ReactionConfig {
  enabled: boolean;
  emoji: string;
  label: string;
  color?: string;
}

export interface VoteSettings {
  darkMode: boolean;
  showCounts: boolean;
  allowMultipleReactions: boolean;
  animationsEnabled: boolean;
  primaryColor: string;
  buttonSize: 'small' | 'medium' | 'large';
  availableReactions: ReactionConfig[];
}

export interface UserVotes {
  [reactionId: string]: boolean;
}

export interface VoteData {
  reactions: Reaction[];
  userVotes: UserVotes;
  totalVotes: number;
}

export interface ExternalConfig {
  contentId?: string;
  initialReactions?: Reaction[];
  settings?: Partial<VoteSettings>;
  theme?: {
    darkMode?: boolean;
    primaryColor?: string;
  };
}

export const DEFAULT_REACTIONS: ReactionConfig[] = [
  { enabled: true, emoji: '👍', label: 'Like', color: '#3b82f6' },
  { enabled: true, emoji: '❤️', label: 'Love', color: '#ef4444' },
  { enabled: true, emoji: '😂', label: 'Funny', color: '#f59e0b' },
  { enabled: true, emoji: '😮', label: 'Wow', color: '#8b5cf6' },
  { enabled: true, emoji: '😢', label: 'Sad', color: '#6b7280' },
  { enabled: true, emoji: '😡', label: 'Angry', color: '#dc2626' },
];

export const DEFAULT_SETTINGS: VoteSettings = {
  darkMode: false,
  showCounts: true,
  allowMultipleReactions: true,
  animationsEnabled: true,
  primaryColor: '#3b82f6',
  buttonSize: 'medium',
  availableReactions: DEFAULT_REACTIONS,
};