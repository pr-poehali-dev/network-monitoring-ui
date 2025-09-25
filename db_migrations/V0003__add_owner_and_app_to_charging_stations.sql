-- Добавление полей собственника и приложения к таблице зарядных станций
ALTER TABLE charging_stations 
ADD COLUMN owner VARCHAR(200),
ADD COLUMN app_name VARCHAR(100);

-- Создание индексов для поиска по собственнику и приложению
CREATE INDEX idx_charging_stations_owner ON charging_stations(owner);
CREATE INDEX idx_charging_stations_app ON charging_stations(app_name);

-- Обновление существующих записей с данными собственника и приложения
UPDATE charging_stations SET 
    owner = 'ООО "ЭнергоТранс"', 
    app_name = 'ChargePoint' 
WHERE station_name = 'EVT 001';

UPDATE charging_stations SET 
    owner = 'ПАО "Россети"', 
    app_name = 'EV Connect' 
WHERE station_name = 'EVT 002';

UPDATE charging_stations SET 
    owner = 'ООО "ГринЭнерджи"', 
    app_name = 'ChargePoint' 
WHERE station_name = 'EVT 003';

UPDATE charging_stations SET 
    owner = 'ООО "СевЗарядка"', 
    app_name = 'Hubject' 
WHERE station_name = 'EVT 004';

UPDATE charging_stations SET 
    owner = 'ИП Иванов А.С.', 
    app_name = 'EV Connect' 
WHERE station_name = 'EVT 005';