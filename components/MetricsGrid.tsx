import { MetricsData } from '@/types';

interface MetricsGridProps {
  metrics: MetricsData;
  period: string;
}

export default function MetricsGrid({ metrics, period }: MetricsGridProps) {
  const formatNumber = (num: number | null | undefined, decimals = 2): string => {
    if (num === null || num === undefined || isNaN(Number(num))) return '-';
    
    const numValue = Number(num);
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(decimals) + 'M';
    } else if (numValue >= 1000) {
      return (numValue / 1000).toFixed(decimals) + 'K';
    }
    return numValue.toFixed(decimals);
  };

  const formatCurrency = (num: number | null | undefined): string => {
    if (num === null || num === undefined || isNaN(Number(num))) return '-';
    return '$' + formatNumber(num);
  };

  const metricCards = [
    {
      label: 'Total Spend',
      value: formatCurrency(metrics.total_spend),
      icon: '💰',
      color: 'from-red-50 to-red-100 border-red-200'
    },
    {
      label: 'Conversions',
      value: formatNumber(metrics.total_conversions, 0),
      icon: '🎉',
      color: 'from-green-50 to-green-100 border-green-200'
    },
    {
      label: 'CAC',
      value: formatCurrency(metrics.overall_cac),
      icon: '🎯',
      color: 'from-blue-50 to-blue-100 border-blue-200'
    },
    {
      label: 'CPC',
      value: formatCurrency(metrics.overall_cpc),
      icon: '👆',
      color: 'from-yellow-50 to-yellow-100 border-yellow-200'
    },
    {
      label: 'CTR',
      value: formatNumber(metrics.overall_ctr, 2) + '%',
      icon: '🖱️',
      color: 'from-indigo-50 to-indigo-100 border-indigo-200'
    },
    {
      label: 'CVR',
      value: formatNumber(metrics.overall_cvr, 2) + '%',
      icon: '✅',
      color: 'from-teal-50 to-teal-100 border-teal-200'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Quick Metrics</h2>
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          {period}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${metric.color} rounded-lg p-4 border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {metric.label}
              </span>
              <span className="text-lg">{metric.icon}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm text-gray-600">
          <strong>{metrics.days_with_data}</strong> days with data • 
          <strong className="ml-2">{formatNumber(metrics.total_impressions, 0)}</strong> impressions • 
          <strong className="ml-2">{formatNumber(metrics.total_clicks, 0)}</strong> clicks
        </div>
      </div>
    </div>
  );
}