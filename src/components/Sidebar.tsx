import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';

const Sidebar = () => {
  const location = useLocation();
  
  const navigation = [
    {
      name: 'Карта',
      href: '/?tab=map',
      icon: 'Map',
      active: location.pathname === '/' && (location.search.includes('tab=map') || !location.search)
    },
    {
      name: 'Список станций',
      href: '/?tab=list',
      icon: 'List',
      active: location.pathname === '/' && location.search.includes('tab=list')
    },
    {
      name: 'Статистика',
      href: '/statistics',
      icon: 'BarChart3',
      active: location.pathname === '/statistics'
    },
    {
      name: 'Мониторинг',
      href: '/monitoring',
      icon: 'AlertTriangle',
      active: location.pathname === '/monitoring'
    }
  ];

  const isStationPage = location.pathname.startsWith('/station/');

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">EV Control</h1>
            <p className="text-xs text-gray-500">Управление станциями</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                item.active
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon 
                name={item.icon} 
                size={20} 
                className={item.active ? 'text-blue-600' : 'text-gray-400'} 
              />
              {item.name}
            </Link>
          ))}

          {/* Текущая станция */}
          {isStationPage && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-3">
                Текущая станция
              </div>
              <div className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium bg-green-50 text-green-700 rounded-lg border-r-2 border-green-600">
                <Icon name="Zap" size={20} className="text-green-600" />
                <div>
                  <div>ЭЗС FLY 388</div>
                  <div className="text-xs text-green-600">Промышленный парк</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 px-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Статистика
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Всего станций</span>
              <span className="font-medium">24</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Активных</span>
              <span className="font-medium text-green-600">18</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Оффлайн</span>
              <span className="font-medium text-red-600">3</span>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="mt-6 px-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Активные ошибки
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Критичные</span>
              </div>
              <span className="font-medium text-red-600">2</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-600">Внимание</span>
              </div>
              <span className="font-medium text-orange-600">5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Уведомления</span>
              </div>
              <span className="font-medium text-blue-600">12</span>
            </div>
          </div>
          <Link 
            to="/monitoring" 
            className="block mt-3 text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            Подробнее →
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;