import Icon from '@/components/ui/icon';

export default function StatisticsHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Icon name="BarChart3" size={24} className="text-blue-500" />
            <h1 className="text-xl font-semibold">Статистика сети станций</h1>
          </div>
        </div>
      </div>
    </header>
  );
}