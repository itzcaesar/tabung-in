'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { 
  defaultWidgetConfig, 
  type DashboardWidgets, 
  type WidgetId,
  type WidgetLayout
} from '@/lib/utils/widget-config';

export async function getUserPreferences() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  try {
    const [prefs] = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id));

    if (!prefs) {
      // Return default config if no preferences saved
      return {
        dashboardWidgets: defaultWidgetConfig,
        theme: 'system',
        currency: 'IDR',
        language: 'id',
      };
    }

    // Parse and merge with defaults to ensure all widgets are present
    const savedWidgets = prefs.dashboardWidgets 
      ? JSON.parse(prefs.dashboardWidgets) as Record<string, unknown>
      : {};
    
    // Merge with defaults to ensure new widgets are included and have proper layout
    const mergedWidgets = { ...defaultWidgetConfig };
    Object.keys(savedWidgets).forEach(key => {
      if (mergedWidgets[key] && savedWidgets[key]) {
        const saved = savedWidgets[key] as { enabled?: boolean; layout?: WidgetLayout };
        mergedWidgets[key] = {
          enabled: saved.enabled ?? mergedWidgets[key].enabled,
          // Use saved layout if it has the required properties, otherwise use default
          layout: saved.layout?.x !== undefined 
            ? { ...mergedWidgets[key].layout, ...saved.layout }
            : mergedWidgets[key].layout,
        };
      }
    });

    return {
      ...prefs,
      dashboardWidgets: mergedWidgets,
    };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return {
      dashboardWidgets: defaultWidgetConfig,
      theme: 'system',
      currency: 'IDR',
      language: 'id',
    };
  }
}

export async function updateDashboardWidgets(widgets: DashboardWidgets) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    const widgetsJson = JSON.stringify(widgets);
    
    // Check if preferences exist
    const [existing] = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, session.user.id));

    if (existing) {
      // Update existing
      await db.update(userPreferences)
        .set({ 
          dashboardWidgets: widgetsJson,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, session.user.id));
    } else {
      // Insert new
      await db.insert(userPreferences).values({
        userId: session.user.id,
        dashboardWidgets: widgetsJson,
      });
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating dashboard widgets:', error);
    return { error: 'Failed to update preferences' };
  }
}

export async function toggleWidget(widgetId: WidgetId, enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    // Get current preferences
    const prefs = await getUserPreferences();
    const widgets = prefs?.dashboardWidgets || defaultWidgetConfig;
    
    // Update widget enabled status
    widgets[widgetId] = {
      ...widgets[widgetId],
      enabled,
    };

    return updateDashboardWidgets(widgets);
  } catch (error) {
    console.error('Error toggling widget:', error);
    return { error: 'Failed to toggle widget' };
  }
}

export async function updateWidgetLayout(widgetId: WidgetId, layout: Partial<WidgetLayout>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    // Get current preferences
    const prefs = await getUserPreferences();
    const widgets = prefs?.dashboardWidgets || defaultWidgetConfig;
    
    // Update widget layout
    if (widgets[widgetId]) {
      widgets[widgetId] = {
        ...widgets[widgetId],
        layout: {
          ...widgets[widgetId].layout,
          ...layout,
        },
      };
    }

    return updateDashboardWidgets(widgets);
  } catch (error) {
    console.error('Error updating widget layout:', error);
    return { error: 'Failed to update widget layout' };
  }
}

export async function resetDashboardWidgets() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await updateDashboardWidgets(defaultWidgetConfig);
    return { success: true, widgets: defaultWidgetConfig };
  } catch (error) {
    console.error('Error resetting widgets:', error);
    return { error: 'Failed to reset widgets' };
  }
}

export async function resetWidgetsToDefault() {
  return resetDashboardWidgets();
}
