import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Import highlight.js CSS
import 'highlight.js/styles/github.css';
// Import KaTeX CSS
import 'katex/dist/katex.min.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface MarkdownViewerProps {
  source: string;
  className?: string;
  fontFamily?: string;
  fontSize?: string | number;
}

interface MermaidDiagramProps {
  code: string;
}

interface ChartComponentProps {
  code: string;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

// Mermaid Diagram Component
const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setError('');
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, code);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(code); // Fallback to raw code
      }
    };

    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="border rounded-lg p-3 overflow-auto bg-gray-50 dark:bg-gray-800">
        <pre className="text-sm text-gray-600 dark:text-gray-400">{error}</pre>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3 overflow-auto bg-white dark:bg-gray-800 flex justify-center">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
};

// Chart Component
const ChartComponent: React.FC<ChartComponentProps> = ({ code }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [chartType, setChartType] = useState<string>('line');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      setError('');
      const parsed = JSON.parse(code);
      
      // Determine chart type from parsed data or default to line
      const type = parsed.type || 'line';
      setChartType(type);
      setChartData(parsed);
    } catch (err) {
      console.error('Chart parsing error:', err);
      setError(code); // Fallback to raw code
    }
  }, [code]);

  if (error) {
    return (
      <div className="border rounded-lg p-3 overflow-auto bg-gray-50 dark:bg-gray-800">
        <pre className="text-sm text-gray-600 dark:text-gray-400">{error}</pre>
      </div>
    );
  }

  if (!chartData) {
    return null;
  }

  const ChartComponentMap: { [key: string]: React.ComponentType<any> } = {
    line: Line,
    bar: Bar,
    pie: Pie,
    doughnut: Doughnut,
  };

  const SelectedChart = ChartComponentMap[chartType] || Line;

  return (
    <div className="border rounded-lg p-3 overflow-auto bg-white dark:bg-gray-800">
      <div style={{ maxHeight: '400px' }}>
        <SelectedChart 
          data={chartData.data || chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            ...chartData.options
          }} 
        />
      </div>
    </div>
  );
};

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  source,
  className = '',
  fontFamily = 'inherit',
  fontSize = 'inherit'
}) => {
  const containerStyle = useMemo(() => ({
    fontFamily,
    fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
  }), [fontFamily, fontSize]);

  const components = useMemo(() => ({
    // Make links open in new tab
    a: ({ href, children, ...props }: any) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props}
      >
        {children}
      </a>
    ),
    
    // Lazy load images
    img: ({ src, alt, ...props }: any) => (
      <img 
        src={src} 
        alt={alt} 
        loading="lazy" 
        className="max-w-full h-auto"
        {...props} 
      />
    ),
    
    // Horizontal scroll for tables
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto">
        <table {...props} className="min-w-full">
          {children}
        </table>
      </div>
    ),
    
    // Code blocks with special handling
    code: ({ node, inline, className: codeClassName, children, ...props }: any) => {
      const code = String(children).replace(/\n$/, '');
      const match = /language-(\w+)/.exec(codeClassName || '');
      const language = match ? match[1] : null;

      // Handle inline code
      if (inline) {
        return (
          <code 
            className={`${codeClassName} px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm`}
            {...props}
          >
            {children}
          </code>
        );
      }

      // Handle mermaid diagrams
      if (language === 'mermaid') {
        return <MermaidDiagram code={code} />;
      }

      // Handle chart/chartjs
      if (language === 'chart' || language === 'chartjs') {
        return <ChartComponent code={code} />;
      }

      // Regular code blocks with highlighting
      return (
        <div className="border rounded-lg p-3 overflow-auto bg-gray-50 dark:bg-gray-800">
          <code className={codeClassName} {...props}>
            {children}
          </code>
        </div>
      );
    },
    
    // Wrap pre elements to maintain styling
    pre: ({ children, ...props }: any) => (
      <div className="not-prose">
        <pre {...props}>
          {children}
        </pre>
      </div>
    ),
  }), []);

  return (
    <div 
      className={`markdown-viewer w-full ${className}`}
      style={containerStyle}
    >
      <div className="prose prose-gray dark:prose-invert max-w-none prose-img:rounded-lg prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={components}
        >
          {source}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownViewer;