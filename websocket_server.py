#!/usr/bin/env python3
"""
WebSocket сервер для мониторинга станций зарядки
Поддержка нового протокола обмена данными со станциями
"""

import asyncio
import json
import logging
import random
import ssl
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

import websockets
from websockets.server import WebSocketServerProtocol

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class ChargingSession:
    """Активная сессия зарядки"""
    transaction_id: int
    connector_id: int
    start_ts: int
    start_energy_wh: int
    last_ts: int = 0
    last_energy_wh: int = 0


@dataclass
class StationData:
    """Данные станции"""
    serial: str
    id: int
    name: str
    city: str
    address: str
    lat: float
    lon: float
    station_status: str = 'offline'
    energy_meter_status: str = 'unknown'
    connectors: List[Dict[str, Any]] = field(default_factory=list)
    energy_meter: Dict[str, Any] = field(default_factory=dict)
    
    # Дополнительные поля для соответствия протоколу
    ip_address: str = ''
    ssh_port: int = 22
    region: str = ''
    created_at: str = ''
    owner: str = ''
    error_info: str = ''
    
    # Статистика по транзакциям
    total_energy_kwh: float = 0.0
    total_sessions: int = 0
    successful_sessions: int = 0


class MockDataGenerator:
    """Генератор заглушек данных"""
    
    def __init__(self):
        self.cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань']
        self.coordinates = {
            'Москва': [(55.7558, 37.6176), (55.7505, 37.6175), (55.7600, 37.6200)],
            'Санкт-Петербург': [(59.9311, 30.3609), (59.9350, 30.3650)],
            'Новосибирск': [(55.0084, 82.9357), (55.0100, 82.9380)],
            'Екатеринбург': [(56.8431, 60.6454), (56.8450, 60.6470)],
            'Казань': [(55.8304, 49.0661), (55.8320, 49.0680)]
        }
    
    def generate_stations(self, count: int = 10) -> List[StationData]:
        """Генерирует список станций"""
        stations = []
        random.seed(42)
        
        for i in range(1, count + 1):
            city = random.choice(self.cities)
            coords = self.coordinates[city][i % len(self.coordinates[city])]
            created = datetime.now() - timedelta(days=random.randint(30, 365))
            
            station = StationData(
                serial=f'{i:05d}',
                id=i,
                name=f'ЭЗС-{i:03d}',
                city=city,
                address=f'г. {city}, ул. Ленина, д. {i}',
                lat=coords[0],
                lon=coords[1],
                station_status='connected',
                energy_meter_status='ok',
                ip_address=f'192.168.{random.randint(0, 255)}.{random.randint(1, 254)}',
                ssh_port=22,
                region=city,
                created_at=created.strftime('%Y-%m-%d %H:%M:%S'),
                owner='',
                error_info='',
                connectors=[
                    {'id': 1, 'status': 0, 'type': 2, 'delivered_power_w': 0, 'battery_soc': 0},
                    {'id': 2, 'status': 0, 'type': 1, 'delivered_power_w': 0, 'battery_soc': 0}
                ],
                total_sessions=random.randint(50, 200),
                successful_sessions=random.randint(40, 180),
                total_energy_kwh=round(random.uniform(500, 5000), 2)
            )
            stations.append(station)
        
        random.seed()
        logger.info(f"Сгенерировано {len(stations)} станций")
        return stations


class WebSocketServer:
    """WebSocket сервер с поддержкой нового протокола"""
    
    def __init__(self, host: str = '0.0.0.0', port_frontend: int = 10008, port_stations: int = 10009):
        self.host = host
        self.port_frontend = port_frontend
        self.port_stations = port_stations
        
        # Генератор данных
        self.data_generator = MockDataGenerator()
        
        # Хранилище станций: Dict[serial, StationData]
        self.stations: Dict[str, StationData] = {}
        for station in self.data_generator.generate_stations(10):
            self.stations[station.serial] = station
        
        # Активные сессии зарядки: Dict[(serial, transaction_id), ChargingSession]
        self.active_sessions: Dict[tuple, ChargingSession] = {}
        
        # История транзакций для статистики: List[Dict]
        self.transactions: List[Dict[str, Any]] = []
        self._generate_mock_transactions()
        
        # Подключенные клиенты
        self.frontend_clients = set()
        self.station_clients: Dict[str, WebSocketServerProtocol] = {}  # serial -> websocket
        
        logger.info(f"Инициализировано {len(self.stations)} станций")
    
    def _generate_mock_transactions(self):
        """Генерирует фейковые транзакции для тестирования"""
        reasons = ['EVDisconnected', 'Remote', 'Local', 'PowerLoss']
        now = datetime.now()
        
        for station in self.stations.values():
            for i in range(random.randint(5, 15)):
                days_ago = random.uniform(0, 30)
                timestamp = now - timedelta(days=days_ago)
                
                connector_id = random.choice([1, 2])
                energy_kwh = random.uniform(2, 80)
                duration_sec = int(random.uniform(600, 14400))
                reason = random.choice(reasons)
                is_successful = energy_kwh > 2.0 and reason != 'Local'
                
                meter_start = random.uniform(10000, 50000)
                meter_stop = meter_start + (energy_kwh * 1000)
                
                transaction = {
                    'station_serial': station.serial,
                    'transaction_id': 1000 + len(self.transactions),
                    'connector_id': connector_id,
                    'start_ts': int(timestamp.timestamp()),
                    'duration_sec': duration_sec,
                    'energy_kwh': round(energy_kwh, 3),
                    'stop_reason': reason,
                    'is_successful': is_successful,
                    'timestamp': timestamp.isoformat() + 'Z',
                    'meter_start_wh': round(meter_start, 1),
                    'meter_stop_wh': round(meter_stop, 1)
                }
                self.transactions.append(transaction)
        
        logger.info(f"Сгенерировано {len(self.transactions)} тестовых транзакций")
    
    def create_ssl_context(self) -> ssl.SSLContext:
        """Создает SSL контекст для WSS"""
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        try:
            ssl_context.load_cert_chain('cert.pem', 'cert.key')
            logger.info("SSL сертификаты загружены")
        except FileNotFoundError as e:
            logger.error(f"SSL файлы не найдены: {e}")
            raise
        return ssl_context
    
    # ===== Обработка сообщений от станций (port 10009) =====
    
    async def handle_connector_metrics(self, serial: str, data: Dict[str, Any]):
        """Обработка телеметрии коннектора"""
        if serial not in self.stations:
            logger.warning(f"Станция {serial} не найдена")
            return
        
        station = self.stations[serial]
        connector_id = data.get('connector_id')
        
        if connector_id is None:
            logger.warning(f"Нет connector_id в connector_metrics от {serial}")
            return
        
        # Обновляем данные коннектора
        connector = next((c for c in station.connectors if c['id'] == connector_id), None)
        if connector:
            connector.update({
                'status': data.get('state', connector['status']),
                'type': data.get('connector_type', connector['type']),
                'delivered_power_w': data.get('delivered_power_w', 0),
                'delivered_voltage': data.get('delivered_voltage', 0),
                'delivered_current': data.get('delivered_current', 0),
                'battery_soc': data.get('battery_soc', 0),
                'consumed_energy_wh': data.get('consumed_energy_wh', 0),
                'total_energy_wh': data.get('total_energy_wh', 0)
            })
        else:
            # Добавляем новый коннектор
            station.connectors.append({
                'id': connector_id,
                'status': data.get('state', 0),
                'type': data.get('connector_type', 0),
                'delivered_power_w': data.get('delivered_power_w', 0),
                'delivered_voltage': data.get('delivered_voltage', 0),
                'delivered_current': data.get('delivered_current', 0),
                'battery_soc': data.get('battery_soc', 0),
                'consumed_energy_wh': data.get('consumed_energy_wh', 0),
                'total_energy_wh': data.get('total_energy_wh', 0)
            })
        
        # Обновляем статус станции на "connected"
        station.station_status = 'connected'
        
        logger.debug(f"Обновлена телеметрия коннектора {connector_id} станции {serial}")
        
        # Рассылаем обновление фронтенду
        await self.broadcast_station_update(serial)
    
    async def handle_energy_meter_status(self, serial: str, data: Dict[str, Any]):
        """Обработка статуса счётчика"""
        if serial not in self.stations:
            return
        
        station = self.stations[serial]
        station.energy_meter_status = data.get('status', 'unknown')
        logger.debug(f"Статус счётчика станции {serial}: {station.energy_meter_status}")
    
    async def handle_energy_meter_metrics(self, serial: str, data: Dict[str, Any]):
        """Обработка телеметрии счётчика"""
        if serial not in self.stations:
            return
        
        station = self.stations[serial]
        station.energy_meter = {
            'voltageL1': data.get('voltageL1', 0),
            'voltageL2': data.get('voltageL2', 0),
            'voltageL3': data.get('voltageL3', 0),
            'currentL1': data.get('currentL1', 0),
            'currentL2': data.get('currentL2', 0),
            'currentL3': data.get('currentL3', 0),
            'power_total': data.get('power_total', 0),
            'energy_active': data.get('energy_active', 0)
        }
        logger.debug(f"Обновлена телеметрия счётчика станции {serial}")
    
    async def handle_ocpp_meter_values(self, serial: str, event: Dict[str, Any]):
        """Обработка MeterValues (начало/обновление сессии)"""
        transaction_id = event.get('transaction_id')
        conn_id = event.get('conn_id')
        meter = event.get('meter', {})
        energy = meter.get('energy')
        
        if not transaction_id or energy is None:
            logger.warning(f"Некорректный meter_values от {serial}: нет transaction_id или energy")
            return
        
        key = (serial, transaction_id)
        ts = int(time.time())
        
        if key not in self.active_sessions:
            # Новая сессия
            session = ChargingSession(
                transaction_id=transaction_id,
                connector_id=conn_id,
                start_ts=ts,
                start_energy_wh=energy,
                last_ts=ts,
                last_energy_wh=energy
            )
            self.active_sessions[key] = session
            logger.info(f"Начата сессия {transaction_id} на станции {serial}, коннектор {conn_id}")
        else:
            # Обновление сессии
            session = self.active_sessions[key]
            session.last_ts = ts
            session.last_energy_wh = energy
            logger.debug(f"Обновлена сессия {transaction_id} на станции {serial}: {energy} Вт⋅ч")
    
    async def handle_ocpp_stop_transaction(self, serial: str, event: Dict[str, Any]):
        """Обработка StopTransaction (завершение сессии)"""
        transaction_id = event.get('transaction_id')
        meter_stop = event.get('meter_stop')
        reason = event.get('reason', 'Unknown')
        
        if not transaction_id:
            logger.warning(f"Некорректный stop_transaction от {serial}: нет transaction_id")
            return
        
        key = (serial, transaction_id)
        
        if key not in self.active_sessions:
            # Сессия не найдена - создаём упрощённую транзакцию
            if meter_stop:
                self._save_transaction(serial, None, meter_stop, 0, reason, transaction_id)
                logger.warning(f"Сессия {transaction_id} не найдена, создана упрощённая транзакция")
            return
        
        # Завершаем сессию
        session = self.active_sessions.pop(key)
        final_energy = meter_stop if meter_stop else session.last_energy_wh
        duration_sec = session.last_ts - session.start_ts
        
        self._save_transaction(serial, session, final_energy, duration_sec, reason, transaction_id)
        logger.info(f"Завершена сессия {transaction_id} на станции {serial}")
        
        # Рассылаем обновление статистики фронтенду
        await self.broadcast_station_update(serial)
    
    def _save_transaction(self, serial: str, session: Optional[ChargingSession], 
                         final_energy: int, duration_sec: int, reason: str, transaction_id: int):
        """Сохраняет транзакцию в историю и обновляет статистику станции"""
        if serial not in self.stations:
            return
        
        station = self.stations[serial]
        
        # Вычисляем энергию сессии
        if session:
            energy_wh = final_energy - session.start_energy_wh
            connector_id = session.connector_id
        else:
            energy_wh = final_energy
            connector_id = 0
        
        energy_kwh = energy_wh / 1000.0
        
        # Определяем успешность: >2 кВт⋅ч и причина не "Local"
        is_successful = energy_kwh > 2.0 and reason != 'Local'
        
        # Сохраняем транзакцию
        meter_start = session.start_energy_wh if session else 0
        meter_stop = final_energy
        
        transaction = {
            'station_serial': serial,
            'transaction_id': transaction_id,
            'connector_id': connector_id,
            'start_ts': session.start_ts if session else int(time.time()),
            'duration_sec': duration_sec,
            'energy_kwh': round(energy_kwh, 3),
            'stop_reason': reason,
            'is_successful': is_successful,
            'timestamp': datetime.now().isoformat() + 'Z',
            'meter_start_wh': meter_start,
            'meter_stop_wh': meter_stop
        }
        self.transactions.append(transaction)
        
        # Обновляем статистику станции
        station.total_sessions += 1
        station.total_energy_kwh += energy_kwh
        if is_successful:
            station.successful_sessions += 1
        
        logger.info(f"Транзакция сохранена: {energy_kwh:.2f} кВт⋅ч, успешная={is_successful}")
    
    async def handle_station_message(self, websocket: WebSocketServerProtocol, serial: str):
        """Обработка сообщений от станции"""
        self.station_clients[serial] = websocket
        logger.info(f"Станция {serial} подключена")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    msg_type = data.get('type')
                    
                    if msg_type == 'connector_metrics':
                        await self.handle_connector_metrics(serial, data)
                    elif msg_type == 'energy_meter_status':
                        await self.handle_energy_meter_status(serial, data)
                    elif msg_type == 'energy_meter_metrics':
                        await self.handle_energy_meter_metrics(serial, data)
                    elif msg_type == 'ocpp_event':
                        event = data.get('event', {})
                        event_type = event.get('event')
                        if event_type == 'meter_values':
                            await self.handle_ocpp_meter_values(serial, event)
                        elif event_type == 'stop_transaction':
                            await self.handle_ocpp_stop_transaction(serial, event)
                    else:
                        logger.warning(f"Неизвестный тип сообщения от станции: {msg_type}")
                
                except json.JSONDecodeError:
                    logger.error(f"Некорректный JSON от станции {serial}")
                except Exception as e:
                    logger.error(f"Ошибка обработки сообщения от станции {serial}: {e}")
        
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.station_clients.pop(serial, None)
            # Обновляем статус станции на offline
            if serial in self.stations:
                self.stations[serial].station_status = 'offline'
            logger.info(f"Станция {serial} отключена")
    
    # ===== Обработка запросов от фронтенда (port 10008) =====
    
    def get_all_stations(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Возвращает список всех станций с поддержкой фильтрации"""
        result = []
        for station in self.stations.values():
            station_dict = {
                'id': station.id,
                'station_id': station.serial,
                'name': station.name,
                'city': station.city,
                'region': station.region,
                'address': station.address,
                'lat': station.lat,
                'lon': station.lon,
                'ip_address': station.ip_address,
                'ssh_port': station.ssh_port,
                'created_at': station.created_at,
                'owner': station.owner,
                'station_status': station.station_status,
                'error_info': station.error_info,
                'connectors': station.connectors
            }
            
            # Применяем фильтры (если есть)
            if filters:
                matches = True
                for key, value in filters.items():
                    if station_dict.get(key) != value:
                        matches = False
                        break
                if not matches:
                    continue
            
            result.append(station_dict)
        return result
    
    def get_station_by_id(self, station_id: int) -> Optional[Dict[str, Any]]:
        """Возвращает станцию по внутреннему ID"""
        station = next((s for s in self.stations.values() if s.id == station_id), None)
        if not station:
            return None
        
        return {
            'id': station.id,
            'station_id': station.serial,
            'name': station.name,
            'city': station.city,
            'region': station.region,
            'address': station.address,
            'lat': station.lat,
            'lon': station.lon,
            'ip_address': station.ip_address,
            'ssh_port': station.ssh_port,
            'created_at': station.created_at,
            'owner': station.owner,
            'station_status': station.station_status,
            'error_info': station.error_info,
            'connectors': station.connectors
        }
    
    def get_station_by_serial(self, serial: str) -> Optional[Dict[str, Any]]:
        """Возвращает станцию по серийному номеру"""
        station = self.stations.get(serial)
        if not station:
            return None
        
        return {
            'id': station.id,
            'station_id': station.serial,
            'name': station.name,
            'city': station.city,
            'region': station.region,
            'address': station.address,
            'lat': station.lat,
            'lon': station.lon,
            'ip_address': station.ip_address,
            'ssh_port': station.ssh_port,
            'created_at': station.created_at,
            'owner': station.owner,
            'station_status': station.station_status,
            'error_info': station.error_info,
            'connectors': station.connectors
        }
    
    def get_station_stats(self, station_id: int) -> Optional[Dict[str, Any]]:
        """Возвращает статистику станции и коннекторов"""
        station = next((s for s in self.stations.values() if s.id == station_id), None)
        if not station:
            return None
        
        # Агрегируем статистику по коннекторам из транзакций
        connector_stats = {}
        for transaction in self.transactions:
            if transaction['station_serial'] != station.serial:
                continue
            
            conn_id = str(transaction['connector_id'])
            if conn_id not in connector_stats:
                connector_stats[conn_id] = {
                    'connectorId': conn_id,
                    'totalEnergyKwh': 0.0,
                    'totalSessions': 0,
                    'successfulSessions': 0
                }
            
            connector_stats[conn_id]['totalEnergyKwh'] += transaction['energy_kwh']
            connector_stats[conn_id]['totalSessions'] += 1
            if transaction['is_successful']:
                connector_stats[conn_id]['successfulSessions'] += 1
        
        return {
            'stationId': station.serial,
            'totalEnergyKwh': round(station.total_energy_kwh, 2),
            'totalSessions': station.total_sessions,
            'successfulSessions': station.successful_sessions,
            'connectors': list(connector_stats.values())
        }
    
    def get_station_transactions(
        self, 
        serial_number: str, 
        from_time: Optional[str] = None, 
        to_time: Optional[str] = None, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Возвращает список транзакций станции за период"""
        from datetime import datetime, timedelta
        
        now = datetime.now()
        
        if from_time and to_time:
            try:
                start = datetime.fromisoformat(from_time.replace('Z', '+00:00'))
                end = datetime.fromisoformat(to_time.replace('Z', '+00:00'))
            except ValueError:
                start = now - timedelta(hours=24)
                end = now
        elif from_time:
            try:
                start = datetime.fromisoformat(from_time.replace('Z', '+00:00'))
                end = now
            except ValueError:
                start = now - timedelta(hours=24)
                end = now
        elif to_time:
            try:
                end = datetime.fromisoformat(to_time.replace('Z', '+00:00'))
                start = end - timedelta(hours=24)
            except ValueError:
                start = now - timedelta(hours=24)
                end = now
        else:
            start = now - timedelta(hours=24)
            end = now
        
        filtered_transactions = [
            t for t in self.transactions
            if t['station_serial'] == serial_number
            and start <= datetime.fromisoformat(t['timestamp'].replace('Z', '+00:00')) <= end
        ]
        
        filtered_transactions.sort(key=lambda x: x['timestamp'], reverse=True)
        
        result = []
        for t in filtered_transactions[:limit]:
            result.append({
                'time': t['timestamp'],
                'connectorId': t['connector_id'],
                'transactionId': t['transaction_id'],
                'energyWh': round(t['energy_kwh'] * 1000, 1),
                'energyKwh': round(t['energy_kwh'], 2),
                'durationSec': t['duration_sec'],
                'success': t['is_successful'],
                'reason': t.get('stop_reason', 'Unknown'),
                'meterStartWh': round(t.get('meter_start_wh', 0), 1),
                'meterStopWh': round(t.get('meter_stop_wh', 0), 1)
            })
        
        return result
    
    async def handle_frontend_request(self, websocket: WebSocketServerProtocol, data: Dict[str, Any]):
        """Обработка запроса от фронтенда"""
        action = data.get('action')
        request_id = data.get('requestId')
        
        try:
            if action == 'getAllStations':
                filters = data.get('filters', {})
                stations = self.get_all_stations(filters)
                response = {
                    'type': 'response',
                    'action': action,
                    'requestId': request_id,
                    'data': {'stations': stations}
                }
            
            elif action == 'getStationById':
                station_id = data.get('stationId')
                if not station_id:
                    raise ValueError("stationId is required")
                station = self.get_station_by_id(station_id)
                if not station:
                    raise ValueError(f"Station with id '{station_id}' not found")
                response = {
                    'type': 'response',
                    'action': action,
                    'requestId': request_id,
                    'data': {'station': station}
                }
            
            elif action == 'getStationBySerialNumber':
                serial = data.get('serialNumber')
                if not serial:
                    raise ValueError("serialNumber is required")
                station = self.get_station_by_serial(serial)
                if not station:
                    raise ValueError(f"Station with serial '{serial}' not found")
                response = {
                    'type': 'response',
                    'action': action,
                    'requestId': request_id,
                    'data': {'station': station}
                }
            
            elif action == 'getStationStats':
                station_id = data.get('stationId')
                if not station_id:
                    raise ValueError("stationId is required")
                if not isinstance(station_id, int):
                    raise ValueError("stationId must be an integer")
                
                stats = self.get_station_stats(station_id)
                if not stats:
                    raise ValueError(f"Station with id '{station_id}' not found")
                
                response = {
                    'type': 'response',
                    'action': action,
                    'requestId': request_id,
                    'data': stats
                }
            
            elif action == 'subscribeUpdates':
                response = {
                    'type': 'response',
                    'action': action,
                    'requestId': request_id,
                    'data': {'subscribed': True}
                }
            
            elif action == 'unsubscribeUpdates':
                response = {
                    'type': 'response',
                    'action': action,
                    'requestId': request_id,
                    'data': {'unsubscribed': True}
                }
            
            elif action == 'getStationTransactions':
                serial_number = data.get('serialNumber')
                if not serial_number:
                    raise ValueError("serialNumber is required")
                
                from_time = data.get('from')
                to_time = data.get('to')
                limit = data.get('limit', 100)
                
                transactions = self.get_station_transactions(serial_number, from_time, to_time, limit)
                response = {
                    'type': 'response',
                    'action': action,
                    'requestId': request_id,
                    'data': {'transactions': transactions}
                }
            
            else:
                # Неизвестный action
                error_response = {
                    'type': 'error',
                    'action': action,
                    'requestId': request_id,
                    'code': 'INVALID_ACTION',
                    'message': 'Unknown action'
                }
                await websocket.send(json.dumps(error_response))
                return
            
            await websocket.send(json.dumps(response))
        
        except ValueError as e:
            # Определяем код ошибки
            error_msg = str(e)
            if 'required' in error_msg or 'must be' in error_msg:
                error_code = 'INVALID_REQUEST'
            elif 'not found' in error_msg.lower():
                error_code = 'NOT_FOUND'
            else:
                error_code = 'INVALID_REQUEST'
            
            error_response = {
                'type': 'error',
                'action': action,
                'requestId': request_id,
                'code': error_code,
                'message': error_msg
            }
            await websocket.send(json.dumps(error_response))
        except Exception as e:
            logger.error(f"Ошибка обработки запроса {action}: {e}")
            error_response = {
                'type': 'error',
                'action': action,
                'requestId': request_id,
                'code': 'INTERNAL_ERROR',
                'message': str(e)
            }
            await websocket.send(json.dumps(error_response))
    
    async def handle_frontend_client(self, websocket: WebSocketServerProtocol):
        """Обработка подключения фронтенда"""
        self.frontend_clients.add(websocket)
        logger.info(f"Фронтенд клиент подключён. Всего: {len(self.frontend_clients)}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    if data.get('type') == 'request':
                        await self.handle_frontend_request(websocket, data)
                except json.JSONDecodeError:
                    logger.error("Некорректный JSON от фронтенда")
                except Exception as e:
                    logger.error(f"Ошибка обработки сообщения от фронтенда: {e}")
        
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.frontend_clients.discard(websocket)
            logger.info(f"Фронтенд клиент отключён. Всего: {len(self.frontend_clients)}")
    
    async def broadcast_station_update(self, serial: str):
        """Рассылка обновления станции всем фронтенд-клиентам"""
        if serial not in self.stations:
            return
        
        station = self.stations[serial]
        update_message = {
            'type': 'update',
            'action': 'stationUpdate',
            'data': {
                'stationId': station.id,
                'changes': {
                    'station_status': station.station_status,
                    'error_info': station.error_info,
                    'connectors': station.connectors
                }
            }
        }
        
        disconnected = set()
        for client in self.frontend_clients:
            try:
                await client.send(json.dumps(update_message))
            except:
                disconnected.add(client)
        
        for client in disconnected:
            self.frontend_clients.discard(client)
    
    async def start_servers(self, use_ssl: bool = True):
        """Запуск обоих серверов"""
        protocol = "wss" if use_ssl else "ws"
        
        # SSL контекст
        ssl_context = self.create_ssl_context() if use_ssl else None
        
        # Сервер для станций (10009)
        async def station_handler(websocket, path):
            # Извлекаем serial из path: /00001
            serial = path.strip('/')
            if serial:
                await self.handle_station_message(websocket, serial)
        
        station_server = await websockets.serve(
            station_handler,
            self.host,
            self.port_stations,
            ssl=ssl_context,
            ping_interval=20,
            ping_timeout=10
        )
        logger.info(f"Сервер станций: {protocol}://{self.host}:{self.port_stations}")
        
        # Сервер для фронтенда (10008)
        frontend_server = await websockets.serve(
            self.handle_frontend_client,
            self.host,
            self.port_frontend,
            ssl=ssl_context,
            ping_interval=20,
            ping_timeout=10
        )
        logger.info(f"Сервер фронтенда: {protocol}://{self.host}:{self.port_frontend}")
        
        return station_server, frontend_server


async def main():
    """Главная функция"""
    server_instance = WebSocketServer()
    
    station_server, frontend_server = await server_instance.start_servers(use_ssl=True)
    
    logger.info("Серверы запущены. Нажмите Ctrl+C для остановки")
    
    try:
        await asyncio.gather(
            station_server.wait_closed(),
            frontend_server.wait_closed()
        )
    except KeyboardInterrupt:
        logger.info("Получен сигнал остановки")
    finally:
        station_server.close()
        frontend_server.close()
        await station_server.wait_closed()
        await frontend_server.wait_closed()
        logger.info("Серверы остановлены")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Серверы остановлены пользователем")