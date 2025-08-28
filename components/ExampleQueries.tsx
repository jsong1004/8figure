import { ExampleQuery } from '@/types';

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void;
}

const EXAMPLE_QUERIES: ExampleQuery[] = [
  {
    title: 'CAC & Metrics Comparison (last 30 days vs prior 30 days)',
    query: 'Compare CAC and metrics for last 30 days vs prior 30 days',
    description: 'Compare customer acquisition cost and performance metrics'
  },
  {
    title: 'Spend by Platform',
    query: 'What is the total spend by platform?',
    description: 'Analyze spending across different advertising platforms'
  },
  {
    title: 'Top Campaigns by Spend',
    query: 'Show me the top 5 campaigns by total spend',
    description: 'Find the highest spending campaigns'
  },
  {
    title: 'Platform Performance',
    query: 'Calculate the average CPC and CTR for each platform',
    description: 'Compare cost per click and click-through rates'
  },
  {
    title: 'Conversion Trend',
    query: 'What is the conversion rate trend over the six months?',
    description: 'Track conversion performance over time'
  },
  {
    title: 'Budget Efficiency',
    query: 'Which campaigns have the lowest CAC?',
    description: 'Find the most cost-efficient campaigns'
  }
];

export default function ExampleQueries({ onSelectQuery }: ExampleQueriesProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-600 mb-2">Example Questions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {EXAMPLE_QUERIES.map((example, index) => (
          <button
            key={index}
            onClick={() => onSelectQuery(example.query)}
            className="text-left p-3 bg-gray-50 hover:bg-primary-50 
                       border border-gray-200 hover:border-primary-200 
                       rounded-lg transition-all duration-200 
                       hover:shadow-md group"
          >
            <div className="font-medium text-sm text-gray-800 group-hover:text-primary-700">
              {example.title}
            </div>
            {example.description && (
              <div className="text-xs text-gray-500 mt-1">
                {example.description}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}