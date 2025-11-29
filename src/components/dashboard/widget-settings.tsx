'use client';

import { useState, useEffect } from 'react';
import { X, GripVertical, Eye, EyeOff, RotateCcw, Settings2 } from 'lucide-react';
import { 
  widgetMetadata, 
  defaultWidgetConfig,
  type DashboardWidgets,
  type WidgetId,
} from '@/lib/utils/widget-config';

interface WidgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidgets;
  onSave: (widgets: DashboardWidgets) => Promise<void>;
}

export function WidgetSettingsModal({ 
  isOpen, 
  onClose, 
  widgets: initialWidgets,
  onSave,
}: WidgetSettingsModalProps) {
  const [widgets, setWidgets] = useState<DashboardWidgets>(initialWidgets);
  const [saving, setSaving] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<WidgetId | null>(null);

  useEffect(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  if (!isOpen) return null;

  // Sort widgets by layout position (y coordinate)
  const sortedWidgets = Object.entries(widgets)
    .sort(([, a], [, b]) => a.layout.y - b.layout.y) as [WidgetId, typeof widgets[string]][];

  const toggleWidget = (widgetId: WidgetId) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: {
        ...prev[widgetId],
        enabled: !prev[widgetId].enabled,
      },
    }));
  };

  const handleDragStart = (e: React.DragEvent, widgetId: WidgetId) => {
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: WidgetId) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const newWidgets = { ...widgets };
    const draggedY = newWidgets[draggedWidget].layout.y;
    const targetY = newWidgets[targetWidgetId].layout.y;

    // Swap y positions
    newWidgets[draggedWidget] = {
      ...newWidgets[draggedWidget],
      layout: { ...newWidgets[draggedWidget].layout, y: targetY }
    };
    newWidgets[targetWidgetId] = {
      ...newWidgets[targetWidgetId],
      layout: { ...newWidgets[targetWidgetId].layout, y: draggedY }
    };

    setWidgets(newWidgets);
    setDraggedWidget(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(widgets);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setWidgets(defaultWidgetConfig);
  };

  const enabledCount = Object.values(widgets).filter(w => w.enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Kustomisasi Widget
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Aktifkan atau nonaktifkan widget, dan seret untuk mengubah urutan.
            Widget aktif: {enabledCount}/{Object.keys(widgets).length}
          </p>

          <div className="space-y-2">
            {sortedWidgets.map(([widgetId, config]) => {
              const meta = widgetMetadata[widgetId];
              if (!meta) return null;

              return (
                <div
                  key={widgetId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widgetId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, widgetId)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border transition-all cursor-move
                    ${config.enabled 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' 
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
                    }
                    ${draggedWidget === widgetId ? 'opacity-50 scale-95' : ''}
                    hover:shadow-md
                  `}
                >
                  {/* Drag Handle */}
                  <div className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Icon */}
                  <div className="text-2xl">{meta.icon}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${config.enabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {meta.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {meta.description}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleWidget(widgetId)}
                    className={`
                      p-2 rounded-lg transition-colors
                      ${config.enabled 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                      }
                    `}
                    title={config.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {config.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Default
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Button component to trigger the modal
export function WidgetSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
      title="Kustomisasi Widget"
    >
      <Settings2 className="w-4 h-4" />
      <span className="hidden sm:inline">Kustomisasi</span>
    </button>
  );
}
