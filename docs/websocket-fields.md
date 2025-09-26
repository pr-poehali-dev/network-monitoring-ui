# Оптимизированные WebSocket запросы

## Структура запроса с полями

```json
{
  "type": "request",
  "action": "getStations",
  "data": {
    "fields": ["id", "name", "status", "coordinates"],
    "filters": {
      "city": "Москва",
      "status": "active"
    },
    "pagination": {
      "page": 1,
      "limit": 50
    }
  },
  "requestId": "req_1234567890_1"
}
```

## Предустановленные наборы полей

### 🗺️ Для карты (loadStationsForMap)
```json
["id", "name", "city", "status", "coordinates", "owner"]
```
- Минимальный набор для отображения маркеров
- ~70% экономии трафика

### 📋 Для списка (loadStationsForList)  
```json
["id", "name", "city", "owner", "status", "totalEnergy", "currentPower", "connectedApp", "lastUpdate"]
```
- Полная информация для таблицы
- Исключены только координаты

### 📊 Для статистики (loadStationsForStats)
```json
["id", "city", "owner", "connectedApp", "totalEnergy"]
```
- Только данные для аналитики
- ~80% экономии трафика

## Пример реализации на backend

```python
def filter_fields(station_data, requested_fields):
    if not requested_fields:
        return station_data  # Возвращаем все поля
    
    return {
        field: station_data[field] 
        for field in requested_fields 
        if field in station_data
    }

# Использование:
filtered_stations = [
    filter_fields(station, request.get('fields'))
    for station in all_stations
]
```

## Логи в консоли

- `🗺️ Loading stations for map with minimal fields...`
- `📋 Loading stations for list with full fields...`  
- `📊 Loading stations for statistics...`