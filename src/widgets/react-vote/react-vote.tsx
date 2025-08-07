import React, { useEffect, useState } from 'react';
import { Settings, BarChart3, Users, TrendingUp } from 'lucide-react';
import { useVoteStore } from './react-vote-store';
import ReactionButton from './reaction-button';
import SettingsModal from './settings-modal';
import { ExternalConfig } from './react-vote-types';

const ReactVoteWidget: React.FC = () => {
  const {
    settings,
    voteData,
    toggleReaction,
    hasUserVoted,
    getTotalVotes,
    applyExternalConfig,
  } = useVoteStore();

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Listen for external configuration via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'REACT_VOTE_CONFIG') {
        const config: ExternalConfig = event.data.config;
        applyExternalConfig(config);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [applyExternalConfig]);

  const enabledReactions = voteData.reactions.filter(reaction =>
    settings.availableReactions.find(ar => ar.emoji === reaction.emoji)?.enabled
  );

  const totalVotes = getTotalVotes();
  const userHasVoted = Object.values(voteData.userVotes).some(voted => voted);

  const themeClasses = settings.darkMode
    ? 'dark bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';

  const cardClasses = settings.darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const statClasses = settings.darkMode
    ? 'bg-gray-700 text-gray-300'
    : 'bg-gray-100 text-gray-600';

  return (
    <div className={`min-h-screen w-full ${themeClasses} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center space-x-3">
            <span className="text-4xl">👍</span>
            <span>React & Vote</span>
          </h1>
          <p className={`text-lg ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Share your reaction and see what others think
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`${cardClasses} border rounded-xl p-4`}>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${statClasses}`}>
                <Users size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalVotes}</p>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Votes
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardClasses} border rounded-xl p-4`}>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${statClasses}`}>
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">{enabledReactions.length}</p>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Reactions
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardClasses} border rounded-xl p-4`}>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${statClasses}`}>
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userHasVoted ? '✓' : '—'}
                </p>
                <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your Vote
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Voting Section */}
        <div className={`${cardClasses} border rounded-2xl p-8 mb-8`}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">How do you feel about this?</h2>
            <p className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {settings.allowMultipleReactions 
                ? 'You can select multiple reactions'
                : 'Choose one reaction that best represents your feeling'
              }
            </p>
          </div>

          {/* Reaction Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {enabledReactions.map(reaction => (
              <ReactionButton
                key={reaction.id}
                reaction={reaction}
                isActive={hasUserVoted(reaction.id)}
                showCount={settings.showCounts}
                darkMode={settings.darkMode}
                buttonSize={settings.buttonSize}
                animationsEnabled={settings.animationsEnabled}
                primaryColor={settings.primaryColor}
                onClick={() => toggleReaction(reaction.id)}
              />
            ))}
          </div>

          {/* Vote Summary */}
          {totalVotes > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Vote Distribution</h3>
              <div className="space-y-2">
                {enabledReactions
                  .filter(reaction => reaction.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map(reaction => {
                    const percentage = totalVotes > 0 ? (reaction.count / totalVotes) * 100 : 0;
                    return (
                      <div key={reaction.id} className="flex items-center space-x-3">
                        <span className="text-xl w-8">{reaction.emoji}</span>
                        <span className="font-medium min-w-[60px]">{reaction.label}</span>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[40px] text-right">
                          {reaction.count}
                        </span>
                        <span className={`text-xs min-w-[35px] text-right ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalVotes === 0 && (
            <div className="text-center py-8">
              <p className={`text-lg ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Be the first to react! 🎉
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className={`text-sm ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Your votes are stored locally and persist across sessions
          </p>
        </div>

        {/* Floating Settings Button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-40"
          title="Widget Settings"
        >
          <Settings size={20} />
        </button>

        {/* Settings Modal */}
        {showSettingsModal && (
          <SettingsModal onClose={() => setShowSettingsModal(false)} />
        )}
      </div>
    </div>
  );
};

export default ReactVoteWidget;