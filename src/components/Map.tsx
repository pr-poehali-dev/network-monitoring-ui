import { useState, useEffect } from 'react';

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

export default function MapComponent({ stations, onStationClick }: MapProps) {
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [mapHtml, setMapHtml] = useState<string>('');

  useEffect(() => {
    // Координаты границ карты OpenStreetMap (bbox=37.2,55.3,38.4,56.2)
    const mapBounds = {
      west: 37.2,   // левая граница (минимальная долгота)
      east: 38.4,   // правая граница (максимальная долгота) 
      south: 55.3,  // нижняя граница (минимальная широта)
      north: 56.2   // верхняя граница (максимальная широта)
    };

    // Генерируем HTML для встроенной карты с маркерами
    const markers = stations.map(station => {
      const color = getStatusColor(station.status);
      const lat = station.coordinates[0]; // широта
      const lng = station.coordinates[1]; // долгота
      
      // Правильный расчет позиции маркера на карте
      // Долгота (X): чем больше долгота, тем правее на карте
      const xPercent = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
      // Широта (Y): чем больше широта, тем выше на карте (инвертируем)
      const yPercent = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100;
      
      return `
        <div style="
          position: absolute;
          left: ${Math.max(0, Math.min(100, xPercent))}%;
          top: ${Math.max(0, Math.min(100, yPercent))}%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          cursor: pointer;
        " onclick="handleStationClick('${station.id}')">
          <div style="
            width: 16px;
            height: 16px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ${station.status === 'charging' ? 'animation: pulse 2s infinite;' : ''}
          "></div>
        </div>
      `;
    }).join('');

    // Генерируем URL с маркерами для OpenStreetMap
    const markersParam = stations.map(station => {
      const lat = station.coordinates[0];
      const lng = station.coordinates[1];
      return `${lng},${lat}`;
    }).join(';');

    const html = `
      <!DOCTYPE html>
      <html style="height: 100%; margin: 0; padding: 0;">
      <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; overflow: hidden; }
          #map { height: 100vh; width: 100%; }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          .charging-marker {
            animation: pulse 2s infinite;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Инициализируем карту
          const map = L.map('map').setView([55.7558, 37.6176], 11);
          
          // Добавляем тайлы OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Данные станций
          const stations = ${JSON.stringify(stations)};
          
          // Функция для получения цвета по статусу
          function getStatusColor(status) {
            switch (status) {
              case 'available': return '#22C55E';
              case 'charging': return '#F97316';
              case 'error': return '#EF4444';
              case 'offline': return '#9CA3AF';
              default: return '#9CA3AF';
            }
          }

          // Добавляем маркеры станций
          stations.forEach(station => {
            const color = getStatusColor(station.status);
            
            // Создаем кастомную иконку
            const customIcon = L.divIcon({
              className: station.status === 'charging' ? 'charging-marker' : '',
              html: \`<div style="
                width: 16px;
                height: 16px;
                background-color: \${color};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>\`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            // Добавляем маркер на карту
            const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
              icon: customIcon
            }).addTo(map);

            // Получаем статус текст
            const statusText = station.status === 'available' ? 'Доступна' : 
              station.status === 'charging' ? 'Зарядка' :
              station.status === 'error' ? 'Ошибка' : 'Офлайн';
            
            // Кнопка в зависимости от статуса
            const buttonHtml = station.status === 'available' ? 
              \`<button onclick="openStationDetails('\${station.id}')" style="
                width: 100%;
                background-color: #22C55E;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                margin-top: 8px;
                font-weight: 500;
              " onmouseover="this.style.backgroundColor='#16A34A'" onmouseout="this.style.backgroundColor='#22C55E'">
                Подробнее и бронирование
              </button>\` :
              station.status === 'charging' ?
              \`<button onclick="openStationDetails('\${station.id}')" style="
                width: 100%;
                background-color: #F97316;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                margin-top: 8px;
                font-weight: 500;
              " onmouseover="this.style.backgroundColor='#EA580C'" onmouseout="this.style.backgroundColor='#F97316'">
                Подробнее
              </button>\` :
              \`<button onclick="openStationDetails('\${station.id}')" style="
                width: 100%;
                background-color: #6B7280;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                margin-top: 8px;
                font-weight: 500;
              " onmouseover="this.style.backgroundColor='#4B5563'" onmouseout="this.style.backgroundColor='#6B7280'">
                Подробнее
              </button>\`;

            // Добавляем popup с кнопкой
            marker.bindPopup(\`
              <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1F2937;">\${station.name}</h3>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;">\${station.location}</p>
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <div style="
                    width: 10px;
                    height: 10px;
                    background-color: \${color};
                    border-radius: 50%;
                    border: 1px solid white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                  "></div>
                  <span style="font-size: 13px; font-weight: 500; color: #374151;">\${statusText}</span>
                </div>
                \${buttonHtml}
              </div>
            \`, {
              closeButton: true,
              autoClose: false,
              closeOnClick: false,
              className: 'custom-popup'
            });
          });

          // Функция для открытия детальной информации о станции
          function openStationDetails(stationId) {
            window.parent.postMessage({type: 'stationClick', stationId: stationId}, '*');
          }
        </script>
      </body>
      </html>
    `;
    
    setMapHtml(html);
  }, [stations]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'stationClick') {
        const station = stations.find(s => s.id === event.data.stationId);
        if (station) {
          setSelectedStation(station);
          onStationClick?.(station.id);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [stations, onStationClick]);

  return (
    <div className="relative w-full">
      {/* Основная карта */}
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
        <iframe
          srcDoc={mapHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Карта зарядных станций"
        />
        
        {/* Легенда */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1001]">
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
      </div>

      {/* Боковая панель с информацией о выбранной станции */}
      {selectedStation && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs z-[1002]">
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