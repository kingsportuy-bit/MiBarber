import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onValueChange?: (tabId: string) => void;
  className?: string;
}

/**
 * Componente Tabs para navegación entre secciones
 * @param tabs - Array de pestañas con id y label
 * @param defaultTab - ID de la pestaña activa por defecto
 * @param onValueChange - Callback cuando cambia la pestaña activa
 */
export function Tabs({ 
  tabs, 
  defaultTab, 
  onValueChange,
  className = ''
}: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab || tabs[0]?.id || '');
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onValueChange?.(tabId);
  };
  
  const classes = `v2-flex v2-flex-wrap gap-4 border-b border-[var(--border-primary)] ${className}`.trim();
  
  return (
    <div className={classes}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`v2-pb-sm v2-transition v2-tabs-selector ${
            activeTab === tab.id 
              ? 'active' 
              : ''
          }`}
          onClick={() => handleTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

interface TabContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabContent({ 
  value, 
  activeTab, 
  children,
  className = ''
}: TabContentProps) {
  if (value !== activeTab) return null;
  
  const classes = className.trim();
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
}
