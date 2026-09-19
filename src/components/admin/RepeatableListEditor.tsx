import React, { useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  GripVertical,
  Layers,
  Sparkles
} from 'lucide-react';

export interface RepeatableItem {
  id?: string | number;
  sort_order?: number;
  [key: string]: any;
}

export interface RepeatableListEditorProps<T extends RepeatableItem> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (
    item: T,
    index: number,
    updateItem: (patch: Partial<T>) => void,
    helpers: { isFirst: boolean; isLast: boolean; isExpanded: boolean }
  ) => React.ReactNode;
  createNewItem: () => T;
  addButtonLabel?: string;
  emptyMessage?: string;
  itemTitle?: (item: T, index: number) => string;
  itemBadge?: (item: T, index: number) => React.ReactNode;
  isUrdu?: boolean;
  defaultExpandedIndex?: number;
}

export function RepeatableListEditor<T extends RepeatableItem>({
  items,
  onChange,
  renderItem,
  createNewItem,
  addButtonLabel,
  emptyMessage,
  itemTitle,
  itemBadge,
  isUrdu = false,
  defaultExpandedIndex = 0,
}: RepeatableListEditorProps<T>) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (items.length > 0 && defaultExpandedIndex >= 0 && defaultExpandedIndex < items.length) {
      const key = String(items[defaultExpandedIndex].id ?? defaultExpandedIndex);
      initial[key] = true;
    }
    return initial;
  });

  const getItemKey = (item: T, index: number) => String(item.id ?? index);

  const toggleExpand = (key: string) => {
    setExpandedIds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    items.forEach((it, idx) => {
      all[getItemKey(it, idx)] = true;
    });
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const handleUpdateItem = (index: number, patch: Partial<T>) => {
    const updated = items.map((it, idx) => {
      if (idx === index) {
        return { ...it, ...patch };
      }
      return it;
    });
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...items];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    // Re-index sort_order
    const reindexed = copy.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    onChange(reindexed);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const copy = [...items];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    // Re-index sort_order
    const reindexed = copy.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    onChange(reindexed);
  };

  const handleDelete = (index: number) => {
    const item = items[index];
    const label = itemTitle ? itemTitle(item, index) : `#${index + 1}`;
    const confirmed = window.confirm(
      isUrdu
        ? `کیا آپ واقعی "${label}" کو حذف کرنا چاہتے ہیں؟`
        : `Are you sure you want to delete "${label}"?`
    );
    if (!confirmed) return;

    const filtered = items.filter((_, idx) => idx !== index);
    const reindexed = filtered.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    onChange(reindexed);
  };

  const handleDuplicate = (index: number) => {
    const orig = items[index];
    const clone: T = {
      ...orig,
      id: Date.now() + Math.random(),
      title: orig.title ? `${orig.title} (Copy)` : orig.title,
      name: orig.name ? `${orig.name} (Copy)` : orig.name,
      sort_order: index + 2,
    };
    const nextList = [...items.slice(0, index + 1), clone, ...items.slice(index + 1)];
    const reindexed = nextList.map((it, idx) => ({ ...it, sort_order: idx + 1 }));
    const newKey = getItemKey(clone, index + 1);
    setExpandedIds(prev => ({ ...prev, [newKey]: true }));
    onChange(reindexed);
  };

  const handleAddItem = () => {
    const newItem = createNewItem();
    newItem.sort_order = items.length + 1;
    if (!newItem.id) {
      newItem.id = Date.now();
    }
    const nextList = [...items, newItem];
    const newKey = getItemKey(newItem, nextList.length - 1);
    setExpandedIds(prev => ({ ...prev, [newKey]: true }));
    onChange(nextList);
  };

  return (
    <div className="space-y-4">
      {/* List Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Layers className="w-4 h-4 text-[#AD7A28]" />
          <span>
            {isUrdu ? `کل اشیاء: ${items.length}` : `Total Items: ${items.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={expandAll}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {isUrdu ? 'سب کھولیں' : 'Expand All'}
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {isUrdu ? 'سب بند کریں' : 'Collapse All'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#AD7A28] hover:bg-[#8C601A] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{addButtonLabel || (isUrdu ? 'نیا شامل کریں' : 'Add Item')}</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm text-slate-500 font-medium mb-3">
            {emptyMessage || (isUrdu ? 'کوئی مواد موجود نہیں ہے' : 'No items added yet.')}
          </p>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16232F] hover:bg-[#223546] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{addButtonLabel || (isUrdu ? 'پہلی آئٹم شامل کریں' : 'Add First Item')}</span>
          </button>
        </div>
      ) : (
        /* Items Accordion List */
        <div className="space-y-3">
          {items.map((item, index) => {
            const key = getItemKey(item, index);
            const isExpanded = !!expandedIds[key];
            const title = itemTitle
              ? itemTitle(item, index)
              : (item.title || item.name || item.slug || `#${index + 1}`);
            const badge = itemBadge ? itemBadge(item, index) : null;
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <div
                key={key}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/75 border-b border-slate-100 gap-2 select-none">
                  {/* Left: Drag Handle / Index & Title */}
                  <div
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                    onClick={() => toggleExpand(key)}
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#16232F] text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <span className="font-bold text-slate-800 text-sm truncate">
                      {title}
                    </span>

                    {badge && <div className="shrink-0">{badge}</div>}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={isFirst}
                      title="Move Up"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={isLast}
                      title="Move Down"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(index)}
                      title="Duplicate"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#AD7A28] hover:bg-amber-50 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExpand(key)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors ml-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#AD7A28]" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-white animate-fadeIn">
                    {renderItem(
                      item,
                      index,
                      (patch) => handleUpdateItem(index, patch),
                      { isFirst, isLast, isExpanded }
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Add button */}
      {items.length > 2 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{addButtonLabel || (isUrdu ? 'نیا آئٹم شامل کریں' : 'Add Another Item')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
