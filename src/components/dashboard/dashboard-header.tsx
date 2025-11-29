'use client';

import { useState } from 'react';
import { WidgetSettingsModal, WidgetSettingsButton } from './widget-settings';
import { updateDashboardWidgets } from '@/lib/actions/preferences';
import { type DashboardWidgets } from '@/lib/utils/widget-config';

interface DashboardHeaderProps {
  userName?: string | null;
  widgets: DashboardWidgets;
}

export function DashboardHeader({ userName, widgets: initialWidgets }: DashboardHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [widgets, setWidgets] = useState(initialWidgets);

  const handleSave = async (newWidgets: DashboardWidgets) => {
    await updateDashboardWidgets(newWidgets);
    setWidgets(newWidgets);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Halo{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ringkasan keuangan bulan ini
          </p>
        </div>
        <WidgetSettingsButton onClick={() => setIsModalOpen(true)} />
      </div>

      <WidgetSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        widgets={widgets}
        onSave={handleSave}
      />
    </>
  );
}
