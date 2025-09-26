import Icon from '@/components/ui/icon';
import { mockCriticalNotifications } from './mockData';

export default function MonitoringHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Icon name="AlertTriangle" size={24} className="text-red-500" />
            <h1 className="text-xl font-semibold">Мониторинг ошибок</h1>
          </div>
          
          {/* Summary Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Требуют действий: {mockCriticalNotifications.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">Критичные: 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Внимание: 5</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}