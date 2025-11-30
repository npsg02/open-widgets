import React, { useState, useEffect } from 'react';
import MarkdownViewer from './MarkdownViewer';
import { Settings, Sun, Moon } from 'lucide-react';

const MarkdownViewerDemo = () => {
  const [markdownSource, setMarkdownSource] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [config, setConfig] = useState({
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 16,
  });

  // Sample markdown content
  const sampleMarkdown = `# MarkdownViewer Component Demo

This is a comprehensive demo of the **MarkdownViewer** component with support for various features.

## Text Formatting

- **Bold text**
- *Italic text*
- \`Inline code\`
- ~~Strikethrough~~

## Links and Images

Visit [GitHub](https://github.com) - this opens in a new tab!

![Sample Image](https://via.placeholder.com/400x200?text=Lazy+Loaded+Image)

## Tables (with horizontal scroll)

| Feature | Status | Description |
|---------|--------|-------------|
| GitHub Flavored Markdown | ✅ | Full GFM support |
| Code Highlighting | ✅ | Auto-detect languages |
| Mermaid Diagrams | ✅ | SVG rendering |
| Chart.js Integration | ✅ | JSON-based charts |
| Math Formulas | ✅ | KaTeX rendering |
| Responsive Design | ✅ | Mobile-friendly |
| Dark Mode | ✅ | Auto prose-invert |

## Code Highlighting

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55
\`\`\`

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\`

## Math Formulas

Inline math: $E = mc^2$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Quadratic formula:
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## Mermaid Diagrams

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!
\`\`\`

## Chart.js Integration

\`\`\`chart
{
  "type": "line",
  "data": {
    "labels": ["January", "February", "March", "April", "May", "June"],
    "datasets": [{
      "label": "Sales",
      "data": [12, 19, 3, 5, 2, 3],
      "borderColor": "rgb(75, 192, 192)",
      "backgroundColor": "rgba(75, 192, 192, 0.2)",
      "tension": 0.1
    }]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "title": {
        "display": true,
        "text": "Monthly Sales Chart"
      }
    }
  }
}
\`\`\`

\`\`\`chartjs
{
  "type": "bar",
  "data": {
    "labels": ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    "datasets": [{
      "label": "# of Votes",
      "data": [12, 19, 3, 5, 2, 3],
      "backgroundColor": [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 205, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(255, 159, 64, 0.2)"
      ],
      "borderColor": [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 205, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)"
      ],
      "borderWidth": 1
    }]
  },
  "options": {
    "responsive": true,
    "plugins": {
      "title": {
        "display": true,
        "text": "Color Preference Survey"
      }
    }
  }
}
\`\`\`

## Task Lists

- [x] Implement basic markdown rendering
- [x] Add code highlighting
- [x] Support Mermaid diagrams
- [x] Integrate Chart.js
- [x] Add math formula support
- [ ] Add more chart types
- [ ] Custom themes

## Blockquotes

> This is a blockquote with **bold** text and a [link](https://example.com).
> 
> It can span multiple lines and contain various formatting.

## Responsive Design

This component is fully responsive and adapts to different screen sizes. Try resizing your browser window!
`;

  useEffect(() => {
    setMarkdownSource(sampleMarkdown);

    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for postMessage configuration
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'MARKDOWN_VIEWER_CONFIG') {
        const { fontFamily, fontSize, darkMode, source } = event.data.config;
        if (fontFamily) setConfig(prev => ({ ...prev, fontFamily }));
        if (fontSize) setConfig(prev => ({ ...prev, fontSize }));
        if (typeof darkMode === 'boolean') setIsDarkMode(darkMode);
        if (source) setMarkdownSource(source);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isDarkMode]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('markdown-viewer-config', JSON.stringify({
      ...config,
      isDarkMode,
    }));
  }, [config, isDarkMode]);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('markdown-viewer-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ fontFamily: parsed.fontFamily, fontSize: parsed.fontSize });
        setIsDarkMode(parsed.isDarkMode || false);
      } catch (error) {
        console.warn('Failed to load saved config:', error);
      }
    }
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b p-4 backdrop-blur-sm ${
        isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">📝 MarkdownViewer Component</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Markdown Source</h2>
            <textarea
              value={markdownSource}
              onChange={(e) => setMarkdownSource(e.target.value)}
              placeholder="Enter your markdown here..."
              className={`w-full h-96 p-4 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-600 text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Live Preview</h2>
            <div className={`border rounded-lg p-4 h-96 overflow-y-auto ${
              isDarkMode ? 'border-gray-600' : 'border-gray-300'
            }`}>
              <MarkdownViewer
                source={markdownSource}
                fontFamily={config.fontFamily}
                fontSize={config.fontSize}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
          isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        <Settings size={24} />
      </button>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Settings</h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={`px-3 py-1 rounded transition-colors ${
                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                    className={`w-full p-2 border rounded transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="Inter, system-ui, sans-serif">Inter</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Font Size: {config.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={config.fontSize}
                    onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownViewerDemo;