import React from 'react';
import { ChevronDown, Bot, Zap } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  availableModels: string[];
  onModelChange: (model: string) => void;
  className?: string;
  disabled?: boolean;
}

const modelDisplayNames: Record<string, string> = {
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
};

const modelDescriptions: Record<string, string> = {
  'gpt-4o': 'Most capable model, multimodal',
  'gpt-4o-mini': 'Fast and efficient, good balance',
  'gpt-4-turbo': 'Advanced reasoning, large context',
  'gpt-4': 'High quality responses, creative tasks',
  'gpt-3.5-turbo': 'Fast and cost-effective',
};

const modelIcons: Record<string, React.ReactNode> = {
  'gpt-4o': <Zap className="w-4 h-4" />,
  'gpt-4o-mini': <Zap className="w-4 h-4" />,
  'gpt-4-turbo': <Bot className="w-4 h-4" />,
  'gpt-4': <Bot className="w-4 h-4" />,
  'gpt-3.5-turbo': <Bot className="w-4 h-4" />,
};

export default function ModelSelector({ 
  selectedModel, 
  availableModels, 
  onModelChange, 
  className = '',
  disabled = false 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleModelSelect = (model: string) => {
    onModelChange(model);
    setIsOpen(false);
  };

  const getDisplayName = (model: string) => {
    return modelDisplayNames[model] || model;
  };

  const getDescription = (model: string) => {
    return modelDescriptions[model] || '';
  };

  const getIcon = (model: string) => {
    return modelIcons[model] || <Bot className="w-4 h-4" />;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className={`
          w-full flex items-center justify-between px-3 py-2 text-left
          bg-white border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          {getIcon(selectedModel)}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {getDisplayName(selectedModel)}
            </div>
            <div className="text-xs text-gray-500">
              {getDescription(selectedModel)}
            </div>
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {availableModels.map((model) => (
              <button
                key={model}
                type="button"
                className={`
                  w-full text-left px-3 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50
                  ${selectedModel === model ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                `}
                onClick={() => handleModelSelect(model)}
              >
                <div className="flex items-center space-x-2">
                  {getIcon(model)}
                  <div>
                    <div className="text-sm font-medium">
                      {getDisplayName(model)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getDescription(model)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}