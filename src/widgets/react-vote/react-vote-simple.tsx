import React, { useState } from 'react';
import { Settings, BarChart3, Users, TrendingUp } from 'lucide-react';

// Define types inline for now to avoid import issues
interface Reaction {
  id: string;
  emoji: string;
  label: string;
  count: number;
}

const ReactVoteWidget: React.FC = () => {
  const [reactions, setReactions] = useState<Reaction[]>([
    { id: 'like', emoji: '👍', label: 'Like', count: 0 },
    { id: 'love', emoji: '❤️', label: 'Love', count: 0 },
    { id: 'funny', emoji: '😂', label: 'Funny', count: 0 },
    { id: 'wow', emoji: '😮', label: 'Wow', count: 0 },
    { id: 'sad', emoji: '😢', label: 'Sad', count: 0 },
    { id: 'angry', emoji: '😡', label: 'Angry', count: 0 },
  ]);

  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({});
  const [showCounts, setShowCounts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleReactionClick = (reactionId: string) => {
    const isCurrentlyVoted = userVotes[reactionId] || false;
    
    // Update user votes
    setUserVotes(prev => ({
      ...prev,
      [reactionId]: !isCurrentlyVoted
    }));

    // Update reaction counts
    setReactions(prev => prev.map(reaction => 
      reaction.id === reactionId 
        ? { ...reaction, count: reaction.count + (isCurrentlyVoted ? -1 : 1) }
        : reaction
    ));
  };

  const totalVotes = reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  const userHasVoted = Object.values(userVotes).some(voted => voted);

  const themeClasses = darkMode
    ? 'dark bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';

  const cardClasses = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const statClasses = darkMode
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
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                <p className="text-2xl font-bold">{reactions.length}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              You can select multiple reactions to express how you feel
            </p>
          </div>

          {/* Reaction Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            {reactions.map(reaction => {
              const isActive = userVotes[reaction.id] || false;
              return (
                <button
                  key={reaction.id}
                  onClick={() => handleReactionClick(reaction.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    isActive
                      ? `border-blue-500 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`
                      : `${darkMode 
                          ? 'border-gray-600 bg-gray-800 hover:border-gray-500' 
                          : 'border-gray-300 bg-white hover:border-gray-400'
                        }`
                  }`}
                  title={`${reaction.label} (${reaction.count})`}
                >
                  <span className="text-xl">{reaction.emoji}</span>
                  {showCounts && (
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-700'} ${isActive ? 'text-blue-600' : ''}`}>
                      {reaction.count > 0 ? reaction.count : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Vote Summary */}
          {totalVotes > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Vote Distribution</h3>
              <div className="space-y-2">
                {reactions
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
                        <span className={`text-xs min-w-[35px] text-right ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Be the first to react! 🎉
              </p>
            </div>
          )}
        </div>

        {/* Toggle Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowCounts(!showCounts)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showCounts ? 'Hide' : 'Show'} Counts
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {darkMode ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            This is a demo widget - votes reset on page reload
          </p>
        </div>

        {/* Floating Settings Button */}
        <button
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 z-40"
          title="Widget Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default ReactVoteWidget;