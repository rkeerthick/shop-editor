"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { EditorBlock } from "@/types/blocks";
import { BLOCK_LABELS } from "@/types/blocks";

interface SortableBlockProps {
  block: EditorBlock;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  children: React.ReactNode;
}

export function SortableBlock({
  block,
  isSelected,
  onClick,
  onDelete,
  onToggleVisibility,
  children,
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border-2 overflow-hidden cursor-pointer transition-colors ${
        isSelected ? "border-primary" : "border-transparent hover:border-gray-200"
      } ${!block.isVisible ? "opacity-50" : ""}`}
      onClick={onClick}
    >
      {/* Block header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab text-muted-foreground hover:text-foreground p-0.5"
            title="Drag to reorder"
          >
            ⠿
          </button>
          <span className="text-xs font-medium text-muted-foreground">{BLOCK_LABELS[block.type]}</span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggleVisibility}
            className="text-xs px-1.5 py-0.5 rounded hover:bg-gray-200 text-muted-foreground"
            title={block.isVisible ? "Hide block" : "Show block"}
          >
            {block.isVisible ? "👁" : "🙈"}
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-1.5 py-0.5 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600"
            title="Delete block"
          >
            ✕
          </button>
        </div>
      </div>
      {/* Block content preview */}
      <div className="pointer-events-none select-none">{children}</div>
    </div>
  );
}
