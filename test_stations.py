#!/usr/bin/env python3
"""
Тестовый скрипт для проверки генерации станций
"""

from websocket_server import MockDataGenerator

def test_station_generation():
    """Тестирует генерацию станций"""
    generator = MockDataGenerator()
    stations = generator.generate_stations(100)
    
    print(f"Сгенерировано станций: {len(stations)}")
    print(f"Первые 10 ID: {[s['id'] for s in stations[:10]]}")
    print(f"Последние 10 ID: {[s['id'] for s in stations[-10:]]}")
    
    # Проверяем, что есть station_003
    station_003 = next((s for s in stations if s['id'] == 'station_003'), None)
    if station_003:
        print(f"✅ station_003 найдена: {station_003['name']}")
    else:
        print("❌ station_003 НЕ найдена!")
        
    # Проверяем все ID от 001 до 100
    expected_ids = [f'station_{i:03d}' for i in range(1, 101)]
    actual_ids = [s['id'] for s in stations]
    
    missing_ids = set(expected_ids) - set(actual_ids)
    extra_ids = set(actual_ids) - set(expected_ids)
    
    if missing_ids:
        print(f"❌ Отсутствующие ID: {sorted(missing_ids)}")
    if extra_ids:
        print(f"❌ Лишние ID: {sorted(extra_ids)}")
        
    if not missing_ids and not extra_ids:
        print("✅ Все станции от station_001 до station_100 созданы корректно")
        
    return stations

if __name__ == "__main__":
    test_station_generation()