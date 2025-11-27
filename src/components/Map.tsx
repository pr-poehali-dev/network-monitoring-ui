import { useState, useEffect } from 'react';
import { StationData } from '@/types/websocket';
import Icon from '@/components/ui/icon';
import { generateMarkerSVG } from '@/components/map/StationMarker';

interface MapProps {
  stations: StationData[];
  onStationClick?: (stationId: number) => void;
  clustering?: boolean;
  onClusteringChange?: (enabled: boolean) => void;
}

const getStatusColor = (is_active: number) => {
  return is_active === 1 ? '#22C55E' : '#9CA3AF';
};

const getStatusLabel = (is_active: number) => {
  return is_active === 1 ? 'Активна' : 'Неактивна';
};

export default function MapComponent({ stations, onStationClick, clustering = true, onClusteringChange }: MapProps) {
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [mapHtml, setMapHtml] = useState<string>('');
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (iframeRef?.contentWindow && mapHtml) {
      iframeRef.contentWindow.postMessage({
        type: 'updateStations',
        stations: stations
      }, '*');
      return;
    }
  }, [stations, iframeRef, mapHtml]);

  useEffect(() => {
    const validStations = stations.filter(s => s.lat && s.lon);
    const useClustering = clustering;

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
          .leaflet-zoom-animated { transition-duration: 0.15s !important; }
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
            zoomSnap: 1,
            zoomDelta: 1,
            wheelPxPerZoomLevel: 60,
            wheelDebounceTime: 0,
            zoomAnimation: true,
            zoomAnimationThreshold: 10,
            fadeAnimation: true
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
          
          function getConnectorStatusColor(statusId) {
            if (statusId === 0) return '#22C55E';
            if (statusId === 3) return '#3B82F6';
            if (statusId === 1 || statusId === 2 || statusId === 6 || statusId === 7 || statusId === 8) return '#F59E0B';
            if (statusId === 4 || statusId === 5) return '#F97316';
            if (statusId === 254) return '#9CA3AF';
            if (statusId >= 243 && statusId <= 255) return '#EF4444';
            return '#A855F7';
          }

          const useClustering = ${useClustering};
          const markers = useClustering ? L.markerClusterGroup() : L.layerGroup();

          stations.forEach(station => {
            const hasConnectors = station.connectors && station.connectors.length > 0;
            const stationStatus = (station.is_active === 1 && hasConnectors) ? 'online' : 'offline';
            
            const connectors = hasConnectors 
              ? station.connectors 
              : [{ id: \`\${station.id}-offline\`, status: 254, type: 0 }];
            
            const markerSVG = \`
              <svg width="48" height="56" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                \${connectors.map((connector, index) => {
                  const centerSize = 48 * 0.6;
                  const ringRadius = 48 / 2;
                  const centerRadius = centerSize / 2;
                  const gapDegrees = 3;
                  const segmentAngle = 360 / connectors.length;
                  const arcAngle = segmentAngle - gapDegrees;
                  
                  const startAngle = index * segmentAngle - 90;
                  const endAngle = startAngle + arcAngle;
                  
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  
                  const x1 = 48 / 2 + centerRadius * Math.cos(startRad);
                  const y1 = 48 / 2 + centerRadius * Math.sin(startRad);
                  const x2 = 48 / 2 + ringRadius * Math.cos(startRad);
                  const y2 = 48 / 2 + ringRadius * Math.sin(startRad);
                  
                  const x3 = 48 / 2 + ringRadius * Math.cos(endRad);
                  const y3 = 48 / 2 + ringRadius * Math.sin(endRad);
                  const x4 = 48 / 2 + centerRadius * Math.cos(endRad);
                  const y4 = 48 / 2 + centerRadius * Math.sin(endRad);
                  
                  const largeArcOuter = arcAngle > 180 ? 1 : 0;
                  const largeArcInner = arcAngle > 180 ? 1 : 0;
                  
                  const connectorColor = getConnectorStatusColor(connector.status);
                  
                  return \`
                    <path
                      d="M \${x1} \${y1}
                         L \${x2} \${y2}
                         A \${ringRadius} \${ringRadius} 0 \${largeArcOuter} 1 \${x3} \${y3}
                         L \${x4} \${y4}
                         A \${centerRadius} \${centerRadius} 0 \${largeArcInner} 0 \${x1} \${y1}
                         Z"
                      fill="\${connectorColor}"
                    />
                  \`;
                }).join('')}
                <circle
                  cx="24"
                  cy="24"
                  r="14.4"
                  fill="\${stationStatus === 'online' ? '#22C55E' : '#9CA3AF'}"
                  stroke="white"
                  stroke-width="2"
                />
                <path
                  d="M 24 48 L 20 54 L 28 54 Z"
                  fill="\${stationStatus === 'online' ? '#22C55E' : '#9CA3AF'}"
                  stroke="white"
                  stroke-width="1"
                />
              </svg>
            \`;
            
            const icon = L.divIcon({
              html: markerSVG,
              className: '',
              iconSize: [48, 56],
              iconAnchor: [24, 56]
            });

            function getConnectorStatusInfo(statusId) {
              if (statusId === 0) return { label: 'Доступен', bg: '#dcfce7', text: '#16a34a' };
              if (statusId === 3) return { label: 'Зарядка', bg: '#dbeafe', text: '#1e40af' };
              if (statusId === 1 || statusId === 2 || statusId === 6 || statusId === 7 || statusId === 8) {
                return { label: 'Подготовка', bg: '#fef3c7', text: '#b45309' };
              }
              if (statusId === 4 || statusId === 5) return { label: 'Завершение', bg: '#fed7aa', text: '#c2410c' };
              if (statusId === 254) return { label: 'Отключен', bg: '#f3f4f6', text: '#6b7280' };
              if (statusId >= 243 && statusId <= 255) return { label: 'Ошибка', bg: '#fee2e2', text: '#dc2626' };
              return { label: \`Неизвестно (\${statusId})\`, bg: '#f3e8ff', text: '#7e22ce' };
            }

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
                        background-color: \${stationStatus === 'online' ? '#dcfce7' : '#f3f4f6'};
                        color: \${stationStatus === 'online' ? '#16a34a' : '#6b7280'};
                      ">
                        \${stationStatus === 'online' ? 'Активна' : 'Оффлайн'}
                      </span>
                      \${!hasConnectors && station.is_active === 1 ? \`
                        <div style="margin-top: 4px; font-size: 11px; color: #ef4444;">
                          ⚠️ Нет данных о коннекторах
                        </div>
                      \` : ''}
                    </div>
                    \${hasConnectors ? \`
                      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                        <div style="font-weight: 600; margin-bottom: 6px;">Коннекторы (\${connectors.length}):</div>
                        \${connectors.map((conn, idx) => {
                          const statusInfo = getConnectorStatusInfo(conn.status);
                          return \`
                            <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                              <span style="font-size: 12px; color: #9ca3af;">#\${conn.id}</span>
                              <span style="
                                display: inline-block;
                                padding: 2px 6px;
                                border-radius: 3px;
                                font-size: 11px;
                                font-weight: 600;
                                background-color: \${statusInfo.bg};
                                color: \${statusInfo.text};
                              ">
                                \${statusInfo.label}
                              </span>
                            </div>
                          \`;
                        }).join('')}
                      </div>
                    \` : ''}
                  </div>
                </div>
              \`)
              .on('click', () => {
                window.parent.postMessage({ 
                  type: 'stationClick', 
                  stationId: station.id 
                }, '*');
              });

            if (useClustering) {
              markers.addLayer(marker);
            } else {
              marker.addTo(markers);
            }
          });

          map.addLayer(markers);

          if (stations.length > 0) {
            const group = new L.featureGroup(markers.getLayers());
            map.fitBounds(group.getBounds().pad(0.1));
          }

          window.addEventListener('message', (event) => {
            if (event.data.type === 'updateStations') {
              const newStations = event.data.stations;
              
              markers.clearLayers();
              
              newStations.forEach(station => {
                if (!station.lat || !station.lon) return;
                
                const hasConnectors = station.connectors && station.connectors.length > 0;
                const stationStatus = (station.is_active === 1 && hasConnectors) ? 'online' : 'offline';
                
                const connectors = hasConnectors 
                  ? station.connectors 
                  : [{ id: \`\${station.id}-offline\`, status: 254, type: 0 }];
                
                const markerSVG = \`
                  <svg width="48" height="56" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                    \${connectors.map((connector, index) => {
                      const centerSize = 48 * 0.6;
                      const ringRadius = 48 / 2;
                      const centerRadius = centerSize / 2;
                      const gapDegrees = 3;
                      const segmentAngle = 360 / connectors.length;
                      const arcAngle = segmentAngle - gapDegrees;
                      
                      const startAngle = index * segmentAngle - 90;
                      const endAngle = startAngle + arcAngle;
                      
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;
                      
                      const x1 = 48 / 2 + centerRadius * Math.cos(startRad);
                      const y1 = 48 / 2 + centerRadius * Math.sin(startRad);
                      const x2 = 48 / 2 + ringRadius * Math.cos(startRad);
                      const y2 = 48 / 2 + ringRadius * Math.sin(startRad);
                      const x3 = 48 / 2 + ringRadius * Math.cos(endRad);
                      const y3 = 48 / 2 + ringRadius * Math.sin(endRad);
                      const x4 = 48 / 2 + centerRadius * Math.cos(endRad);
                      const y4 = 48 / 2 + centerRadius * Math.sin(endRad);
                      
                      const largeArcOuter = arcAngle > 180 ? 1 : 0;
                      const largeArcInner = arcAngle > 180 ? 1 : 0;
                      
                      const connectorColor = getConnectorStatusColor(connector.status);
                      
                      return \\\`
                        <path
                          d="M \\\${x1} \\\${y1}
                             L \\\${x2} \\\${y2}
                             A \\\${ringRadius} \\\${ringRadius} 0 \\\${largeArcOuter} 1 \\\${x3} \\\${y3}
                             L \\\${x4} \\\${y4}
                             A \\\${centerRadius} \\\${centerRadius} 0 \\\${largeArcInner} 0 \\\${x1} \\\${y1}
                             Z"
                          fill="\\\${connectorColor}"
                        />
                      \\\`;
                    }).join('')}
                    <circle cx="24" cy="24" r="8" fill="white"/>
                    <polygon points="24,48 18,38 30,38" fill="\${stationStatus === 'online' ? '#22C55E' : '#9CA3AF'}"/>
                  </svg>
                \`;
                
                const icon = L.divIcon({
                  html: markerSVG,
                  className: '',
                  iconSize: [48, 56],
                  iconAnchor: [24, 56]
                });

                function getConnectorStatusInfo(statusId) {
                  if (statusId === 0) return { label: 'Доступен', bg: '#dcfce7', text: '#16a34a' };
                  if (statusId === 3) return { label: 'Зарядка', bg: '#dbeafe', text: '#1e40af' };
                  if (statusId === 1 || statusId === 2 || statusId === 6 || statusId === 7 || statusId === 8) {
                    return { label: 'Подготовка', bg: '#fef3c7', text: '#b45309' };
                  }
                  if (statusId === 4 || statusId === 5) return { label: 'Завершение', bg: '#fed7aa', text: '#c2410c' };
                  if (statusId === 254) return { label: 'Отключен', bg: '#f3f4f6', text: '#6b7280' };
                  if (statusId >= 243 && statusId <= 255) return { label: 'Ошибка', bg: '#fee2e2', text: '#dc2626' };
                  return { label: \\\`Неизвестно (\\\${statusId})\\\`, bg: '#f3e8ff', text: '#7e22ce' };
                }
                
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
                            background-color: \${stationStatus === 'online' ? '#dcfce7' : '#f3f4f6'};
                            color: \${stationStatus === 'online' ? '#16a34a' : '#6b7280'};
                          ">
                            \${stationStatus === 'online' ? 'Активна' : 'Оффлайн'}
                          </span>
                          \${!hasConnectors && station.is_active === 1 ? \`
                            <div style="margin-top: 4px; font-size: 11px; color: #ef4444;">
                              ⚠️ Нет данных о коннекторах
                            </div>
                          \` : ''}
                        </div>
                        \${hasConnectors ? \`
                          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                            <div style="font-weight: 600; margin-bottom: 6px;">Коннекторы (\${connectors.length}):</div>
                            \${connectors.map((conn) => {
                              const statusInfo = getConnectorStatusInfo(conn.status);
                              return \\\`
                                <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
                                  <span style="font-size: 12px; color: #9ca3af;">#\\\${conn.id}</span>
                                  <span style="
                                    display: inline-block;
                                    padding: 2px 6px;
                                    border-radius: 3px;
                                    font-size: 11px;
                                    font-weight: 600;
                                    background-color: \\\${statusInfo.bg};
                                    color: \\\${statusInfo.text};
                                  ">
                                    \\\${statusInfo.label}
                                  </span>
                                </div>
                              \\\`;
                            }).join('')}
                          </div>
                        \` : ''}
                      </div>
                    </div>
                  \`)
                  .on('click', () => {
                    window.parent.postMessage({ 
                      type: 'stationClick', 
                      stationId: station.id 
                    }, '*');
                  });

                if (useClustering) {
                  markers.addLayer(marker);
                } else {
                  marker.addTo(markers);
                }
              });
            }
          });
        </script>
      </body>
      </html>
    `;

    setMapHtml(html);
  }, [clustering]);

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
        ref={setIframeRef}
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