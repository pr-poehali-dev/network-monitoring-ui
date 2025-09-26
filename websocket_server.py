#!/usr/bin/env python3
"""
WebSocket сервер для тестирования frontend приложения
Возвращает заглушки данных станций зарядки
"""

import asyncio
import json
import logging
import random
import ssl
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

import websockets
from websockets.server import WebSocketServerProtocol

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MockDataGenerator:
    """Генератор заглушек данных"""
    
    def __init__(self):
        self.cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород']
        self.owners = ['РосЭнерго', 'ЭлектроСеть', 'ГreenCharge', 'PowerNet', 'EcoStation', 'ChargeMaster']
        self.apps = ['ChargeApp', 'EcoDriver', 'PowerGO', 'ElectricWay', 'GreenRoute']
        self.statuses = ['active', 'inactive', 'maintenance', 'error', 'offline']
        
        # Координаты для российских городов (фиксированные)
        self.coordinates = {
            'Москва': [
                (55.7558, 37.6176), (55.7505, 37.6175), (55.7600, 37.6200), (55.7520, 37.6150),
                (55.7580, 37.6190), (55.7540, 37.6170), (55.7560, 37.6180), (55.7570, 37.6160),
                (55.7590, 37.6140), (55.7510, 37.6195), (55.7485, 37.6185), (55.7545, 37.6205),
                (55.7565, 37.6125), (55.7575, 37.6215), (55.7555, 37.6135), (55.7535, 37.6155),
                (55.7525, 37.6165), (55.7515, 37.6145), (55.7595, 37.6185), (55.7585, 37.6195)
            ],
            'Санкт-Петербург': [
                (59.9311, 30.3609), (59.9350, 30.3650), (59.9280, 30.3580), (59.9320, 30.3620),
                (59.9340, 30.3640), (59.9300, 30.3600), (59.9360, 30.3660), (59.9270, 30.3570),
                (59.9330, 30.3630), (59.9290, 30.3590), (59.9310, 30.3610), (59.9325, 30.3615),
                (59.9335, 30.3625), (59.9315, 30.3605), (59.9345, 30.3645)
            ],
            'Новосибирск': [
                (55.0084, 82.9357), (55.0100, 82.9380), (55.0070, 82.9340), (55.0090, 82.9370),
                (55.0110, 82.9390), (55.0080, 82.9350), (55.0060, 82.9330), (55.0120, 82.9400),
                (55.0050, 82.9320), (55.0130, 82.9410)
            ],
            'Екатеринбург': [
                (56.8431, 60.6454), (56.8450, 60.6470), (56.8410, 60.6440), (56.8440, 60.6460),
                (56.8460, 60.6480), (56.8420, 60.6450), (56.8400, 60.6430), (56.8470, 60.6490),
                (56.8390, 60.6420), (56.8480, 60.6500)
            ],
            'Казань': [
                (55.8304, 49.0661), (55.8320, 49.0680), (55.8290, 49.0640), (55.8310, 49.0670),
                (55.8330, 49.0690), (55.8280, 49.0630), (55.8340, 49.0700), (55.8270, 49.0620)
            ],
            'Нижний Новгород': [
                (56.2965, 43.9361), (56.2980, 43.9380), (56.2950, 43.9340), (56.2970, 43.9370),
                (56.2990, 43.9390), (56.2940, 43.9330), (56.3000, 43.9400)
            ]
        }
    
    def generate_stations(self, count: int = 100) -> List[Dict[str, Any]]:
        """Генерирует список станций"""
        stations = []
        
        # Фиксируем seed для воспроизводимости данных
        random.seed(42)
        
        for i in range(1, count + 1):
            city = random.choice(self.cities)
            # Используем индекс станции для детерминированного выбора координат
            coords_list = self.coordinates[city]
            coords = coords_list[(i - 1) % len(coords_list)]
            
            station = {
                'id': f'station_{i:03d}',
                'name': f'ЭЗС-{i:03d} {random.choice(["Центральная", "Северная", "Южная", "Восточная", "Западная"])}',
                'city': city,
                'owner': random.choice(self.owners),
                'connectedApp': random.choice(self.apps),
                'status': random.choice(self.statuses),
                'totalEnergy': random.randint(10000, 500000),
                'currentPower': random.randint(0, 150),
                'lastUpdate': (datetime.now() - timedelta(minutes=random.randint(1, 1440))).isoformat(),
                'coordinates': {
                    'lat': coords[0],
                    'lng': coords[1]
                },
                # Дополнительные поля для статистики
                'totalSessions': random.randint(50, 1000),
                'successfulSessions': None,  # Вычисляется ниже
                'errorsCount': random.randint(0, 50),
                'utilization': random.randint(20, 95),
                
                # Дополнительные поля для карточки станции
                'address': f'г. {city}, ул. {random.choice(["Ленина", "Пушкина", "Гагарина", "Мира", "Победы"])}, д. {random.randint(1, 99)}',
                'description': f'Станция быстрой зарядки электромобилей в {city}. Оборудована современными зарядными устройствами.',
                'connectors': [
                    {
                        'type': 'CCS2',
                        'power': random.choice([50, 75, 100, 150]),
                        'status': random.choice(['available', 'charging', 'offline']),
                        'price': round(random.uniform(15.5, 25.0), 1)
                    },
                    {
                        'type': 'CHAdeMO', 
                        'power': random.choice([50, 75, 100]),
                        'status': random.choice(['available', 'charging', 'offline']),
                        'price': round(random.uniform(15.5, 25.0), 1)
                    }
                ],
                'workingHours': '24/7',
                'phone': f'+7 ({random.randint(900, 999)}) {random.randint(100, 999)}-{random.randint(10, 99)}-{random.randint(10, 99)}',
                'email': f'support@{random.choice(self.owners).lower().replace("ё", "e")}.ru',
                'rating': round(random.uniform(3.5, 5.0), 1),
                'reviewsCount': random.randint(5, 150),
                'amenities': random.sample(['WiFi', 'Кафе', 'Туалет', 'Парковка', 'Магазин', 'Отдых'], k=random.randint(2, 4)),
                'installationDate': (datetime.now() - timedelta(days=random.randint(30, 1095))).strftime('%Y-%m-%d'),
                'lastMaintenance': (datetime.now() - timedelta(days=random.randint(1, 90))).strftime('%Y-%m-%d'),
                'firmware': f'v{random.randint(1, 3)}.{random.randint(0, 9)}.{random.randint(0, 9)}',
                'serialNumber': f'SN{random.randint(100000, 999999)}',
                'manufacturer': random.choice(['ABB', 'Schneider Electric', 'EVBox', 'ChargePoint'])
            }
            
            # Успешные сессии не могут быть больше общих
            station['successfulSessions'] = random.randint(
                int(station['totalSessions'] * 0.8), 
                station['totalSessions']
            )
            
            stations.append(station)
        
        logger.info(f"Сгенерировано {len(stations)} станций")
        # Сбрасываем seed обратно для рандомных обновлений
        random.seed()
        return stations
    
    def get_available_station_ids(self) -> List[str]:
        """Возвращает список всех доступных ID станций"""
        return [f'station_{i:03d}' for i in range(1, 101)]
    
    def filter_fields(self, station: Dict[str, Any], fields: Optional[List[str]] = None) -> Dict[str, Any]:
        """Фильтрует поля станции согласно запросу"""
        if not fields:
            return station
        
        return {
            field: station.get(field)
            for field in fields
            if field in station
        }


class WebSocketServer:
    """WebSocket сервер"""
    
    def __init__(self, host: str = '0.0.0.0', port: int = 10009):
        self.host = host
        self.port = port
        self.data_generator = MockDataGenerator()
        # Генерируем станции один раз при инициализации
        self.stations_cache = self.data_generator.generate_stations(100)
        self.connected_clients = set()
        
        # Сохраняем исходные данные для восстановления при обновлениях
        self.base_stations_data = [station.copy() for station in self.stations_cache]
        
        # Логируем все созданные станции для отладки
        station_ids = [s['id'] for s in self.stations_cache]
        logger.info(f"Созданы станции: {station_ids[:10]}...{station_ids[-5:]}")
        logger.info(f"Всего станций в кеше: {len(self.stations_cache)}")
        
    def create_ssl_context(self) -> ssl.SSLContext:
        """Создает SSL контекст для WSS"""
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        try:
            ssl_context.load_cert_chain('cert.pem', 'cert.key')
            logger.info("SSL сертификаты загружены успешно")
        except FileNotFoundError as e:
            logger.error(f"SSL файлы не найдены: {e}")
            raise
        except Exception as e:
            logger.error(f"Ошибка загрузки SSL сертификатов: {e}")
            raise
        return ssl_context
    
    async def register_client(self, websocket: WebSocketServerProtocol):
        """Регистрация нового клиента"""
        self.connected_clients.add(websocket)
        logger.info(f"Клиент подключен. Всего клиентов: {len(self.connected_clients)}")
    
    async def unregister_client(self, websocket: WebSocketServerProtocol):
        """Удаление клиента"""
        self.connected_clients.discard(websocket)
        logger.info(f"Клиент отключен. Всего клиентов: {len(self.connected_clients)}")
    
    async def broadcast_updates(self, changed_station_ids: List[str]):
        """Отправка real-time обновлений всем подключенным клиентам"""
        if not self.connected_clients or not changed_station_ids:
            return
            
        # Собираем обновленные данные
        updates = []
        for station_id in changed_station_ids:
            station = next((s for s in self.stations_cache if s['id'] == station_id), None)
            if station:
                updates.append({
                    'stationId': station['id'],
                    'updates': {
                        'status': station['status'],
                        'currentPower': station['currentPower'],
                        'lastUpdate': station['lastUpdate'],
                        'connectors': station.get('connectors', [])
                    }
                })
        
        # Формируем сообщение обновления
        update_message = {
            'type': 'update',
            'action': 'stationUpdate',
            'data': {
                'updates': updates,
                'timestamp': datetime.now().isoformat()
            }
        }
        
        # Отправляем всем клиентам
        disconnected = set()
        for client in self.connected_clients:
            try:
                await client.send(json.dumps(update_message))
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)
            except Exception as e:
                logger.error(f"Ошибка отправки обновления: {e}")
                disconnected.add(client)
        
        # Удаляем отключенных клиентов
        for client in disconnected:
            self.connected_clients.discard(client)
        
        if updates:
            logger.info(f"Отправлено обновление {len(updates)} станций {len(self.connected_clients)} клиентам")
    
    def handle_get_stations(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обработка запроса списка станций"""
        fields = request_data.get('fields')
        filters = request_data.get('filters', {})
        pagination = request_data.get('pagination', {})
        
        # Применяем фильтры
        filtered_stations = self.stations_cache.copy()
        
        if filters.get('city'):
            filtered_stations = [
                s for s in filtered_stations 
                if filters['city'].lower() in s['city'].lower()
            ]
        
        if filters.get('owner'):
            filtered_stations = [
                s for s in filtered_stations 
                if filters['owner'].lower() in s['owner'].lower()
            ]
        
        if filters.get('status'):
            filtered_stations = [
                s for s in filtered_stations 
                if s['status'] == filters['status']
            ]
        
        # Применяем пагинацию
        page = pagination.get('page', 1)
        limit = pagination.get('limit', 50)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        
        paginated_stations = filtered_stations[start_idx:end_idx]
        
        # Фильтруем поля
        if fields:
            logger.info(f"Фильтрация полей: {fields}")
            paginated_stations = [
                self.data_generator.filter_fields(station, fields)
                for station in paginated_stations
            ]
        
        logger.info(f"Отправляем {len(paginated_stations)} станций (стр. {page}, лимит {limit})")
        
        return {
            'stations': paginated_stations,
            'total': len(filtered_stations),
            'page': page,
            'limit': limit
        }
    
    def handle_get_station_by_id(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обработка запроса конкретной станции"""
        station_id = request_data.get('stationId')
        logger.info(f"Поиск станции с ID: {station_id}")
        
        # Проверяем целостность кеша
        if len(self.stations_cache) != 100:
            logger.warning(f"Неожиданное количество станций в кеше: {len(self.stations_cache)}")
            
        # Логируем доступные ID для отладки
        available_ids = [s['id'] for s in self.stations_cache]
        logger.info(f"Всего станций в кеше: {len(available_ids)}")
        logger.info(f"Первые 10 станций: {available_ids[:10]}")
        logger.info(f"Последние 10 станций: {available_ids[-10:]}")
        
        # Проверяем, есть ли запрашиваемая станция
        if station_id in available_ids:
            logger.info(f"Станция {station_id} найдена в списке")
        else:
            logger.error(f"Станция {station_id} НЕ найдена в списке!")
        
        station = next(
            (s for s in self.stations_cache if s['id'] == station_id),
            None
        )
        
        if not station:
            logger.error(f"Станция с ID {station_id} не найдена. Всего станций: {len(self.stations_cache)}")
            logger.error(f"Ожидаемые станции: station_001 до station_100")
            raise ValueError(f"Станция с ID {station_id} не найдена")
        
        # Генерируем дополнительные данные для карточки
        station_detail = station.copy()
        
        # История зарядок за последние 7 дней
        charging_history = []
        for i in range(7):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            charging_history.append({
                'date': date,
                'sessions': random.randint(10, 50),
                'energy': random.randint(500, 2000),
                'revenue': random.randint(7500, 35000)
            })
        charging_history.reverse()
        
        # Статистика по часам (последние 24 часа)
        hourly_stats = []
        for hour in range(24):
            hourly_stats.append({
                'hour': hour,
                'sessions': random.randint(0, 8),
                'utilization': random.randint(0, 100)
            })
        
        # Последние сессии зарядки
        recent_sessions = []
        for i in range(10):
            start_time = datetime.now() - timedelta(hours=random.randint(1, 72))
            duration = random.randint(15, 180)  # минуты
            energy = random.randint(10, 80)  # кВт*ч
            
            recent_sessions.append({
                'id': f'session_{random.randint(1000, 9999)}',
                'startTime': start_time.isoformat(),
                'endTime': (start_time + timedelta(minutes=duration)).isoformat(),
                'duration': duration,
                'energy': energy,
                'cost': round(energy * random.uniform(15.5, 25.0), 2),
                'connector': random.choice(['CCS2', 'CHAdeMO']),
                'status': random.choice(['completed', 'stopped', 'error'])
            })
        
        # Добавляем дополнительные данные
        station_detail.update({
            'chargingHistory': charging_history,
            'hourlyStats': hourly_stats,
            'recentSessions': recent_sessions,
            'totalRevenue': sum(session['cost'] for session in recent_sessions),
            'averageSessionDuration': sum(session['duration'] for session in recent_sessions) // len(recent_sessions),
            'todayStats': {
                'sessions': random.randint(15, 45),
                'energy': random.randint(800, 1500),
                'revenue': random.randint(12000, 25000),
                'utilization': random.randint(40, 85)
            }
        })
        
        logger.info(f"Отправляем детальные данные станции {station_id}")
        return {'station': station_detail}
    
    def handle_get_monitoring_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обработка запроса данных мониторинга"""
        # Генерируем real-time метрики
        active_stations = [s for s in self.stations_cache if s['status'] in ['active', 'charging']]
        error_stations = [s for s in self.stations_cache if s['status'] == 'error']
        
        monitoring_data = {
            'summary': {
                'totalStations': len(self.stations_cache),
                'activeStations': len(active_stations),
                'errorStations': len(error_stations),
                'offlineStations': len([s for s in self.stations_cache if s['status'] == 'offline']),
                'totalPower': sum(s.get('currentPower', 0) for s in self.stations_cache),
                'averageUtilization': sum(s.get('utilization', 0) for s in self.stations_cache) // len(self.stations_cache)
            },
            'alerts': [
                {
                    'id': f'alert_{i}',
                    'stationId': station['id'],
                    'stationName': station['name'],
                    'type': random.choice(['error', 'warning', 'maintenance']),
                    'message': random.choice([
                        'Ошибка связи с коннектором',
                        'Превышение температуры',
                        'Низкое напряжение в сети',
                        'Требуется обслуживание'
                    ]),
                    'timestamp': datetime.now().isoformat(),
                    'priority': random.choice(['high', 'medium', 'low'])
                }
                for i, station in enumerate(error_stations[:5])  # Максимум 5 алертов
            ],
            'recentActivity': [
                {
                    'id': f'activity_{i}',
                    'type': random.choice(['session_start', 'session_end', 'error', 'maintenance']),
                    'stationId': random.choice(self.stations_cache)['id'],
                    'stationName': random.choice(self.stations_cache)['name'],
                    'timestamp': (datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat(),
                    'details': {
                        'energy': random.randint(10, 50),
                        'duration': random.randint(15, 120),
                        'connector': random.choice(['CCS2', 'CHAdeMO'])
                    }
                }
                for i in range(10)
            ]
        }
        
        logger.info("Отправляем данные мониторинга")
        return monitoring_data
    
    def handle_get_statistics_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обработка запроса статистических данных"""
        # Берем фильтры из запроса
        filters = request_data.get('filters', {})
        
        # Фильтруем станции
        filtered_stations = self.stations_cache
        if filters.get('city'):
            filtered_stations = [s for s in filtered_stations if filters['city'].lower() in s['city'].lower()]
        if filters.get('owner'):
            filtered_stations = [s for s in filtered_stations if filters['owner'].lower() in s['owner'].lower()]
        
        # Дополняем станции статистическими данными
        stats_stations = []
        for station in filtered_stations:
            stats_station = station.copy()
            stats_station.update({
                'avgSessionDuration': random.randint(30, 90),
                'successRate': random.randint(85, 99),
                'peakHours': [random.randint(8, 20) for _ in range(3)],
                'weeklyTrend': random.choice(['up', 'down', 'stable']),
                'revenue': random.randint(50000, 500000)
            })
            stats_stations.append(stats_station)
        
        return {
            'stations': stats_stations,
            'summary': {
                'totalStations': len(stats_stations),
                'totalEnergy': sum(s['totalEnergy'] for s in stats_stations),
                'totalSessions': sum(s['totalSessions'] for s in stats_stations),
                'averageUtilization': sum(s['utilization'] for s in stats_stations) // max(len(stats_stations), 1)
            }
        }
    
    def handle_get_map_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обработка запроса данных для карты"""
        # Возвращаем только необходимые поля для карты
        map_stations = []
        for station in self.stations_cache:
            map_stations.append({
                'id': station['id'],
                'name': station['name'],
                'coordinates': station['coordinates'],
                'status': station['status'],
                'connectors': station.get('connectors', []),
                'city': station['city'],
                'address': station.get('address', '')
            })
        
        return {
            'stations': map_stations,
            'clusters': self._calculate_clusters(map_stations)
        }
    
    def _calculate_clusters(self, stations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Вычисляет кластеры станций для карты"""
        # Простая группировка по городам
        clusters = {}
        for station in stations:
            city = station['city']
            if city not in clusters:
                clusters[city] = {
                    'city': city,
                    'count': 0,
                    'center': station['coordinates']
                }
            clusters[city]['count'] += 1
        
        return list(clusters.values())
    
    def handle_get_global_stats(self) -> Dict[str, Any]:
        """Обработка запроса глобальной статистики"""
        total_energy = sum(s['totalEnergy'] for s in self.stations_cache)
        total_sessions = sum(s['totalSessions'] for s in self.stations_cache)
        active_count = len([s for s in self.stations_cache if s['status'] in ['active', 'charging']])
        
        return {
            'totalStations': len(self.stations_cache),
            'activeStations': active_count,
            'totalEnergy': total_energy,
            'totalSessions': total_sessions,
            'averageUtilization': sum(s['utilization'] for s in self.stations_cache) // len(self.stations_cache),
            'totalRevenue': total_energy * random.uniform(15.0, 25.0),
            'carbonSaved': total_energy * 0.5,  # кг CO2
            'vehiclesCharged': total_sessions,
            'trends': {
                'energy': random.choice(['up', 'down', 'stable']),
                'sessions': random.choice(['up', 'down', 'stable']),
                'revenue': random.choice(['up', 'down', 'stable'])
            }
        }
    
    def handle_get_chart_data(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обработка запроса данных для графиков"""
        chart_type = request_data.get('chartType', 'energy')
        period = request_data.get('period', 'week')
        
        if chart_type == 'energy':
            # График потребления энергии
            data_points = []
            for i in range(7 if period == 'week' else 30):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
                data_points.append({
                    'date': date,
                    'value': random.randint(5000, 15000),
                    'sessions': random.randint(100, 300)
                })
            data_points.reverse()
            
        elif chart_type == 'utilization':
            # График загрузки по часам
            data_points = []
            for hour in range(24):
                data_points.append({
                    'hour': hour,
                    'value': random.randint(20, 95),
                    'stations': random.randint(10, 50)
                })
                
        elif chart_type == 'cities':
            # Распределение по городам
            cities = list(set(s['city'] for s in self.stations_cache))
            data_points = []
            for city in cities:
                city_stations = [s for s in self.stations_cache if s['city'] == city]
                data_points.append({
                    'city': city,
                    'stations': len(city_stations),
                    'energy': sum(s['totalEnergy'] for s in city_stations),
                    'sessions': sum(s['totalSessions'] for s in city_stations)
                })
        else:
            data_points = []
        
        return {
            'chartType': chart_type,
            'period': period,
            'data': data_points,
            'summary': {
                'total': sum(p.get('value', 0) for p in data_points),
                'average': sum(p.get('value', 0) for p in data_points) // max(len(data_points), 1),
                'trend': random.choice(['up', 'down', 'stable'])
            }
        }
    
    async def handle_message(self, websocket: WebSocketServerProtocol, message: str):
        """Обработка входящего сообщения"""
        try:
            data = json.loads(message)
            logger.info(f"Получено сообщение: {data.get('action')} (ID: {data.get('requestId')})")
            
            if data.get('type') != 'request':
                raise ValueError("Неподдерживаемый тип сообщения")
            
            action = data.get('action')
            request_data = data.get('data', {})
            request_id = data.get('requestId')
            
            # Обработка разных типов запросов
            if action == 'getStations':
                response_data = self.handle_get_stations(request_data)
            elif action == 'getStationById':
                response_data = self.handle_get_station_by_id(request_data)
            elif action == 'getStationDetail':
                # Подробная информация о станции для карточки
                response_data = self.handle_get_station_by_id(request_data)
            elif action == 'getStationStats':
                # Для статистики возвращаем все станции
                response_data = self.handle_get_stations(request_data)
            elif action == 'getStationHistory':
                # История работы станции
                response_data = self.handle_get_station_by_id(request_data)
            elif action == 'getStationSessions':
                # Сессии зарядки станции
                response_data = self.handle_get_station_by_id(request_data)
            elif action == 'getAvailableStations':
                # Список доступных ID станций
                available_ids = self.data_generator.get_available_station_ids()
                response_data = {
                    'availableStationIds': available_ids,
                    'totalStations': len(self.stations_cache)
                }
            elif action == 'getMonitoringData':
                # Данные для мониторинга с real-time обновлениями
                response_data = self.handle_get_monitoring_data(request_data)
            elif action == 'getStatisticsData':
                # Данные для статистики с графиками
                response_data = self.handle_get_statistics_data(request_data)
            elif action == 'getMapData':
                # Данные для карты
                response_data = self.handle_get_map_data(request_data)
            elif action == 'getGlobalStats':
                # Глобальная статистика
                response_data = self.handle_get_global_stats()
            elif action == 'getChartData':
                # Данные для графиков
                response_data = self.handle_get_chart_data(request_data)
            else:
                raise ValueError(f"Неподдерживаемое действие: {action}")
            
            # Формируем ответ
            response = {
                'type': 'response',
                'action': action,
                'data': response_data,
                'requestId': request_id
            }
            
            await websocket.send(json.dumps(response))
            logger.info(f"Ответ отправлен для запроса {request_id}")
            
        except json.JSONDecodeError:
            error_response = {
                'type': 'error',
                'error': {
                    'code': 'INVALID_JSON',
                    'message': 'Некорректный JSON'
                }
            }
            await websocket.send(json.dumps(error_response))
            
        except Exception as e:
            logger.error(f"Ошибка обработки сообщения: {e}")
            error_response = {
                'type': 'error',
                'error': {
                    'code': 'INTERNAL_ERROR',
                    'message': str(e)
                },
                'requestId': data.get('requestId') if 'data' in locals() else None
            }
            await websocket.send(json.dumps(error_response))
    
    async def handle_client(self, websocket: WebSocketServerProtocol):
        """Обработка подключения клиента"""
        await self.register_client(websocket)
        
        try:
            async for message in websocket:
                await self.handle_message(websocket, message)
        except websockets.exceptions.ConnectionClosed:
            pass
        except Exception as e:
            logger.error(f"Ошибка обработки клиента: {e}")
        finally:
            await self.unregister_client(websocket)
    
    async def start_server(self, use_ssl: bool = True):
        """Запуск сервера"""
        protocol = "wss" if use_ssl else "ws"
        logger.info(f"Запуск {protocol.upper()} сервера на {self.host}:{self.port}")
        
        # Обновляем только изменяемые поля каждые 30 секунд
        async def update_data():
            while True:
                await asyncio.sleep(30)
                # Обновляем только статус, мощность и время обновления
                # НЕ удаляем и НЕ добавляем станции
                changed_stations = []
                for station in random.sample(self.stations_cache, min(5, len(self.stations_cache))):
                    old_status = station['status']
                    # Обновляем только динамические поля
                    station['status'] = random.choice(self.data_generator.statuses)
                    station['currentPower'] = random.randint(0, 150)
                    station['lastUpdate'] = datetime.now().isoformat()
                    
                    # Обновляем статусы коннекторов
                    if 'connectors' in station:
                        for connector in station['connectors']:
                            connector['status'] = random.choice(['available', 'charging', 'offline'])
                    
                    # Запоминаем изменения
                    if old_status != station['status']:
                        changed_stations.append(station['id'])
                            
                logger.info(f"Обновлены динамические данные {len(self.stations_cache)} станций")
                
                # Отправляем real-time обновления всем клиентам
                await self.broadcast_updates(changed_stations)
        
        # Запускаем задачу обновления данных
        asyncio.create_task(update_data())
        
        # Настройки сервера
        server_kwargs = {
            'ping_interval': 20,
            'ping_timeout': 10,
            'max_size': 2**20,  # 1MB max message size
            'max_queue': 2**5,  # 32 messages max queue
        }
        
        # Добавляем SSL если требуется
        if use_ssl:
            ssl_context = self.create_ssl_context()
            server_kwargs['ssl'] = ssl_context
        
        # Запускаем WebSocket сервер
        server = await websockets.serve(
            self.handle_client,
            self.host,
            self.port,
            **server_kwargs
        )
        
        logger.info(f"Сервер запущен на {protocol}://{self.host}:{self.port}/ws")
        logger.info(f"Доступных станций: {len(self.stations_cache)}")
        logger.info("Нажмите Ctrl+C для остановки")
        
        return server


async def main():
    """Главная функция"""
    server_instance = WebSocketServer()
    
    # По умолчанию используем SSL (WSS)
    server = await server_instance.start_server(use_ssl=True)
    
    try:
        await server.wait_closed()
    except KeyboardInterrupt:
        logger.info("Получен сигнал остановки")
    finally:
        server.close()
        await server.wait_closed()
        logger.info("Сервер остановлен")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Сервер остановлен пользователем")