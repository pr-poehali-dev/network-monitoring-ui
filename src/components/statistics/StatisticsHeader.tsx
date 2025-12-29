import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface StatisticsHeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
}

export default function StatisticsHeader({ onRefresh, onExport }: StatisticsHeaderProps) {
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      alert('Экспорт в разработке');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Icon name="BarChart3" size={24} className="text-blue-500" />
            <h1 className="text-xl font-semibold">Статистика сети станций</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
            >
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </Button>
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onRefresh}
              >
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
