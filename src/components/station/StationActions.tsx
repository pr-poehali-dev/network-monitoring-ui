import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface StationActionsProps {
  onAction: (action: string) => void;
}

export default function StationActions({ onAction }: StationActionsProps) {
  const handleExternalLink = (url: string, name: string) => {
    // Пока заглушка - в будущем будет реальная ссылка
    alert(`Переход на ${name}\nURL: ${url}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Действия</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">Комментарий</p>
            <p className="text-sm text-gray-500">Редактировать операционную информацию</p>
          </div>
          <Button onClick={() => onAction('editComment')}>
            РЕДАКТИРОВАТЬ
          </Button>
        </div>

        <Separator />

        {/* Внешние ссылки */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Внешние системы</h4>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="BarChart3" size={18} className="text-blue-600" />
              <div>
                <p className="font-medium">Визуализация Агавы</p>
                <p className="text-sm text-gray-500">Мониторинг и аналитика в реальном времени</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExternalLink('https://agava.visualization.com/station/1', 'Визуализацию Агавы')}
              className="flex items-center gap-2"
            >
              <Icon name="ExternalLink" size={16} />
              ОТКРЫТЬ
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="Router" size={18} className="text-green-600" />
              <div>
                <p className="font-medium">Настройки роутера</p>
                <p className="text-sm text-gray-500">Конфигурация сетевого оборудования</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExternalLink('https://router.config.com/station/1', 'настройки роутера')}
              className="flex items-center gap-2"
            >
              <Icon name="ExternalLink" size={16} />
              ОТКРЫТЬ
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="Building2" size={18} className="text-orange-600" />
              <div>
                <p className="font-medium">Bitrix24</p>
                <p className="text-sm text-gray-500">Карточка станции в CRM системе</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExternalLink('https://company.bitrix24.ru/crm/station/1', 'Bitrix24')}
              className="flex items-center gap-2"
            >
              <Icon name="ExternalLink" size={16} />
              ОТКРЫТЬ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}