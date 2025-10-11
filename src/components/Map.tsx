import { useState, useEffect } from 'react';
import { generateMarkerSVG } from './map/StationMarker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Connector {
  id: string;
  status: 'available' | 'charging' | 'occupied' | 'error' | 'offline';
  type: string;
  power: number;
}

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'error';
  coordinates: [number, number];
  connectors: Connector[];
}

interface MapProps {
  stations: ChargingStation[];
  onStationClick?: (stationId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return '#22C55E';
    case 'offline': return '#9CA3AF';
    case 'error': return '#EF4444';
    default: return '#9CA3AF';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'online': return 'Онлайн';
    case 'offline': return 'Офлайн';
    case 'error': return 'Ошибка';
    default: return 'Неизвестно';
  }
};

export default function MapComponent({ stations, onStationClick }: MapProps) {
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [mapHtml, setMapHtml] = useState<string>('');
  const [clusteringEnabled, setClusteringEnabled] = useState<boolean>(true);
  const [cityFilter, setCityFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [appFilter, setAppFilter] = useState('');

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
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
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
          .leaflet-attribution-flag {
            display: none !important;
          }
          .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
            background-color: rgba(59, 130, 246, 0.6);
          }
          .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
            background-color: rgba(59, 130, 246, 0.8);
            color: white;
            font-weight: bold;
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

          // Убираем ссылки из attribution, оставляем только текст
          setTimeout(() => {
            const attributionControl = document.querySelector('.leaflet-control-attribution');
            if (attributionControl) {
              // Заменяем содержимое на простой текст без ссылок
              attributionControl.innerHTML = '© OpenStreetMap contributors';
            }
          }, 100);

          // Скрываем флаг в attribution после загрузки карты
          setTimeout(() => {
            const flagElement = document.querySelector('.leaflet-attribution-flag');
            if (flagElement) {
              flagElement.style.display = 'none';
            }
          }, 100);

          // Данные станций
          const stations = ${JSON.stringify(stations)};
          
          // Функция для получения цвета по статусу станции
          function getStationStatusColor(status) {
            switch (status) {
              case 'online': return '#22C55E';
              case 'offline': return '#9CA3AF';
              case 'error': return '#EF4444';
              default: return '#9CA3AF';
            }
          }

          // Функция для получения цвета по статусу коннектора
          function getConnectorStatusColor(status) {
            switch (status) {
              case 'available': return '#22C55E';
              case 'charging': return '#F97316';
              case 'occupied': return '#3B82F6';
              case 'error': return '#EF4444';
              case 'offline': return '#9CA3AF';
              default: return '#9CA3AF';
            }
          }

          // Функция для генерации SVG маркера
          function generateMarkerSVG(stationStatus, connectors, size = 48) {
            const centerSize = size * 0.6;
            const ringRadius = size / 2;
            const centerRadius = centerSize / 2;
            const gapDegrees = 3;
            const segmentAngle = 360 / connectors.length;
            const arcAngle = segmentAngle - gapDegrees;

            let segments = '';
            connectors.forEach((connector, index) => {
              const startAngle = index * segmentAngle - 90;
              const endAngle = startAngle + arcAngle;

              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;

              const x1 = size / 2 + centerRadius * Math.cos(startRad);
              const y1 = size / 2 + centerRadius * Math.sin(startRad);
              const x2 = size / 2 + ringRadius * Math.cos(startRad);
              const y2 = size / 2 + ringRadius * Math.sin(startRad);

              const x3 = size / 2 + ringRadius * Math.cos(endRad);
              const y3 = size / 2 + ringRadius * Math.sin(endRad);
              const x4 = size / 2 + centerRadius * Math.cos(endRad);
              const y4 = size / 2 + centerRadius * Math.sin(endRad);

              const largeArcOuter = arcAngle > 180 ? 1 : 0;
              const largeArcInner = arcAngle > 180 ? 1 : 0;

              segments += \`
                <path
                  d="M \${x1} \${y1}
                     L \${x2} \${y2}
                     A \${ringRadius} \${ringRadius} 0 \${largeArcOuter} 1 \${x3} \${y3}
                     L \${x4} \${y4}
                     A \${centerRadius} \${centerRadius} 0 \${largeArcInner} 0 \${x1} \${y1}
                     Z"
                  fill="\${getConnectorStatusColor(connector.status)}"
                />
              \`;
            });

            return \`
              <svg width="\${size}" height="\${size + 8}" viewBox="0 0 \${size} \${size + 8}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                \${segments}
                <circle
                  cx="\${size / 2}"
                  cy="\${size / 2}"
                  r="\${centerRadius}"
                  fill="\${getStationStatusColor(stationStatus)}"
                  stroke="white"
                  stroke-width="2"
                />
                <path
                  d="M \${size / 2} \${size} L \${size / 2 - 4} \${size + 6} L \${size / 2 + 4} \${size + 6} Z"
                  fill="\${getStationStatusColor(stationStatus)}"
                  stroke="white"
                  stroke-width="1"
                />
              </svg>
            \`;
          }

          // Проверяем включена ли кластеризация
          const clusteringEnabled = ${clusteringEnabled};
          
          // Создаем группу маркеров с кластеризацией или без
          const markerGroup = clusteringEnabled ? L.markerClusterGroup({
            maxClusterRadius: 80,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: function(cluster) {
              const count = cluster.getChildCount();
              return L.divIcon({
                html: \`<div style="
                  width: 48px;
                  height: 48px;
                  border-radius: 50%;
                  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 16px;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">\${count}</div>\`,
                className: 'custom-cluster-icon',
                iconSize: [48, 48]
              });
            }
          }) : L.layerGroup();

          // Добавляем маркеры станций
          stations.forEach(station => {
            const color = getStationStatusColor(station.status);
            
            // Генерируем SVG маркер с коннекторами
            const markerSVG = generateMarkerSVG(station.status, station.connectors || [], 48);
            
            // Создаем кастомную иконку с сегментированным дизайном
            const customIcon = L.divIcon({
              className: '',
              html: markerSVG,
              iconSize: [48, 56],
              iconAnchor: [24, 56],
              popupAnchor: [0, -56]
            });

            // Добавляем маркер в группу
            const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
              icon: customIcon
            });
            
            markerGroup.addLayer(marker);

            // Получаем статус текст
            const statusText = station.status === 'online' ? 'Онлайн' : 
              station.status === 'offline' ? 'Офлайн' : 'Ошибка';
            
            // Формируем HTML для коннекторов
            const connectorsHTML = station.connectors ? station.connectors.map(conn => {
              const connColor = getConnectorStatusColor(conn.status);
              const connStatusText = conn.status === 'available' ? 'Свободен' :
                conn.status === 'charging' ? 'Зарядка' :
                conn.status === 'occupied' ? 'Занят' :
                conn.status === 'error' ? 'Ошибка' : 'Офлайн';
              return \`
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 0;">
                  <div style="width: 8px; height: 8px; background-color: \${connColor}; border-radius: 50%; border: 1px solid white;"></div>
                  <span style="color: #374151;">\${conn.type} (\${conn.power} кВт) - \${connStatusText}</span>
                </div>
              \`;
            }).join('') : '';
            
            // Единая кнопка для всех станций
            const buttonHtml = \`<button onclick="openStationDetails('\${station.id}')" style="
              width: 100%;
              background-color: #3B82F6;
              color: white;
              border: none;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 12px;
              cursor: pointer;
              margin-top: 8px;
              font-weight: 500;
            " onmouseover="this.style.backgroundColor='#2563EB'" onmouseout="this.style.backgroundColor='#3B82F6'">
              Перейти
            </button>\`;

            // Добавляем popup с кнопкой
            marker.bindPopup(\`
              <div style="min-width: 250px;">
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
                <div style="margin: 8px 0; padding: 8px 0; border-top: 1px solid #E5E7EB;">
                  <div style="font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 6px;">Коннекторы:</div>
                  \${connectorsHTML}
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

          // Добавляем группу маркеров на карту
          map.addLayer(markerGroup);

          // Функция для открытия детальной информации о станции
          function openStationDetails(stationId) {
            window.parent.postMessage({type: 'stationClick', stationId: stationId}, '*');
          }
        </script>
      </body>
      </html>
    `;
    
    setMapHtml(html);
  }, [stations, clusteringEnabled]);

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
    <div className="space-y-4">
      {/* Основная карта */}
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
        <iframe
          srcDoc={mapHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Карта зарядных станций"
        />
      </div>

      {/* Легенда и настройки под картой */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm font-semibold mb-3 text-gray-700">Статус станций:</div>
            <div className="space-y-2">
              {[
                { status: 'online', label: 'Онлайн' },
                { status: 'offline', label: 'Офлайн' },
                { status: 'error', label: 'Ошибка' }
              ].map(({ status, label }) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: getStatusColor(status) }}
                  />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-3 text-gray-700">Статус коннекторов:</div>
            <div className="space-y-2">
              {[
                { status: 'available', label: 'Свободен', color: '#22C55E' },
                { status: 'charging', label: 'Зарядка', color: '#F97316' },
                { status: 'occupied', label: 'Занят', color: '#3B82F6' },
                { status: 'error', label: 'Ошибка', color: '#EF4444' },
                { status: 'offline', label: 'Офлайн', color: '#9CA3AF' }
              ].map(({ status, label, color }) => (
                <div key={status} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-3 text-gray-700">Настройки отображения:</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="clustering-mode"
                  checked={clusteringEnabled}
                  onCheckedChange={setClusteringEnabled}
                />
                <Label htmlFor="clustering-mode" className="text-sm cursor-pointer">
                  Группировать станции
                </Label>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="relative">
                  <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Фильтр по городу..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <div className="relative">
                  <Icon name="Building" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Фильтр по собственнику..."
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <div className="relative">
                  <Icon name="Smartphone" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Фильтр по приложению..."
                    value={appFilter}
                    onChange={(e) => setAppFilter(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                {(cityFilter || ownerFilter || appFilter) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCityFilter('');
                      setOwnerFilter('');
                      setAppFilter('');
                    }}
                    className="w-full h-9 text-sm"
                  >
                    <Icon name="X" size={16} className="mr-1" />
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            </div>
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
          
          {selectedStation.connectors && selectedStation.connectors.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">Коннекторы:</div>
              <div className="space-y-1">
                {selectedStation.connectors.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            conn.status === 'available' ? '#22C55E' :
                            conn.status === 'charging' ? '#F97316' :
                            conn.status === 'occupied' ? '#3B82F6' :
                            conn.status === 'error' ? '#EF4444' : '#9CA3AF'
                        }}
                      />
                      <span>{conn.type}</span>
                    </div>
                    <span className="text-gray-600">{conn.power} кВт</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedStation.status === 'online' && (
            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors mt-3">
              Подробнее
            </button>
          )}
          
          {selectedStation.status === 'offline' && (
            <div className="text-sm text-gray-500 font-medium mt-3">
              Станция недоступна
            </div>
          )}
          
          {selectedStation.status === 'error' && (
            <div className="text-sm text-red-600 font-medium mt-3">
              Требует обслуживания
            </div>
          )}
        </div>
      )}
    </div>
  );
}