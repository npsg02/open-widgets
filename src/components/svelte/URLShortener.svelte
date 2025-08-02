<script lang="ts">
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';
  import { Copy, Download, Settings, Sun, Moon, Link, History, Trash2, ExternalLink } from 'lucide-svelte';

  // Types
  interface UrlHistory {
    id: string;
    originalUrl: string;
    shortUrl: string;
    createdAt: Date;
    qrCode: string;
  }

  // State
  let longUrl = '';
  let shortUrl = '';
  let qrCodeDataURL = '';
  let isLoading = false;
  let error = '';
  let copySuccess = false;
  let showSettings = false;
  let showHistory = false;
  let darkMode = false;
  let urlHistory: UrlHistory[] = [];

  // Settings
  let shortUrlBase = 'https://short.ly/';
  let customDomain = '';

  // Reactive statements
  $: isValidUrl = longUrl && isValidURL(longUrl);
  $: currentShortUrl = customDomain ? `${customDomain}/${shortUrl}` : `${shortUrlBase}${shortUrl}`;

  // URL validation
  function isValidURL(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Generate random short code
  function generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Generate QR Code
  async function generateQRCode(url: string): Promise<string> {
    try {
      return await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: darkMode ? '#ffffff' : '#000000',
          light: darkMode ? '#1f2937' : '#ffffff'
        }
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      return '';
    }
  }

  // Shorten URL
  async function shortenUrl() {
    if (!isValidUrl) {
      error = 'Please enter a valid URL';
      return;
    }

    isLoading = true;
    error = '';

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate short code
      const code = generateShortCode();
      shortUrl = code;
      
      // Generate QR code
      qrCodeDataURL = await generateQRCode(currentShortUrl);
      
      // Save to history
      const historyItem: UrlHistory = {
        id: Date.now().toString(),
        originalUrl: longUrl,
        shortUrl: currentShortUrl,
        createdAt: new Date(),
        qrCode: qrCodeDataURL
      };
      
      urlHistory = [historyItem, ...urlHistory];
      saveToLocalStorage();
      
    } catch (err) {
      error = 'Failed to shorten URL. Please try again.';
      console.error('Error shortening URL:', err);
    } finally {
      isLoading = false;
    }
  }

  // Copy to clipboard
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copySuccess = true;
      setTimeout(() => copySuccess = false, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  // Download QR Code
  function downloadQRCode() {
    if (!qrCodeDataURL) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${shortUrl}.png`;
    link.href = qrCodeDataURL;
    link.click();
  }

  // Delete history item
  function deleteHistoryItem(id: string) {
    urlHistory = urlHistory.filter(item => item.id !== id);
    saveToLocalStorage();
  }

  // Clear all history
  function clearHistory() {
    urlHistory = [];
    saveToLocalStorage();
  }

  // Local storage operations
  function saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('urlShortenerHistory', JSON.stringify(urlHistory));
      localStorage.setItem('urlShortenerSettings', JSON.stringify({
        darkMode,
        shortUrlBase,
        customDomain
      }));
    }
  }

  function loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('urlShortenerHistory');
      const savedSettings = localStorage.getItem('urlShortenerSettings');
      
      if (savedHistory) {
        try {
          urlHistory = JSON.parse(savedHistory);
        } catch (err) {
          console.error('Error loading history:', err);
        }
      }
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          darkMode = settings.darkMode || false;
          shortUrlBase = settings.shortUrlBase || 'https://short.ly/';
          customDomain = settings.customDomain || '';
        } catch (err) {
          console.error('Error loading settings:', err);
        }
      }
    }
  }

  // Theme management
  function toggleTheme() {
    darkMode = !darkMode;
    saveToLocalStorage();
  }

  // Apply settings
  function applySettings() {
    showSettings = false;
    saveToLocalStorage();
    
    // Regenerate QR code if we have a current short URL
    if (shortUrl) {
      generateQRCode(currentShortUrl).then(qr => {
        qrCodeDataURL = qr;
      });
    }
  }

  // Listen for iframe configuration messages
  onMount(() => {
    loadFromLocalStorage();
    
    // Listen for postMessage from parent window
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === 'URL_SHORTENER_CONFIG') {
        const config = event.data.config;
        if (config.darkMode !== undefined) darkMode = config.darkMode;
        if (config.shortUrlBase) shortUrlBase = config.shortUrlBase;
        if (config.customDomain) customDomain = config.customDomain;
        saveToLocalStorage();
      }
    }

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });

  // Handle Enter key in input
  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && isValidUrl && !isLoading) {
      shortenUrl();
    }
  }
</script>

<div class="min-h-screen transition-colors duration-300 {darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
        <Link class="text-blue-500" />
        URL Shortener
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Create short links and QR codes for easy sharing
      </p>
    </div>

    <!-- Main Widget -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <!-- URL Input -->
      <div class="space-y-4">
        <div>
          <label for="longUrl" class="block text-sm font-medium mb-2">
            Enter your long URL
          </label>
          <div class="relative">
            <input
              id="longUrl"
              type="url"
              bind:value={longUrl}
              on:keypress={handleKeyPress}
              placeholder="https://example.com/very/long/url"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     {!isValidUrl && longUrl ? 'border-red-500' : ''}"
              disabled={isLoading}
            />
            {#if longUrl && !isValidUrl}
              <p class="text-red-500 text-sm mt-1">Please enter a valid URL</p>
            {/if}
          </div>
        </div>

        <!-- Shorten Button -->
        <button
          on:click={shortenUrl}
          disabled={!isValidUrl || isLoading}
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 
                 text-white font-medium py-3 px-6 rounded-lg transition-colors
                 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {#if isLoading}
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Shortening...
          {:else}
            <Link size={18} />
            Shorten URL
          {/if}
        </button>

        <!-- Error Message -->
        {#if error}
          <div class="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        {/if}
      </div>

      <!-- Results Section -->
      {#if shortUrl}
        <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 class="font-semibold mb-3">Your shortened URL:</h3>
          
          <!-- Short URL Display -->
          <div class="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={currentShortUrl}
              readonly
              class="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-blue-600 dark:text-blue-400"
            />
            <button
              on:click={() => copyToClipboard(currentShortUrl)}
              class="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors"
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
            <a
              href={currentShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </a>
          </div>

          {#if copySuccess}
            <p class="text-green-600 dark:text-green-400 text-sm mb-3">✓ Copied to clipboard!</p>
          {/if}

          <!-- QR Code Section -->
          {#if qrCodeDataURL}
            <div class="text-center">
              <h4 class="font-medium mb-2">QR Code:</h4>
              <div class="inline-block p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <img src={qrCodeDataURL} alt="QR Code" class="mx-auto" />
              </div>
              <div class="mt-3 flex justify-center gap-2">
                <button
                  on:click={() => copyToClipboard(qrCodeDataURL)}
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-1"
                >
                  <Copy size={14} />
                  Copy QR Code
                </button>
                <button
                  on:click={downloadQRCode}
                  class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-1"
                >
                  <Download size={14} />
                  Download PNG
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- History Section -->
    {#if urlHistory.length > 0}
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold flex items-center gap-2">
            <History size={20} />
            Recent URLs ({urlHistory.length})
          </h2>
          <button
            on:click={clearHistory}
            class="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        </div>

        <div class="space-y-3 max-h-64 overflow-y-auto">
          {#each urlHistory as item (item.id)}
            <div class="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {item.originalUrl}
                  </p>
                  <p class="text-blue-600 dark:text-blue-400 font-medium truncate">
                    {item.shortUrl}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    on:click={() => copyToClipboard(item.shortUrl)}
                    class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Open"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    on:click={() => deleteHistoryItem(item.id)}
                    class="p-1 text-red-500 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Floating Settings Button -->
    <button
      on:click={() => showSettings = true}
      class="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors z-10"
      title="Settings"
    >
      <Settings size={20} />
    </button>

    <!-- Theme Toggle Button -->
    <button
      on:click={toggleTheme}
      class="fixed bottom-6 right-20 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-full shadow-lg transition-colors z-10"
      title="Toggle theme"
    >
      {#if darkMode}
        <Sun size={20} />
      {:else}
        <Moon size={20} />
      {/if}
    </button>
  </div>

  <!-- Settings Modal -->
  {#if showSettings}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings size={20} />
          Settings
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Short URL Base</label>
            <input
              type="text"
              bind:value={shortUrlBase}
              placeholder="https://short.ly/"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Custom Domain (optional)</label>
            <input
              type="text"
              bind:value={customDomain}
              placeholder="https://yourdomain.com"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              If provided, this will override the short URL base
            </p>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="darkModeToggle"
              bind:checked={darkMode}
              class="rounded"
            />
            <label for="darkModeToggle" class="text-sm">Enable dark mode</label>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            on:click={() => showSettings = false}
            class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            on:click={applySettings}
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure proper styling */
</style>