# WebSocket Сервер для тестирования

Python WebSocket сервер, который возвращает заглушки данных для тестирования frontend приложения.

## Установка и запуск

### 1. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 2. Запуск сервера
```bash
# Простой запуск (WSS) - требует cert.pem и cert.key в корне
python websocket_server.py

# Или с параметрами (WSS по умолчанию)
python run_server.py --host 0.0.0.0 --port 10009

# Без SSL (только для разработки)
python run_server.py --host 0.0.0.0 --port 10009 --no-ssl
```

## Возможности

✅ **Генерация заглушек данных:**
- 100 станций зарядки
- 6 городов России с реальными координатами
- Рандомные владельцы, приложения, статусы
- Статистические данные (сессии, энергия, ошибки)

✅ **Поддержка всех запросов frontend:**
- `getStations` - список станций с фильтрами
- `getStationById` - данные конкретной станции  
- `getStationStats` - данные для статистики

✅ **Оптимизация трафика:**
- Параметр `fields` для выборочной загрузки полей
- Фильтрация по городу, владельцу, статусу
- Пагинация результатов

✅ **Real-time обновления:**
- Автоматическое изменение статусов станций каждые 30 сек
- Обновление мощности и времени последнего обновления

## Примеры запросов

### Получить все станции для карты
```json
{
  "type": "request",
  "action": "getStations", 
  "data": {
    "fields": ["id", "name", "city", "status", "coordinates", "owner"]
  },
  "requestId": "req_123"
}
```

### Получить станции для списка с фильтром
```json
{
  "type": "request",
  "action": "getStations",
  "data": {
    "fields": ["id", "name", "city", "owner", "status", "totalEnergy", "currentPower"],
    "filters": {
      "city": "Москва",
      "status": "active"
    },
    "pagination": {
      "page": 1,
      "limit": 20
    }
  },
  "requestId": "req_124"
}
```

### Получить данные конкретной станции
```json
{
  "type": "request", 
  "action": "getStationById",
  "data": {
    "stationId": "station_001"
  },
  "requestId": "req_125"
}
```

## Формат ответа

```json
{
  "type": "response",
  "action": "getStations",
  "data": {
    "stations": [...],
    "total": 100,
    "page": 1, 
    "limit": 20
  },
  "requestId": "req_123"
}
```

## Генерируемые данные

**Города:** Москва, Санкт-Петербург, Новосибирск, Екатеринбург, Казань, Нижний Новгород

**Владельцы:** РосЭнерго, ЭлектроСеть, GreenCharge, PowerNet, EcoStation, ChargeMaster

**Приложения:** ChargeApp, EcoDriver, PowerGO, ElectricWay, GreenRoute

**Статусы:** active, inactive, maintenance, error, offline

## Логи сервера

```
2024-01-20 10:30:00 - INFO - Сгенерировано 100 станций
2024-01-20 10:30:01 - INFO - Запуск WebSocket сервера на 0.0.0.0:10009
2024-01-20 10:30:01 - INFO - Сервер запущен на ws://0.0.0.0:10009/ws
2024-01-20 10:30:05 - INFO - Клиент подключен. Всего клиентов: 1
2024-01-20 10:30:06 - INFO - Получено сообщение: getStations (ID: req_123)
2024-01-20 10:30:06 - INFO - Фильтрация полей: ['id', 'name', 'city', 'status', 'coordinates']
2024-01-20 10:30:06 - INFO - Отправляем 50 станций (стр. 1, лимит 50)
2024-01-20 10:30:06 - INFO - Ответ отправлен для запроса req_123
```

## Подключение к frontend

Убедитесь что в `src/services/websocket.ts` указан правильный URL:

```typescript
// Для WSS (рекомендуется)
export const wsService = new WebSocketService('wss://78.138.143.58:10009/ws');

// Или для WS (только разработка)
export const wsService = new WebSocketService('ws://78.138.143.58:10009/ws');
```

## Требования SSL

Для работы WSS требуются файлы сертификатов в корне проекта:
- `cert.pem` - SSL сертификат
- `cert.key` - приватный ключ

Сервер готов к работе! 🚀