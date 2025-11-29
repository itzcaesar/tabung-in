'use client';

import { useState, useCallback, ReactNode, useEffect } from 'react';
import GridLayout, { Layout, WidthProvider } from 'react-grid-layout';
import { 
  DashboardWidgets, 
  toGridLayout, 
  fromGridLayout,
  GRID_COLS,
  GRID_ROW_HEIGHT,
  widgetMetadata,
  WidgetId,
  defaultWidgetConfig
} from '@/lib/utils/widget-config';
import { updateDashboardWidgets, resetDashboardWidgets } from '@/lib/actions/preferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings2, 
  Lock, 
  Unlock, 
  RotateCcw, 
  Eye, 
  EyeOff,
  GripVertical,
  X,
  Check,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(GridLayout);

interface DraggableGridProps {
  widgets: DashboardWidgets;
  children: Record<WidgetId, ReactNode>;
}

export function DraggableGrid({ widgets: initialWidgets, children }: DraggableGridProps) {
  const [widgets, setWidgets] = useState<DashboardWidgets>(initialWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);

  // Sync with initial widgets when they change
  useEffect(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  const layout = toGridLayout(widgets);

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (!isEditing) return;
    
    const updatedWidgets = fromGridLayout(newLayout, widgets);
    setWidgets(updatedWidgets);
    setPendingChanges(true);
  }, [isEditing, widgets]);

  const handleToggleWidget = useCallback((widgetId: WidgetId) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: {
        ...prev[widgetId],
        enabled: !prev[widgetId]?.enabled
      }
    }));
    setPendingChanges(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDashboardWidgets(widgets);
      setPendingChanges(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save layout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      const result = await resetDashboardWidgets();
      if (result.success && result.widgets) {
        setWidgets(result.widgets as DashboardWidgets);
        setPendingChanges(false);
      }
    } catch (error) {
      console.error('Failed to reset layout:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setWidgets(initialWidgets);
    setPendingChanges(false);
    setIsEditing(false);
    setShowWidgetPanel(false);
  };

  // Responsive breakpoints
  const getColsForWidth = () => {
    if (typeof window === 'undefined') return GRID_COLS;
    const width = window.innerWidth;
    if (width < 640) return 4; // mobile
    if (width < 1024) return 8; // tablet
    return GRID_COLS; // desktop
  };

  return (
    <div className="relative">
      {/* Edit Controls */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-4 -mx-4 px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <div className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg">
                  <Unlock className="h-4 w-4" />
                  <span className="hidden sm:inline">Mode Edit - Drag & Resize Widget</span>
                  <span className="sm:hidden">Edit Mode</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Layout Terkunci</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWidgetPanel(!showWidgetPanel)}
                  className="gap-1.5"
                >
                  {showWidgetPanel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="hidden sm:inline">Widget</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Batal</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !pendingChanges}
                  className="gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">Simpan</span>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Atur Layout</span>
              </Button>
            )}
          </div>
        </div>

        {/* Widget Toggle Panel */}
        {showWidgetPanel && isEditing && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Tampilkan/Sembunyikan Widget:</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(widgetMetadata) as WidgetId[]).map((id) => {
                const meta = widgetMetadata[id];
                const isEnabled = widgets[id]?.enabled ?? true;
                return (
                  <button
                    key={id}
                    onClick={() => handleToggleWidget(id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                      isEnabled 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.name}</span>
                    {isEnabled ? (
                      <Eye className="h-3 w-3 ml-1" />
                    ) : (
                      <EyeOff className="h-3 w-3 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layout={layout}
        cols={GRID_COLS}
        rowHeight={GRID_ROW_HEIGHT}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".drag-handle"
        resizeHandles={['se', 'sw', 'ne', 'nw']}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        compactType="vertical"
        preventCollision={false}
      >
        {layout.map((item) => {
          const widgetId = item.i as WidgetId;
          const content = children[widgetId];
          
          if (!content) return null;

          return (
            <div key={item.i} className="widget-container">
              <WidgetContainer 
                widgetId={widgetId} 
                isEditing={isEditing}
                onToggle={() => handleToggleWidget(widgetId)}
              >
                {content}
              </WidgetContainer>
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {/* Overlay when editing */}
      {isEditing && (
        <style jsx global>{`
          .react-grid-item {
            transition: all 200ms ease;
          }
          .react-grid-item.react-grid-placeholder {
            background: hsl(var(--primary) / 0.2);
            border: 2px dashed hsl(var(--primary));
            border-radius: 12px;
          }
          .react-grid-item > .react-resizable-handle {
            background: hsl(var(--primary));
            border-radius: 4px;
            width: 12px;
            height: 12px;
          }
          .react-grid-item > .react-resizable-handle::after {
            border-color: white;
          }
          .widget-container {
            height: 100%;
          }
          .widget-editing {
            outline: 2px dashed hsl(var(--primary) / 0.5);
            outline-offset: 2px;
          }
        `}</style>
      )}
    </div>
  );
}

interface WidgetContainerProps {
  widgetId: WidgetId;
  isEditing: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function WidgetContainer({ widgetId, isEditing, onToggle, children }: WidgetContainerProps) {
  const meta = widgetMetadata[widgetId];
  
  return (
    <div className={cn(
      "h-full relative group",
      isEditing && "widget-editing rounded-xl"
    )}>
      {isEditing && (
        <div className="absolute -top-1 -left-1 -right-1 z-10 flex items-center justify-between p-1.5 bg-primary/90 text-primary-foreground rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="drag-handle cursor-move flex items-center gap-1.5 px-2 py-0.5">
            <GripVertical className="h-4 w-4" />
            <span className="text-xs font-medium">{meta.icon} {meta.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggle}
              className="p-1 hover:bg-white/20 rounded"
              title="Sembunyikan widget"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      <div className="h-full overflow-auto">
        {children}
      </div>
    </div>
  );
}
