import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, ExternalLink, AlertCircle, Rss } from 'lucide-react';
import FeedSettingsModal from './FeedSettingsModal';

interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

interface FeedConfig {
  feedUrls: string[];
  maxItems: number;
  showDescription: boolean;
  showDate: boolean;
  updateInterval: number;
}

const DEFAULT_CONFIG: FeedConfig = {
  feedUrls: [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.cnn.com/rss/edition.rss'
  ],
  maxItems: 10,
  showDescription: true,
  showDate: true,
  updateInterval: 5
};

const FeedWidget: React.FC = () => {
  const [config, setConfig] = useState<FeedConfig>(DEFAULT_CONFIG);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('feed-widget-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse saved config:', error);
      }
    }
  }, []);

  // Save configuration to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('feed-widget-config', JSON.stringify(config));
  }, [config]);

  // Listen for postMessage API for iframe embedding
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'FEED_CONFIG_UPDATE') {
        setConfig(prevConfig => ({
          ...prevConfig,
          ...event.data.config
        }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Fetch RSS feeds
  const fetchFeeds = async () => {
    if (config.feedUrls.length === 0) {
      setError('No RSS feed URLs configured');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allItems: FeedItem[] = [];

      // Fetch each RSS feed
      for (const feedUrl of config.feedUrls) {
        try {
          // Use rss2json API to convert RSS to JSON and avoid CORS issues
          const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
          const response = await fetch(proxyUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch feed: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.status !== 'ok') {
            throw new Error(`RSS feed error: ${data.message || 'Unknown error'}`);
          }

          // Extract feed title for source identification
          const sourceTitle = data.feed?.title || new URL(feedUrl).hostname;

          // Convert RSS items to our format
          const items: FeedItem[] = data.items.map((item: any) => ({
            title: item.title || 'Untitled',
            description: item.description || item.content || '',
            link: item.link || '#',
            pubDate: item.pubDate || new Date().toISOString(),
            source: sourceTitle
          }));

          allItems.push(...items);
        } catch (feedError) {
          console.error(`Error fetching feed ${feedUrl}:`, feedError);
          // Continue with other feeds even if one fails
        }
      }

      // Sort by publication date (newest first) and limit items
      const sortedItems = allItems
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, config.maxItems);

      setFeedItems(sortedItems);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching feeds:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch RSS feeds');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchFeeds();

    const interval = setInterval(fetchFeeds, config.updateInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [config.feedUrls, config.maxItems, config.updateInterval]);

  // Format publication date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Unknown date';
    }
  };

  // Strip HTML tags from description
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Truncate text to specified length
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Settings Modal */}
      {showSettings && (
        <FeedSettingsModal
          config={config}
          onSave={(newConfig) => {
            setConfig(newConfig);
            setShowSettings(false);
          }}
          onCancel={() => setShowSettings(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Rss className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">RSS Feed Reader</h1>
                <p className="text-gray-600">
                  {lastUpdated ? `Last updated: ${formatDate(lastUpdated.toISOString())}` : 'Loading...'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchFeeds}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && feedItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading RSS feeds...</p>
          </div>
        )}

        {/* Feed Items */}
        {feedItems.length > 0 && (
          <div className="space-y-4">
            {feedItems.map((item, index) => (
              <article key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 leading-tight">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {item.title}
                      </a>
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{item.source}</span>
                      {config.showDate && (
                        <span>{formatDate(item.pubDate)}</span>
                      )}
                    </div>
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors ml-4"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                
                {config.showDescription && item.description && (
                  <p className="text-gray-600 leading-relaxed">
                    {truncateText(stripHtml(item.description), 300)}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        {/* No Items State */}
        {!loading && feedItems.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Rss className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No feed items found</p>
            <button
              onClick={() => setShowSettings(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Configure RSS Feeds
            </button>
          </div>
        )}
      </div>

      {/* Floating Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-6 right-6 bg-white bg-opacity-90 backdrop-blur-sm hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        aria-label="Open settings"
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
};

export default FeedWidget;