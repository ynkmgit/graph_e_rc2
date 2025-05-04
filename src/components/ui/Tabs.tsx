'use client';

import React, { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  variant?: 'default' | 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTabId,
  variant = 'default',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id || '');

  const getTabStyles = (tabId: string) => {
    const isActive = activeTab === tabId;

    if (variant === 'pills') {
      return isActive
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200';
    }

    if (variant === 'underline') {
      return isActive
        ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
        : 'border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200';
    }

    // default
    return isActive
      ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-t border-l border-r rounded-t-lg'
      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200';
  };

  const tabClass = 'px-4 py-2 text-sm font-medium transition-colors duration-150';
  const tabsContainerClass = variant === 'underline' 
    ? 'flex space-x-4 border-b border-gray-200 dark:border-gray-700' 
    : 'flex space-x-1';

  return (
    <div className={className}>
      <div className={tabsContainerClass}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${tabClass} ${getTabStyles(tab.id)}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};
