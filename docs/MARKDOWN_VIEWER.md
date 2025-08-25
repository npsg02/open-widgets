# MarkdownViewer Component

## Overview

The MarkdownViewer is a reusable React functional component that renders Markdown content with advanced features including code highlighting, mathematical formulas, Mermaid diagrams, and Chart.js integration.

## Features

✅ **GitHub Flavored Markdown (GFM)** - Full support via react-markdown + remark-gfm
✅ **Tailwind Typography** - Beautiful prose styling with dark mode support (dark:prose-invert)
✅ **Code Highlighting** - Auto-detect languages using rehype-highlight
✅ **Math Formulas** - Inline and block math rendering with remark-math + rehype-katex
✅ **Mermaid Diagrams** - SVG rendering with fallback to raw text on errors
✅ **Chart.js Integration** - JSON-based charts (line, bar, pie, doughnut)
✅ **Responsive Design** - Mobile-friendly and adapts to container size
✅ **Customizable Typography** - Props for fontFamily and fontSize
✅ **Accessibility** - Links open in new tabs, images are lazy-loaded
✅ **Table Scrolling** - Horizontal scroll for wide tables
✅ **Styled Components** - Code blocks, diagrams, and charts wrapped in styled containers

## Props Interface

```typescript
interface MarkdownViewerProps {
  source: string;           // Markdown content to render
  className?: string;       // Additional CSS classes
  fontFamily?: string;      // Custom font family
  fontSize?: string | number; // Custom font size
}
```

## Usage Examples

### Basic Usage
```tsx
import MarkdownViewer from './components/react/MarkdownViewer';

<MarkdownViewer source="# Hello World\nThis is **bold** text." />
```

### With Custom Styling
```tsx
<MarkdownViewer
  source={markdownContent}
  className="my-custom-class"
  fontFamily="Georgia, serif"
  fontSize={18}
/>
```

### Mermaid Diagrams
```markdown
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
\`\`\`
```

### Chart.js Integration
```markdown
\`\`\`chart
{
  "type": "line",
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [{
      "label": "Sales",
      "data": [10, 20, 30]
    }]
  }
}
\`\`\`
```

### Math Formulas
```markdown
Inline math: $E = mc^2$

Block math:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

## File Structure

- `src/components/react/MarkdownViewer.tsx` - Main component
- `src/components/react/MarkdownViewerDemo.tsx` - Demo application
- `src/pages/markdown-viewer.astro` - Demo page
- `tailwind.config.js` - Tailwind configuration with typography plugin

## Dependencies

- react-markdown - Core markdown rendering
- remark-gfm - GitHub Flavored Markdown support
- remark-math - Math notation support
- rehype-highlight - Code syntax highlighting
- rehype-katex - Math formula rendering
- mermaid - Diagram rendering
- react-chartjs-2 + chart.js - Chart rendering
- @tailwindcss/typography - Beautiful typography
- highlight.js - Syntax highlighting styles
- katex - Math rendering styles

## Widget Integration

The component supports iframe embedding and postMessage API for external configuration:

```javascript
// Send configuration to embedded widget
iframe.contentWindow.postMessage({
  type: 'MARKDOWN_VIEWER_CONFIG',
  config: {
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    darkMode: true,
    source: 'Your markdown content here...'
  }
}, '*');
```

## State Persistence

The demo component uses localStorage to persist:
- Font family settings
- Font size settings
- Dark mode preference
- Markdown content

## Dark Mode Support

The component automatically adapts to dark mode using Tailwind's `dark:prose-invert` class, ensuring optimal readability in both light and dark themes.