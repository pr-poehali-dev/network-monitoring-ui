import { useEffect, useRef, useState } from 'react';

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

export default function Map({ stations, onStationClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  
  // Moscow coordinates
  const centerLat = 55.7558;
  const centerLng = 37.6176;
  const zoom = 11;

  // Convert lat/lng to tile coordinates
  const latLngToTile = (lat: number, lng: number, z: number) => {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, z));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
    return { x, y };
  };

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number, mapWidth: number, mapHeight: number) => {
    const scale = Math.pow(2, zoom);
    const worldWidth = 256 * scale;
    const worldHeight = 256 * scale;

    const x = (lng + 180) / 360 * worldWidth;
    const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * worldHeight;

    // Center the map
    const centerX = (centerLng + 180) / 360 * worldWidth;
    const centerY = (1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * worldHeight;

    return {
      x: x - centerX + mapWidth / 2,
      y: y - centerY + mapHeight / 2
    };
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const mapWidth = 600;
    const mapHeight = 600;

    // Calculate which tiles we need
    const centerTile = latLngToTile(centerLat, centerLng, zoom);
    const tilesNeeded = 3; // 3x3 grid of tiles
    const startX = centerTile.x - Math.floor(tilesNeeded / 2);
    const startY = centerTile.y - Math.floor(tilesNeeded / 2);

    // Clear existing content
    mapRef.current.innerHTML = '';
    
    // Create tile container
    const tileContainer = document.createElement('div');
    tileContainer.style.cssText = `
      position: relative;
      width: ${mapWidth}px;
      height: ${mapHeight}px;
      overflow: hidden;
      border-radius: 8px;
      background: #f0f0f0;
    `;

    // Load tiles
    for (let i = 0; i < tilesNeeded; i++) {
      for (let j = 0; j < tilesNeeded; j++) {
        const tileX = startX + i;
        const tileY = startY + j;
        
        const img = document.createElement('img');
        img.src = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
        img.style.cssText = `
          position: absolute;
          left: ${i * 256 - 128}px;
          top: ${j * 256 - 128}px;
          width: 256px;
          height: 256px;
          pointer-events: none;
        `;
        img.crossOrigin = 'anonymous';
        tileContainer.appendChild(img);
      }
    }

    // Add station markers
    stations.forEach(station => {
      const pixel = latLngToPixel(station.coordinates[0], station.coordinates[1], mapWidth, mapHeight);
      
      if (pixel.x >= 0 && pixel.x <= mapWidth && pixel.y >= 0 && pixel.y <= mapHeight) {
        const marker = document.createElement('div');
        marker.style.cssText = `
          position: absolute;
          left: ${pixel.x - 8}px;
          top: ${pixel.y - 8}px;
          width: 16px;
          height: 16px;
          background-color: ${getStatusColor(station.status)};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          z-index: 10;
          transition: transform 0.2s;
          ${station.status === 'charging' ? 'animation: pulse 2s infinite;' : ''}
        `;

        marker.addEventListener('mouseenter', () => {
          marker.style.transform = 'scale(1.5)';
        });

        marker.addEventListener('mouseleave', () => {
          marker.style.transform = 'scale(1)';
        });

        marker.addEventListener('click', () => {
          setSelectedStation(station);
          onStationClick?.(station.id);
        });

        tileContainer.appendChild(marker);
      }
    });

    // Add pulse animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);

    mapRef.current.appendChild(tileContainer);
  }, [stations, onStationClick]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full" />
      
      {selectedStation && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <button 
            onClick={() => setSelectedStation(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
          <h3 className="font-semibold mb-2">{selectedStation.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{selectedStation.location}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: getStatusColor(selectedStation.status) }}
            />
            <span className="text-sm">{getStatusLabel(selectedStation.status)}</span>
          </div>
        </div>
      )}
    </div>
  );
}