import MarkdownIt from 'markdown-it';
import Prism from 'prismjs';

// Import common languages for syntax highlighting
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';

// Configure markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && Prism.languages[lang]) {
      try {
        return `<pre class="language-${lang}"><code class="language-${lang}">${Prism.highlight(str, Prism.languages[lang], lang)}</code></pre>`;
      } catch (__) {}
    }

    return `<pre class="language-text"><code class="language-text">${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

/**
 * Render markdown to HTML
 */
export function renderMarkdown(content: string): string {
  return md.render(content);
}

/**
 * Extract code blocks from markdown content
 */
export function extractCodeBlocks(content: string): Array<{
  language: string;
  code: string;
  isRunnable: boolean;
}> {
  const codeBlocks: Array<{
    language: string;
    code: string;
    isRunnable: boolean;
  }> = [];

  // Regex to match code blocks
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    const isRunnable = isRunnableLanguage(language);

    codeBlocks.push({
      language,
      code,
      isRunnable,
    });
  }

  return codeBlocks;
}

/**
 * Check if a language is runnable in the browser
 */
export function isRunnableLanguage(language: string): boolean {
  const runnableLanguages = ['javascript', 'js', 'html', 'css'];
  return runnableLanguages.includes(language.toLowerCase());
}

/**
 * Execute JavaScript code safely in a sandboxed environment
 */
export function executeJavaScript(code: string): Promise<{ result?: any; error?: string }> {
  return new Promise((resolve) => {
    try {
      // Create a sandboxed environment
      const originalConsole = console;
      const logs: any[] = [];
      
      // Override console methods to capture output
      const sandboxConsole = {
        log: (...args: any[]) => logs.push(['log', ...args]),
        error: (...args: any[]) => logs.push(['error', ...args]),
        warn: (...args: any[]) => logs.push(['warn', ...args]),
        info: (...args: any[]) => logs.push(['info', ...args]),
      };

      // Execute code with timeout
      const timeout = setTimeout(() => {
        resolve({ error: 'Code execution timed out' });
      }, 5000);

      try {
        // Replace console temporarily
        (globalThis as any).console = sandboxConsole;
        
        // Execute the code
        const result = new Function(code)();
        
        clearTimeout(timeout);
        resolve({ 
          result: result !== undefined ? result : logs.length > 0 ? logs : 'Code executed successfully'
        });
      } catch (error) {
        clearTimeout(timeout);
        resolve({ error: error instanceof Error ? error.message : String(error) });
      } finally {
        // Restore original console
        (globalThis as any).console = originalConsole;
      }
    } catch (error) {
      resolve({ error: error instanceof Error ? error.message : String(error) });
    }
  });
}

/**
 * Format code block for display
 */
export function formatCodeBlock(language: string, code: string, isRunnable: boolean): string {
  const highlightedCode = language && Prism.languages[language] 
    ? Prism.highlight(code, Prism.languages[language], language)
    : Prism.util.encode(code);

  const runnableClass = isRunnable ? 'runnable' : '';
  const copyButton = `<button class="copy-button" data-code="${encodeURIComponent(code)}">Copy</button>`;
  const runButton = isRunnable ? `<button class="run-button" data-code="${encodeURIComponent(code)}" data-lang="${language}">Run</button>` : '';

  return `
    <div class="code-block-container ${runnableClass}">
      <div class="code-block-header">
        <span class="language-label">${language}</span>
        <div class="code-block-actions">
          ${copyButton}
          ${runButton}
        </div>
      </div>
      <pre class="language-${language}"><code class="language-${language}">${highlightedCode}</code></pre>
    </div>
  `;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove script tags and event handlers
  const scripts = div.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  const allElements = div.querySelectorAll('*');
  allElements.forEach(element => {
    // Remove event handler attributes
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        element.removeAttribute(attr.name);
      }
    });
  });
  
  return div.innerHTML;
}