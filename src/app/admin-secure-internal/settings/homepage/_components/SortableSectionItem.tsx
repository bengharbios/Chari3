import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableSectionItemProps {
  id: string;
  children: React.ReactNode;
}

export function SortableSectionItem({ id, children }: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative flex items-stretch border-b border-border/50 last:border-0 ${isDragging ? 'shadow-2xl ring-2 ring-brand ring-offset-2 rounded-xl bg-background' : ''}`}>
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="flex items-center justify-center px-2 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-e border-border/30"
      >
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
