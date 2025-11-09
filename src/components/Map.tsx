import { useState, useEffect } from 'react';
import { StationData } from '@/types/websocket';
import Icon from '@/components/ui/icon';

interface MapProps {
  stations: StationData[];
  onStationClick?: (stationId: number) => void;
}

const getStatusColor = (is_active: number) => {
  return is_active === 1 ? '#22C55E' : '#9CA3AF';
};

const getStatusLabel = (is_active: number) => {
  return is_active === 1 ? 'Активна' : 'Неактивна';
};

export default function MapComponent({ stations, onStationClick }: MapProps) {
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [mapHtml, setMapHtml] = useState<string>('');

  useEffect(() => {
    const validStations = stations.filter(s => s.lat && s.lon);

    if (validStations.length === 0) {
      setMapHtml(`
        <!DOCTYPE html>
        <html style="height: 100%; margin: 0; padding: 0;">
        <body style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6;">
          <div style="text-align: center; color: #6b7280;">
            <p style="font-size: 18px; margin: 0;">Нет станций с координатами для отображения</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

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
          .leaflet-attribution-flag { display: none !important; }
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
          const map = L.map('map', {
            zoomSnap: 0.25,
            zoomDelta: 0.25,
            wheelPxPerZoomLevel: 60,
            zoomAnimation: true,
            zoomAnimationThreshold: 4,
            fadeAnimation: true,
            markerZoomAnimation: true
          }).setView([${validStations[0].lat}, ${validStations[0].lon}], 6);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          setTimeout(() => {
            const attributionControl = document.querySelector('.leaflet-control-attribution');
            if (attributionControl) {
              attributionControl.innerHTML = '© OpenStreetMap';
            }
          }, 100);

          const stations = ${JSON.stringify(validStations)};
          
          function getStatusColor(is_active) {
            return is_active === 1 ? '#22C55E' : '#9CA3AF';
          }

          const markers = L.markerClusterGroup();

          stations.forEach(station => {
            const color = getStatusColor(station.is_active);
            
            const icon = L.divIcon({
              html: \`
                <div style="
                  width: 20px;
                  height: 20px;
                  background-color: \${color};
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  cursor: pointer;
                  transition: transform 0.2s;
                "></div>
              \`,
              className: '',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });

            const marker = L.marker([station.lat, station.lon], { icon })
              .bindPopup(\`
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                    \${station.name || station.station_id}
                  </h3>
                  <div style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                    <div><strong>ID:</strong> \${station.station_id}</div>
                    \${station.address ? \`<div><strong>Адрес:</strong> \${station.address}</div>\` : ''}
                    \${station.region ? \`<div><strong>Регион:</strong> \${station.region}</div>\` : ''}
                    \${station.ip_address ? \`<div><strong>IP:</strong> \${station.ip_address}</div>\` : ''}
                    <div style="margin-top: 8px;">
                      <span style="
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 12px;
                        font-weight: 600;
                        background-color: \${station.is_active === 1 ? '#dcfce7' : '#f3f4f6'};
                        color: \${station.is_active === 1 ? '#16a34a' : '#6b7280'};
                      ">
                        \${station.is_active === 1 ? 'Активна' : 'Неактивна'}
                      </span>
                    </div>
                  </div>
                </div>
              \`)
              .on('click', () => {
                window.parent.postMessage({ 
                  type: 'stationClick', 
                  stationId: station.id 
                }, '*');
              });

            markers.addLayer(marker);
          });

          map.addLayer(markers);

          if (stations.length > 0) {
            const group = new L.featureGroup(markers.getLayers());
            map.fitBounds(group.getBounds().pad(0.1));
          }
        </script>
      </body>
      </html>
    `;

    setMapHtml(html);
  }, [stations]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'stationClick' && onStationClick) {
        onStationClick(event.data.stationId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStationClick]);

  if (!mapHtml) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Icon name="Loader2" className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <iframe
        srcDoc={mapHtml}
        className="w-full h-full border-0"
        title="Карта станций"
      />
      {selectedStation && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">
              {selectedStation.name || selectedStation.station_id}
            </h3>
            <button
              onClick={() => setSelectedStation(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div><strong>ID:</strong> {selectedStation.station_id}</div>
            {selectedStation.address && (
              <div><strong>Адрес:</strong> {selectedStation.address}</div>
            )}
            {selectedStation.region && (
              <div><strong>Регион:</strong> {selectedStation.region}</div>
            )}
            {selectedStation.ip_address && (
              <div><strong>IP:</strong> {selectedStation.ip_address}</div>
            )}
            <div className="pt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                selectedStation.is_active === 1 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getStatusLabel(selectedStation.is_active)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}