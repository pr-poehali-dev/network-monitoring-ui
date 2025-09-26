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
        
        # Координаты для российских городов
        self.coordinates = {
            'Москва': [(55.7558 + random.uniform(-0.3, 0.3), 37.6176 + random.uniform(-0.5, 0.5)) for _ in range(20)],
            'Санкт-Петербург': [(59.9311 + random.uniform(-0.2, 0.2), 30.3609 + random.uniform(-0.3, 0.3)) for _ in range(15)],
            'Новосибирск': [(55.0084 + random.uniform(-0.2, 0.2), 82.9357 + random.uniform(-0.3, 0.3)) for _ in range(10)],
            'Екатеринбург': [(56.8431 + random.uniform(-0.2, 0.2), 60.6454 + random.uniform(-0.3, 0.3)) for _ in range(10)],
            'Казань': [(55.8304 + random.uniform(-0.2, 0.2), 49.0661 + random.uniform(-0.3, 0.3)) for _ in range(8)],
            'Нижний Новгород': [(56.2965 + random.uniform(-0.2, 0.2), 43.9361 + random.uniform(-0.3, 0.3)) for _ in range(7)]
        }
    
    def generate_stations(self, count: int = 100) -> List[Dict[str, Any]]:
        """Генерирует список станций"""
        stations = []
        
        for i in range(1, count + 1):
            city = random.choice(self.cities)
            coords = random.choice(self.coordinates[city])
            
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
        return stations
    
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
        
        # Логируем доступные ID для отладки
        available_ids = [s['id'] for s in self.stations_cache]
        logger.info(f"Доступные станции: {available_ids[:10]}...")  # Первые 10 для краткости
        
        station = next(
            (s for s in self.stations_cache if s['id'] == station_id),
            None
        )
        
        if not station:
            logger.error(f"Станция с ID {station_id} не найдена. Всего станций: {len(self.stations_cache)}")
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
                for station in random.sample(self.stations_cache, min(5, len(self.stations_cache))):
                    # Обновляем только динамические поля
                    station['status'] = random.choice(self.data_generator.statuses)
                    station['currentPower'] = random.randint(0, 150)
                    station['lastUpdate'] = datetime.now().isoformat()
                    
                    # Обновляем статусы коннекторов
                    if 'connectors' in station:
                        for connector in station['connectors']:
                            connector['status'] = random.choice(['available', 'charging', 'offline'])
                            
                logger.info(f"Обновлены динамические данные {len(self.stations_cache)} станций")
        
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