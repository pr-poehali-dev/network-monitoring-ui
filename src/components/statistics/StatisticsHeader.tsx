import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function StatisticsHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Icon name="BarChart3" size={24} className="text-blue-500" />
            <h1 className="text-xl font-semibold">Статистика станций</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт отчета
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}