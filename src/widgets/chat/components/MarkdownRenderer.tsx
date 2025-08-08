import React, { useEffect, useRef } from 'react';
import { renderMarkdown, sanitizeHtml, copyToClipboard, executeJavaScript } from '../utils/markdown';
import type { Message } from '../types';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Add click handlers for copy buttons
    const copyButtons = container.querySelectorAll('.copy-button');
    copyButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const code = decodeURIComponent(button.getAttribute('data-code') || '');
        const success = await copyToClipboard(code);
        
        if (success) {
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        }
      });
    });

    // Add click handlers for run buttons
    const runButtons = container.querySelectorAll('.run-button');
    runButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const code = decodeURIComponent(button.getAttribute('data-code') || '');
        const language = button.getAttribute('data-lang') || '';
        
        if (language === 'javascript' || language === 'js') {
          button.textContent = 'Running...';
          button.setAttribute('disabled', 'true');
          
          try {
            const result = await executeJavaScript(code);
            
            // Create result container
            const resultContainer = document.createElement('div');
            resultContainer.className = 'code-execution-result';
            
            if (result.error) {
              resultContainer.innerHTML = `
                <div class="execution-error">
                  <strong>Error:</strong> ${result.error}
                </div>
              `;
            } else {
              resultContainer.innerHTML = `
                <div class="execution-output">
                  <strong>Output:</strong> 
                  <pre>${JSON.stringify(result.result, null, 2)}</pre>
                </div>
              `;
            }
            
            // Insert result after the code block
            const codeBlockContainer = button.closest('.code-block-container');
            if (codeBlockContainer) {
              const existingResult = codeBlockContainer.nextElementSibling;
              if (existingResult && existingResult.classList.contains('code-execution-result')) {
                existingResult.remove();
              }
              codeBlockContainer.insertAdjacentElement('afterend', resultContainer);
            }
          } catch (error) {
            console.error('Execution error:', error);
          } finally {
            button.textContent = 'Run';
            button.removeAttribute('disabled');
          }
        }
      });
    });

    // Cleanup function
    return () => {
      copyButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
      runButtons.forEach(button => {
        button.removeEventListener('click', () => {});
      });
    };
  }, [content]);

  const htmlContent = sanitizeHtml(renderMarkdown(content));

  return (
    <div 
      ref={containerRef}
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}