import React, { useMemo, useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { RoadmapItem, TimelineColumn } from './roadmap-types';
import { useRoadmapStore } from './roadmap-store';
import RoadmapItemCard from './roadmap-item-card';

interface TimelineViewProps {
  items: RoadmapItem[];
  onEditItem: (itemId: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ items, onEditItem }) => {
  const { 
    settings, 
    startDate, 
    endDate, 
    reorderItems, 
    moveItem,
    getItemsByDateRange 
  } = useRoadmapStore();
  
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Generate timeline columns based on settings
  const timelineColumns = useMemo(() => {
    const columns: TimelineColumn[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (settings.timelineView === 'quarters') {
      const current = new Date(start.getFullYear(), 0, 1); // Start of year
      while (current <= end) {
        const quarter = Math.floor(current.getMonth() / 3) + 1;
        const quarterStart = new Date(current.getFullYear(), (quarter - 1) * 3, 1);
        const quarterEnd = new Date(current.getFullYear(), quarter * 3, 0);
        
        columns.push({
          id: `q${quarter}-${current.getFullYear()}`,
          label: `Q${quarter} ${current.getFullYear()}`,
          startDate: quarterStart.toISOString().split('T')[0],
          endDate: quarterEnd.toISOString().split('T')[0],
          type: 'quarter',
        });
        
        current.setMonth(current.getMonth() + 3);
      }
    } else if (settings.timelineView === 'months') {
      const current = new Date(start.getFullYear(), start.getMonth(), 1);
      while (current <= end) {
        const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        
        columns.push({
          id: `${current.getFullYear()}-${current.getMonth() + 1}`,
          label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          startDate: monthStart.toISOString().split('T')[0],
          endDate: monthEnd.toISOString().split('T')[0],
          type: 'month',
        });
        
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      // Weeks view
      const current = new Date(start);
      const firstDayOfWeek = current.getDate() - current.getDay();
      current.setDate(firstDayOfWeek);
      
      while (current <= end) {
        const weekStart = new Date(current);
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        columns.push({
          id: `week-${weekStart.toISOString().split('T')[0]}`,
          label: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
          type: 'week',
        });
        
        current.setDate(current.getDate() + 7);
      }
    }
    
    return columns;
  }, [startDate, endDate, settings.timelineView]);

  // Group items by timeline columns
  const itemsByColumn = useMemo(() => {
    const grouped: Record<string, RoadmapItem[]> = {};
    
    timelineColumns.forEach(column => {
      grouped[column.id] = getItemsByDateRange(column.startDate, column.endDate);
    });
    
    return grouped;
  }, [items, timelineColumns, getItemsByDateRange]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropping on a timeline column, move the item to that time period
    const targetColumn = timelineColumns.find(col => col.id === overId);
    if (targetColumn) {
      const item = items.find(item => item.id === activeId);
      if (item) {
        // Calculate new dates based on item duration and target column
        const itemDuration = new Date(item.endDate).getTime() - new Date(item.startDate).getTime();
        const newStartDate = new Date(targetColumn.startDate);
        const newEndDate = new Date(newStartDate.getTime() + itemDuration);
        
        // Ensure end date doesn't exceed column end
        const columnEndDate = new Date(targetColumn.endDate);
        if (newEndDate > columnEndDate) {
          newEndDate.setTime(columnEndDate.getTime());
        }
        
        moveItem(activeId, newStartDate.toISOString().split('T')[0], newEndDate.toISOString().split('T')[0]);
      }
    }

    setActiveId(null);
  };

  const activeItem = items.find(item => item.id === activeId);

  const themeClasses = settings.darkMode
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';

  const columnClasses = settings.darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div className={`h-full flex ${themeClasses}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Timeline Header */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-max">
            {/* Column Headers */}
            <div className="flex border-b border-gray-200 sticky top-0 z-10">
              {timelineColumns.map((column) => (
                <div
                  key={column.id}
                  className={`min-w-64 p-4 border-r ${columnClasses} ${
                    settings.darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  <h3 className="font-semibold text-sm text-center">{column.label}</h3>
                  <p className={`text-xs text-center mt-1 ${
                    settings.darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date(column.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(column.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>

            {/* Timeline Content */}
            <div className="flex">
              {timelineColumns.map((column) => (
                <SortableContext
                  key={column.id}
                  items={itemsByColumn[column.id]?.map(item => item.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className={`min-w-64 min-h-96 p-4 border-r space-y-3 ${
                      settings.darkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    {itemsByColumn[column.id]?.map((item) => (
                      <RoadmapItemCard
                        key={item.id}
                        item={item}
                        onEdit={onEditItem}
                        isDragging={activeId === item.id}
                        showDates={settings.showDates}
                        showProgress={settings.showProgress}
                        showLabels={settings.showLabels}
                      />
                    ))}
                  </div>
                </SortableContext>
              ))}
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        {activeItem && (
          <div className="fixed pointer-events-none z-50 opacity-75">
            <RoadmapItemCard
              item={activeItem}
              onEdit={() => {}}
              isDragging={true}
              showDates={settings.showDates}
              showProgress={settings.showProgress}
              showLabels={settings.showLabels}
            />
          </div>
        )}
      </DndContext>
    </div>
  );
};

export default TimelineView;