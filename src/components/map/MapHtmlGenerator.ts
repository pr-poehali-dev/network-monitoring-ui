import { StationData } from '@/types/websocket';

export const generateMapHtml = (validStations: StationData[], useClustering: boolean): string => {
  if (validStations.length === 0) {
    return `
      <!DOCTYPE html>
      <html style="height: 100%; margin: 0; padding: 0;">
      <body style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f4f6;">
        <div style="text-align: center; color: #6b7280;">
          <p style="font-size: 18px; margin: 0;">Нет станций с координатами для отображения</p>
        </div>
      </body>
      </html>
    `;
  }

  return `
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
              return { label: 'Подготовка', bg: '#fef3c7', text: '#ca8a04' };
            }
            if (statusId === 4 || statusId === 5) return { label: 'Завершение', bg: '#fed7aa', text: '#c2410c' };
            if (statusId === 254) return { label: 'Недоступен', bg: '#f3f4f6', text: '#6b7280' };
            if (statusId >= 243 && statusId <= 255) return { label: 'Ошибка', bg: '#fee2e2', text: '#dc2626' };
            return { label: 'Резерв', bg: '#f3e8ff', text: '#9333ea' };
          }

          function getConnectorTypeLabel(connectorType) {
            if (connectorType === 1) return 'Type 2';
            if (connectorType === 2) return 'CCS2';
            if (connectorType === 3) return 'CHAdeMO';
            return 'Unknown';
          }
          
          const popupContent = \`
            <div style="min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #111827;">
                \${station.name || station.station_id}
              </div>
              <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
                ID: \${station.station_id}
              </div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: \${stationStatus === 'online' ? '#22C55E' : '#9CA3AF'};"></div>
                <span style="font-size: 13px; font-weight: 500; color: #374151;">
                  \${stationStatus === 'online' ? 'Онлайн' : 'Оффлайн'}
                </span>
              </div>
              \${station.address ? \`
                <div style="font-size: 13px; color: #6b7280; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  \${station.address}
                </div>
              \` : ''}
              \${hasConnectors ? \`
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                  <div style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                    Коннекторы (\${station.connectors.length})
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    \${station.connectors.map((conn) => {
                      const statusInfo = getConnectorStatusInfo(conn.status);
                      const typeLabel = getConnectorTypeLabel(conn.type);
                      return \`
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: \${statusInfo.bg}; border-radius: 6px;">
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 12px; font-weight: 600; color: #374151;">#\${conn.id}</span>
                            <span style="font-size: 11px; color: #6b7280;">\${typeLabel}</span>
                          </div>
                          <span style="font-size: 11px; font-weight: 500; color: \${statusInfo.text};">
                            \${statusInfo.label}
                          </span>
                        </div>
                      \`;
                    }).join('')}
                  </div>
                </div>
              \` : ''}
            </div>
          \`;
          
          const marker = L.marker([station.lat, station.lon], { icon })
            .bindPopup(popupContent, {
              maxWidth: 300,
              className: 'custom-popup'
            })
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
        
        markers.addTo(map);

        window.addEventListener('message', (event) => {
          if (event.data.type === 'updateStations') {
            const newStations = event.data.stations.filter(s => s.lat && s.lon);
            
            markers.clearLayers();

            newStations.forEach(station => {
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
                  return { label: 'Подготовка', bg: '#fef3c7', text: '#ca8a04' };
                }
                if (statusId === 4 || statusId === 5) return { label: 'Завершение', bg: '#fed7aa', text: '#c2410c' };
                if (statusId === 254) return { label: 'Недоступен', bg: '#f3f4f6', text: '#6b7280' };
                if (statusId >= 243 && statusId <= 255) return { label: 'Ошибка', bg: '#fee2e2', text: '#dc2626' };
                return { label: 'Резерв', bg: '#f3e8ff', text: '#9333ea' };
              }

              function getConnectorTypeLabel(connectorType) {
                if (connectorType === 1) return 'Type 2';
                if (connectorType === 2) return 'CCS2';
                if (connectorType === 3) return 'CHAdeMO';
                return 'Unknown';
              }
              
              const popupContent = \`
                <div style="min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                  <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #111827;">
                    \${station.name || station.station_id}
                  </div>
                  <div style="font-size: 13px; color: #6b7280; margin-bottom: 12px;">
                    ID: \${station.station_id}
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background-color: \${stationStatus === 'online' ? '#22C55E' : '#9CA3AF'};"></div>
                    <span style="font-size: 13px; font-weight: 500; color: #374151;">
                      \${stationStatus === 'online' ? 'Онлайн' : 'Оффлайн'}
                    </span>
                  </div>
                  \${station.address ? \`
                    <div style="font-size: 13px; color: #6b7280; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                      \${station.address}
                    </div>
                  \` : ''}
                  \${hasConnectors ? \`
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                      <div style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                        Коннекторы (\${station.connectors.length})
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 6px;">
                        \${station.connectors.map((conn) => {
                          const statusInfo = getConnectorStatusInfo(conn.status);
                          const typeLabel = getConnectorTypeLabel(conn.type);
                          return \`
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: \${statusInfo.bg}; border-radius: 6px;">
                              <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 12px; font-weight: 600; color: #374151;">#\${conn.id}</span>
                                <span style="font-size: 11px; color: #6b7280;">\${typeLabel}</span>
                              </div>
                              <span style="font-size: 11px; font-weight: 500; color: \${statusInfo.text};">
                                \${statusInfo.label}
                              </span>
                            </div>
                          \`;
                        }).join('')}
                      </div>
                    </div>
                  \` : ''}
                </div>
              \`;
              
              const marker = L.marker([station.lat, station.lon], { icon })
                .bindPopup(popupContent, {
                  maxWidth: 300,
                  className: 'custom-popup'
                })
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
};
