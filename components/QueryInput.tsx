import { useState } from 'react';
import { QueryMode } from '@/types';

interface QueryInputProps {
  mode: QueryMode;
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

export default function QueryInput({ mode, onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'nl':
        return 'e.g., Compare CAC and ROAS for last 30 days vs prior 30 days';
      case 'sql':
        return 'SELECT * FROM `ai-biz-6b7ec.n8n.ads_spend` LIMIT 10';
      default:
        return 'Enter your query...';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'sql' ? (
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={getPlaceholder()}
          className="input-field min-h-[150px] font-mono text-sm resize-y"
          disabled={isLoading}
        />
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          className="input-field"
          disabled={isLoading}
        />
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="btn"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          ) : mode === 'nl' ? (
            'Ask'
          ) : (
            'Execute'
          )}
        </button>
      </div>
    </form>
  );
}