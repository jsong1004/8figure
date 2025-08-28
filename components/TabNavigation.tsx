import { QueryMode } from '@/types';

interface TabNavigationProps {
  activeMode: QueryMode;
  onModeChange: (mode: QueryMode) => void;
}

const TABS = [
  { id: 'nl' as QueryMode, label: 'Natural Language', icon: '💬' },
  { id: 'sql' as QueryMode, label: 'SQL Query', icon: '⚡' },
  { id: 'metrics' as QueryMode, label: 'Quick Metrics', icon: '📊' },
];

export default function TabNavigation({ activeMode, onModeChange }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onModeChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeMode === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}