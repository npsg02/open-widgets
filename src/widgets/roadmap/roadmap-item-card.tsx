import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Flag, 
  Tag, 
  GripVertical,
  MoreHorizontal 
} from 'lucide-react';
import type { RoadmapItem } from './roadmap-types';
import { useRoadmapStore } from './roadmap-store';

interface RoadmapItemCardProps {
  item: RoadmapItem;
  onEdit: (itemId: string) => void;
  isDragging?: boolean;
  showDates?: boolean;
  showProgress?: boolean;
  showLabels?: boolean;
}

const RoadmapItemCard: React.FC<RoadmapItemCardProps> = ({
  item,
  onEdit,
  isDragging,
  showDates = true,
  showProgress = true,
  showLabels = true,
}) => {
  const { settings, deleteItem } = useRoadmapStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    return settings.statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const themeClasses = settings.darkMode
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${themeClasses} border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${item.color ? `border-l-4 ${item.color}` : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-2">
            <button
              {...attributes}
              {...listeners}
              className={`p-1 rounded hover:bg-gray-100 ${
                settings.darkMode ? 'hover:bg-gray-700' : ''
              }`}
            >
              <GripVertical size={16} className="text-gray-400" />
            </button>
            
            <h3 className="font-medium text-sm flex-1 truncate">{item.title}</h3>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEdit(item.id)}
                className={`p-1 rounded hover:bg-gray-100 ${
                  settings.darkMode ? 'hover:bg-gray-700' : ''
                }`}
              >
                <Edit size={14} className="text-gray-400 hover:text-blue-500" />
              </button>
              <button
                onClick={() => deleteItem(item.id)}
                className={`p-1 rounded hover:bg-gray-100 ${
                  settings.darkMode ? 'hover:bg-gray-700' : ''
                }`}
              >
                <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className={`text-sm mb-3 ${
              settings.darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {item.description}
            </p>
          )}

          {/* Dates */}
          {showDates && (
            <div className={`flex items-center space-x-4 text-xs mb-3 ${
              settings.darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{formatDate(item.startDate)}</span>
              </div>
              <span>→</span>
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{formatDate(item.endDate)}</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={settings.darkMode ? 'text-gray-400' : 'text-gray-500'}>
                  Progress
                </span>
                <span className={settings.darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {item.progress}%
                </span>
              </div>
              <div className={`w-full h-2 rounded-full ${
                settings.darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status and Priority */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Status */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status.replace('-', ' ')}
              </span>
              
              {/* Priority */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getPriorityColor(item.priority)}`}>
                <Flag size={12} />
                <span className="capitalize">{item.priority}</span>
              </div>
            </div>

            {/* Labels */}
            {showLabels && item.labels.length > 0 && (
              <div className="flex items-center space-x-1">
                {item.labels.slice(0, 2).map((label) => (
                  <span
                    key={label}
                    className={`px-2 py-1 rounded-full text-xs ${
                      settings.labelColors[label] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <Tag size={10} className="inline mr-1" />
                    {label}
                  </span>
                ))}
                {item.labels.length > 2 && (
                  <span className={`text-xs ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    +{item.labels.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapItemCard;