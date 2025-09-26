import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { CriticalNotification } from './types';
import { getUrgencyColor, getUrgencyText, getUrgencyIcon } from './utils';

interface CriticalNotificationsTabProps {
  notifications: CriticalNotification[];
  onTakeAction: (notificationId: string, stationId: string) => void;
  onDismiss: (notificationId: string) => void;
}

export default function CriticalNotificationsTab({ 
  notifications, 
  onTakeAction, 
  onDismiss 
}: CriticalNotificationsTabProps) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon name="CheckCircle" size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Критичных уведомлений нет</h3>
            <p className="text-gray-500">Все станции работают в штатном режиме</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className={`border-l-4 ${getUrgencyColor(notification.urgency).includes('red') ? 'border-l-red-500' : notification.urgency === 'urgent' ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getUrgencyColor(notification.urgency)}`}>
                  <Icon name={getUrgencyIcon(notification.urgency)} size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{notification.issue}</CardTitle>
                    <Badge className={`text-xs ${getUrgencyColor(notification.urgency)} border`}>
                      {getUrgencyText(notification.urgency)}
                    </Badge>
                    {notification.repeatCount && (
                      <Badge variant="outline" className="text-xs">
                        {notification.repeatCount}x
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <Icon name="MapPin" size={14} className="inline mr-1" />
                    {notification.station}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{notification.description}</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <Icon name="Lightbulb" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">Необходимые действия:</p>
                        <p className="text-sm text-blue-700">{notification.actionNeeded}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      Возникло: {notification.occuredAt}
                    </div>
                    {notification.lastAttempt && (
                      <div className="flex items-center gap-1">
                        <Icon name="RotateCcw" size={12} />
                        Последняя попытка: {notification.lastAttempt}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDismiss(notification.id)}
              >
                Отклонить
              </Button>
              <Button 
                size="sm"
                onClick={() => onTakeAction(notification.id, notification.stationId)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Icon name="ExternalLink" size={16} className="mr-2" />
                Подключиться к станции
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}