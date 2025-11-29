'use client';

import { ReactNode } from 'react';
import { type DashboardWidgets, type WidgetId } from '@/lib/utils/widget-config';

interface WidgetWrapperProps {
  widgetId: WidgetId;
  widgets: DashboardWidgets;
  children: ReactNode;
}

/**
 * Wrapper component that conditionally renders widget based on user preferences
 */
export function WidgetWrapper({ widgetId, widgets, children }: WidgetWrapperProps) {
  const widgetConfig = widgets[widgetId];
  
  // If widget is disabled, don't render
  if (!widgetConfig?.enabled) {
    return null;
  }

  return <>{children}</>;
}

interface WidgetContainerProps {
  widgets: DashboardWidgets;
  children: ReactNode;
  className?: string;
}

/**
 * Container that provides widget ordering based on user preferences
 */
export function WidgetContainer({ widgets, children, className }: WidgetContainerProps) {
  // For now, just render children as-is
  // Future: implement drag-and-drop reordering
  return <div className={className}>{children}</div>;
}
