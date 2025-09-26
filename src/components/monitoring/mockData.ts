import { Alert, CriticalNotification } from './types';

export const mockActiveAlerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    station: 'ЭЗС Центральная',
    stationId: '1',
    message: 'Коннектор 1 недоступен',
    description: 'Нет связи с зарядным контроллером',
    startTime: '25.09.2025 13:45:00',
    duration: '2ч 15м',
    status: 'active'
  },
  {
    id: '2',
    severity: 'critical',
    station: 'ЭЗС Парковая',
    stationId: '3',
    message: 'Станция недоступна',
    description: 'Потеря связи с OCPP сервером',
    startTime: '25.09.2025 10:30:00',
    duration: '5ч 30м',
    status: 'active'
  },
  {
    id: '3',
    severity: 'warning',
    station: 'ЭЗС Торговый центр',
    stationId: '2',
    message: 'Высокая температура коннектора',
    description: 'Температура превысила 65°C, требуется охлаждение',
    startTime: '25.09.2025 15:15:00',
    duration: '45м',
    status: 'active'
  },
  {
    id: '4',
    severity: 'warning',
    station: 'ЭЗС Центральная',
    stationId: '1',
    message: 'Низкий заряд резервного источника',
    description: 'Уровень заряда UPS составляет 15%',
    startTime: '25.09.2025 14:20:00',
    duration: '1ч 40м',
    status: 'acknowledged'
  },
  {
    id: '5',
    severity: 'info',
    station: 'ЭЗС Промышленная',
    stationId: '4',
    message: 'Плановое обслуживание',
    description: 'Запланировано обновление прошивки в 18:00',
    startTime: '24.09.2025 09:00:00',
    duration: '1д 7ч',
    status: 'active'
  }
];

export const mockCriticalNotifications: CriticalNotification[] = [
  {
    id: 'n1',
    station: 'ЭЗС Центральная',
    stationId: '1',
    issue: 'Три неудачные попытки запуска зарядки',
    description: 'Пользователь не может начать зарядку. Коннектор блокируется после каждой попытки.',
    actionNeeded: 'Подключиться к станции и проверить состояние коннектора',
    urgency: 'immediate',
    occuredAt: '25.09.2025 15:45:00',
    repeatCount: 3,
    lastAttempt: '25.09.2025 15:47:00'
  },
  {
    id: 'n2',
    station: 'ЭЗС Парковая',
    stationId: '3',
    issue: 'Превышение температуры контроллера',
    description: 'Температура достигла 85°C. Система охлаждения не справляется.',
    actionNeeded: 'Немедленно проверить систему охлаждения и вентиляцию',
    urgency: 'immediate',
    occuredAt: '25.09.2025 15:30:00'
  },
  {
    id: 'n4',
    station: 'ЭЗС Промышленная',
    stationId: '4',
    issue: 'Неисправность контактора',
    description: 'Контактор не размыкается после завершения зарядки.',
    actionNeeded: 'Проверить и заменить контактор, обесточить станцию',
    urgency: 'urgent',
    occuredAt: '25.09.2025 13:20:00'
  }
];

export const mockHistoryAlerts: Alert[] = [
  {
    id: '101',
    severity: 'critical',
    station: 'ЭЗС Центральная',
    stationId: '1',
    message: 'Аварийное отключение',
    description: 'Превышение максимального тока',
    startTime: '24.09.2025 18:30:00',
    duration: '2ч 15м',
    status: 'resolved'
  },
  {
    id: '102',
    severity: 'warning',
    station: 'ЭЗС Торговый центр',
    stationId: '2',
    message: 'Высокое напряжение',
    description: 'Напряжение превышает норму на 3%',
    startTime: '23.09.2025 16:45:00',
    duration: '1ч 30м',
    status: 'resolved'
  }
];