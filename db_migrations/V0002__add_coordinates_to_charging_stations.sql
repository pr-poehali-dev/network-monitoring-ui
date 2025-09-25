-- Добавление координат к таблице зарядных станций
ALTER TABLE charging_stations 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Создание составного индекса для геопоиска
CREATE INDEX idx_charging_stations_coordinates ON charging_stations(latitude, longitude);

-- Обновление существующих записей с координатами
UPDATE charging_stations SET 
    latitude = 55.7558, 
    longitude = 37.6176 
WHERE station_name = 'EVT 001';

UPDATE charging_stations SET 
    latitude = 55.7387, 
    longitude = 37.6032 
WHERE station_name = 'EVT 002';

UPDATE charging_stations SET 
    latitude = 55.7942, 
    longitude = 37.6816 
WHERE station_name = 'EVT 003';

UPDATE charging_stations SET 
    latitude = 59.9311, 
    longitude = 30.3609 
WHERE station_name = 'EVT 004';

UPDATE charging_stations SET 
    latitude = 55.7887, 
    longitude = 49.1221 
WHERE station_name = 'EVT 005';