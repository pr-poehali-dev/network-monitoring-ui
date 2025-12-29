import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdvancedMetricsProps {
  totals: any;
}

export default function AdvancedMetrics({ totals }: AdvancedMetricsProps) {
  const metrics = [
    {
      title: 'Эффективная успешность',
      value: `${totals.effectiveSuccessRatePct?.toFixed(1) || 0}%`,
      description: 'Без учёта Remote-stop',
      icon: 'TrendingUp',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Средняя длительность',
      value: `${Math.round((totals.avgSessionDurationSec || 0) / 60)} мин`,
      description: `${Math.round((totals.avgSessionDurationSec || 0) / 3600)} ч ${Math.round(((totals.avgSessionDurationSec || 0) % 3600) / 60)} м`,
      icon: 'Clock',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Средняя энергия',
      value: `${totals.avgEnergyPerSessionKwh?.toFixed(2) || 0} кВт⋅ч`,
      description: 'На одну сессию',
      icon: 'Zap',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Неуспешные сессии',
      value: `${totals.failedSessions?.toLocaleString() || 0}`,
      description: `${totals.failureRatePct?.toFixed(1) || 0}% от всех`,
      icon: 'XCircle',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon name={metric.icon as any} className={`h-4 w-4 ${metric.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
