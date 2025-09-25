import { useState, useRef, useEffect } from 'react';

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'charging' | 'error' | 'offline';
  coordinates: [number, number];
}

interface MapProps {
  stations: ChargingStation[];
  onStationClick?: (stationId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return '#22C55E';
    case 'charging': return '#F97316';
    case 'error': return '#EF4444';
    case 'offline': return '#9CA3AF';
    default: return '#9CA3AF';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'available': return 'Доступна';
    case 'charging': return 'Зарядка';
    case 'error': return 'Ошибка';
    case 'offline': return 'Офлайн';
    default: return 'Неизвестно';
  }
};

// Простая функция для конвертации координат в пиксели
const coordsToPixels = (
  lat: number, 
  lng: number, 
  mapBounds: { north: number; south: number; east: number; west: number },
  width: number,
  height: number
) => {
  const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * width;
  const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * height;
  return { x, y };
};

export default function MapComponent({ stations, onStationClick }: MapProps) {
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [hoveredStation, setHoveredStation] = useState<ChargingStation | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Границы карты для Москвы и области
  const mapBounds = {
    north: 56.2,
    south: 55.3,
    east: 38.3,
    west: 36.9
  };

  const handleMarkerClick = (station: ChargingStation) => {
    setSelectedStation(station);
    onStationClick?.(station.id);
  };

  return (
    <div className="relative w-full">
      {/* Основная карта */}
      <div
        ref={mapRef}
        className="relative w-full h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        {/* Заголовок карты */}
        <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md z-10">
          <h3 className="font-semibold text-gray-800">Карта зарядных станций</h3>
          <p className="text-sm text-gray-600">Москва и область</p>
        </div>

        {/* Легенда */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md z-10">
          <div className="text-sm font-medium mb-2">Статус станций:</div>
          <div className="space-y-1 text-xs">
            {[
              { status: 'available', label: 'Доступна' },
              { status: 'charging', label: 'Зарядка' },
              { status: 'error', label: 'Ошибка' },
              { status: 'offline', label: 'Офлайн' }
            ].map(({ status, label }) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Маркеры станций */}
        {stations.map((station) => {
          const { x, y } = coordsToPixels(
            station.coordinates[0],
            station.coordinates[1],
            mapBounds,
            mapRef.current?.clientWidth || 800,
            mapRef.current?.clientHeight || 600
          );

          return (
            <div
              key={station.id}
              className={`
                absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20
                transition-all duration-200 hover:scale-125
                ${station.status === 'charging' ? 'animate-pulse' : ''}
              `}
              style={{ left: x, top: y }}
              onClick={() => handleMarkerClick(station)}
              onMouseEnter={() => setHoveredStation(station)}
              onMouseLeave={() => setHoveredStation(null)}
            >
              <div
                className="w-4 h-4 border-2 border-white rounded-full shadow-lg"
                style={{ 
                  backgroundColor: getStatusColor(station.status),
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              />
              
              {/* Tooltip при наведении */}
              {hoveredStation?.id === station.id && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap z-30">
                  {station.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black" />
                </div>
              )}
            </div>
          );
        })}

        {/* Фоновые элементы для имитации карты */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-green-200 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-200 rounded-full" />
          <div className="absolute bottom-1/3 left-1/4 w-40 h-20 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Боковая панель с информацией о выбранной станции */}
      {selectedStation && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs z-[1000]">
          <button 
            onClick={() => setSelectedStation(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
          <h3 className="font-semibold mb-2 pr-6">{selectedStation.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{selectedStation.location}</p>
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: getStatusColor(selectedStation.status) }}
            />
            <span className="text-sm">{getStatusLabel(selectedStation.status)}</span>
          </div>
          
          {selectedStation.status === 'available' && (
            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors">
              Забронировать
            </button>
          )}
          
          {selectedStation.status === 'charging' && (
            <div className="text-sm text-orange-600 font-medium">
              Станция занята
            </div>
          )}
          
          {selectedStation.status === 'error' && (
            <div className="text-sm text-red-600 font-medium">
              Требует обслуживания
            </div>
          )}
          
          {selectedStation.status === 'offline' && (
            <div className="text-sm text-gray-500 font-medium">
              Станция недоступна
            </div>
          )}
        </div>
      )}
    </div>
  );
}