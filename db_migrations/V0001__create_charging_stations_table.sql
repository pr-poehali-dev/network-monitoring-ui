-- Создание таблицы зарядных станций
CREATE TABLE charging_stations (
    id SERIAL PRIMARY KEY,
    station_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    ip_address INET,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_charging_stations_city ON charging_stations(city);
CREATE INDEX idx_charging_stations_serial ON charging_stations(serial_number);
CREATE INDEX idx_charging_stations_name ON charging_stations(station_name);

-- Добавление примеров данных
INSERT INTO charging_stations (station_name, city, address, ip_address, serial_number) VALUES
('EVT 001', 'Москва', 'ул. Ленина, 15', '192.168.1.100', 'SN001234567'),
('EVT 002', 'Москва', 'ТЦ Метрополис', '192.168.1.101', 'SN001234568'),
('EVT 003', 'Москва', 'Парк Сокольники', '192.168.1.102', 'SN001234569'),
('EVT 004', 'Санкт-Петербург', 'Невский проспект, 28', '192.168.2.100', 'SN001234570'),
('EVT 005', 'Казань', 'ул. Баумана, 10', '192.168.3.100', 'SN001234571');