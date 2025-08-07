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
} from '@dnd-kit/sortable';
import type { RoadmapItem } from './roadmap-types';
import { useRoadmapStore } from './roadmap-store';
import RoadmapItemCard from './roadmap-item-card';

interface ListViewProps {
  items: RoadmapItem[];
  onEditItem: (itemId: string) => void;
}

const ListView: React.FC<ListViewProps> = ({ items, onEditItem }) => {
  const { settings, reorderItems } = useRoadmapStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Group items by status
  const itemsByStatus = useMemo(() => {
    const grouped: Record<string, RoadmapItem[]> = {
      'planned': [],
      'in-progress': [],
      'completed': [],
      'on-hold': [],
      'cancelled': [],
    };

    items.forEach((item) => {
      if (grouped[item.status]) {
        grouped[item.status].push(item);
      }
    });

    // Sort items within each group
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort((a, b) => {
        // Sort by order first, then by start date
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    });

    return grouped;
  }, [items]);

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

    if (activeId !== overId) {
      // Find the items and their positions
      const activeItem = items.find(item => item.id === activeId);
      const overItem = items.find(item => item.id === overId);

      if (activeItem && overItem) {
        // Create new order based on drag operation
        const sortedItems = [...items].sort((a, b) => a.order - b.order);
        const activeIndex = sortedItems.findIndex(item => item.id === activeId);
        const overIndex = sortedItems.findIndex(item => item.id === overId);

        // Remove active item and insert at new position
        const newItems = [...sortedItems];
        const [movedItem] = newItems.splice(activeIndex, 1);
        newItems.splice(overIndex, 0, movedItem);

        // Update order
        reorderItems(newItems.map(item => item.id));
      }
    }

    setActiveId(null);
  };

  const activeItem = items.find(item => item.id === activeId);

  const getStatusLabel = (status: string) => {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusCount = (status: string) => {
    return itemsByStatus[status]?.length || 0;
  };

  const themeClasses = settings.darkMode
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';

  const sectionClasses = settings.darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  return (
    <div className={`h-full overflow-auto p-6 ${themeClasses}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {Object.entries(itemsByStatus).map(([status, statusItems]) => {
            if (statusItems.length === 0) return null;

            return (
              <div key={status} className={`rounded-lg border ${sectionClasses}`}>
                {/* Status Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        status === 'planned' ? 'bg-gray-400' :
                        status === 'in-progress' ? 'bg-blue-500' :
                        status === 'completed' ? 'bg-green-500' :
                        status === 'on-hold' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <span>{getStatusLabel(status)}</span>
                    </span>
                    <span className={`text-sm font-normal px-2 py-1 rounded-full ${
                      settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getStatusCount(status)}
                    </span>
                  </h2>
                </div>

                {/* Items */}
                <div className="p-4">
                  <SortableContext
                    items={statusItems.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {statusItems.map((item) => (
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
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {items.length === 0 && (
            <div className={`text-center py-12 ${
              settings.darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">No roadmap items yet</h3>
              <p>Get started by adding your first roadmap item!</p>
            </div>
          )}
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

export default ListView;