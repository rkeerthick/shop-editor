"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { SortableBlock } from "@/components/editor/sortable-block";
import { BlockConfigPanel } from "@/components/editor/block-config-panel";
import { BlockPreview } from "@/components/editor/block-preview";
import { BLOCK_DEFAULTS, BLOCK_LABELS } from "@/types/blocks";
import type { EditorBlock, BlockType } from "@/types/blocks";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const BLOCK_TYPES: BlockType[] = ["hero", "product-grid", "banner", "text", "image", "cta"];

interface BlockEditorProps {
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  isHome: boolean;
  shopSlug: string;
  initialBlocks: EditorBlock[];
  initialMetaTitle: string;
  initialMetaDescription: string;
}

export function BlockEditor({ pageId, pageTitle, pageSlug, isHome, shopSlug, initialBlocks, initialMetaTitle, initialMetaDescription }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [metaTitle, setMetaTitle] = useState(initialMetaTitle);
  const [metaDescription, setMetaDescription] = useState(initialMetaDescription);
  const [showSeo, setShowSeo] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

  function addBlock(type: BlockType) {
    const newBlock: EditorBlock = {
      id: crypto.randomUUID(),
      type,
      order: blocks.length,
      props: { ...BLOCK_DEFAULTS[type] },
      isVisible: true,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
  }

  function updateBlock(id: string, props: Record<string, unknown>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, props } : b)));
  }

  function toggleVisibility(id: string) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, isVisible: !b.isVisible } : b)));
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id);
      const newIndex = prev.findIndex((b) => b.id === over.id);
      return arrayMove(prev, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }));
    });
  }

  const save = useCallback(async () => {
    setSaving(true);
    await Promise.all([
      fetch(`/api/storefront/pages/${pageId}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blocks.map((b, i) => ({ ...b, order: i }))),
      }),
      fetch(`/api/storefront/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metaTitle: metaTitle || null, metaDescription: metaDescription || null }),
      }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [blocks, pageId, metaTitle, metaDescription]);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] -m-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/storefront" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            ← Back
          </Link>
          <span className="font-medium">{pageTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={isHome ? `/store/${shopSlug}` : `/store/${shopSlug}/${pageSlug}`}
            target="_blank"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Preview
          </Link>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — add blocks + SEO */}
        <div className="w-48 bg-white border-r p-3 flex flex-col gap-1 overflow-y-auto shrink-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">Add block</p>
          {BLOCK_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="text-left px-2 py-1.5 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              {BLOCK_LABELS[type]}
            </button>
          ))}
          <div className="mt-4 border-t pt-3">
            <button
              onClick={() => setShowSeo((v) => !v)}
              className="text-left px-2 py-1.5 rounded text-xs w-full hover:bg-gray-100 transition-colors font-semibold text-muted-foreground uppercase tracking-wide"
            >
              SEO {showSeo ? "▲" : "▼"}
            </button>
            {showSeo && (
              <div className="flex flex-col gap-2 mt-2 px-1">
                <div>
                  <label className="text-xs text-muted-foreground">Meta title</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-xs mt-0.5"
                    placeholder={pageTitle}
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Meta description</label>
                  <textarea
                    className="w-full border rounded px-2 py-1 text-xs mt-0.5 resize-none"
                    rows={3}
                    placeholder="Page description for search engines"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center — canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-2">No blocks yet</p>
              <p className="text-sm text-muted-foreground">Add a block from the left panel to get started.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedId === block.id}
                      onClick={() => setSelectedId(block.id === selectedId ? null : block.id)}
                      onDelete={() => deleteBlock(block.id)}
                      onToggleVisibility={() => toggleVisibility(block.id)}
                    >
                      <BlockPreview block={block} />
                    </SortableBlock>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Right — config panel */}
        {selectedBlock && (
          <div className="w-72 bg-white border-l overflow-y-auto shrink-0">
            <BlockConfigPanel
              block={selectedBlock}
              onChange={(props) => updateBlock(selectedBlock.id, props)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
