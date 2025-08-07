import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  VoteSettings, 
  VoteData, 
  Reaction, 
  UserVotes, 
  ExternalConfig, 
  DEFAULT_SETTINGS,
  DEFAULT_REACTIONS 
} from './react-vote-types';

interface VoteStore {
  // State
  settings: VoteSettings;
  voteData: VoteData;
  contentId: string;

  // Actions
  toggleReaction: (reactionId: string) => void;
  setSettings: (settings: Partial<VoteSettings>) => void;
  toggleDarkMode: () => void;
  applyExternalConfig: (config: ExternalConfig) => void;
  resetVotes: () => void;
  getReactionById: (id: string) => Reaction | undefined;
  getTotalVotes: () => number;
  hasUserVoted: (reactionId: string) => boolean;
}

const createInitialVoteData = (): VoteData => ({
  reactions: DEFAULT_REACTIONS.map(config => ({
    id: config.emoji,
    emoji: config.emoji,
    label: config.label,
    count: 0,
  })),
  userVotes: {},
  totalVotes: 0,
});

export const useVoteStore = create<VoteStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_SETTINGS,
      voteData: createInitialVoteData(),
      contentId: 'default',

      // Actions
      toggleReaction: (reactionId: string) => {
        const { voteData, settings } = get();
        const currentVote = voteData.userVotes[reactionId] || false;
        
        let newUserVotes = { ...voteData.userVotes };
        let newReactions = [...voteData.reactions];

        if (!settings.allowMultipleReactions && !currentVote) {
          // If multiple reactions not allowed, remove all other votes
          Object.keys(newUserVotes).forEach(id => {
            if (id !== reactionId && newUserVotes[id]) {
              newUserVotes[id] = false;
              const reactionIndex = newReactions.findIndex(r => r.id === id);
              if (reactionIndex !== -1) {
                newReactions[reactionIndex] = {
                  ...newReactions[reactionIndex],
                  count: Math.max(0, newReactions[reactionIndex].count - 1)
                };
              }
            }
          });
        }

        // Toggle current reaction
        newUserVotes[reactionId] = !currentVote;
        
        // Update reaction count
        const reactionIndex = newReactions.findIndex(r => r.id === reactionId);
        if (reactionIndex !== -1) {
          const countChange = currentVote ? -1 : 1;
          newReactions[reactionIndex] = {
            ...newReactions[reactionIndex],
            count: Math.max(0, newReactions[reactionIndex].count + countChange)
          };
        }

        const totalVotes = newReactions.reduce((sum, reaction) => sum + reaction.count, 0);

        set({
          voteData: {
            reactions: newReactions,
            userVotes: newUserVotes,
            totalVotes,
          },
        });
      },

      setSettings: (newSettings: Partial<VoteSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      toggleDarkMode: () => {
        set(state => ({
          settings: { 
            ...state.settings, 
            darkMode: !state.settings.darkMode 
          }
        }));
      },

      applyExternalConfig: (config: ExternalConfig) => {
        const { settings, voteData } = get();
        
        let newSettings = { ...settings };
        let newVoteData = { ...voteData };

        // Apply theme settings
        if (config.theme) {
          if (config.theme.darkMode !== undefined) {
            newSettings.darkMode = config.theme.darkMode;
          }
          if (config.theme.primaryColor) {
            newSettings.primaryColor = config.theme.primaryColor;
          }
        }

        // Apply other settings
        if (config.settings) {
          newSettings = { ...newSettings, ...config.settings };
        }

        // Apply initial reactions if provided
        if (config.initialReactions) {
          newVoteData.reactions = config.initialReactions;
        }

        // Set content ID if provided
        const contentId = config.contentId || 'default';

        set({
          settings: newSettings,
          voteData: newVoteData,
          contentId,
        });
      },

      resetVotes: () => {
        set({
          voteData: createInitialVoteData(),
        });
      },

      getReactionById: (id: string) => {
        const { voteData } = get();
        return voteData.reactions.find(reaction => reaction.id === id);
      },

      getTotalVotes: () => {
        const { voteData } = get();
        return voteData.totalVotes;
      },

      hasUserVoted: (reactionId: string) => {
        const { voteData } = get();
        return !!voteData.userVotes[reactionId];
      },
    }),
    {
      name: 'react-vote-storage',
      partialize: (state) => ({
        settings: state.settings,
        voteData: state.voteData,
        contentId: state.contentId,
      }),
    }
  )
);