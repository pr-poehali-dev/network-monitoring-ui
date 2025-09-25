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
  const [mapState, setMapState] = useState({
    centerLat: 55.7558,
    centerLng: 37.6176,
    zoom: 11,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 }
  });

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat: number, lng: number, mapWidth: number, mapHeight: number) => {
    const scale = Math.pow(2, mapState.zoom);
    const worldWidth = 256 * scale;
    const worldHeight = 256 * scale;

    const x = (lng + 180) / 360 * worldWidth;
    const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * worldHeight;

    // Center the map
    const centerX = (mapState.centerLng + 180) / 360 * worldWidth;
    const centerY = (1 - Math.log(Math.tan(mapState.centerLat * Math.PI / 180) + 1 / Math.cos(mapState.centerLat * Math.PI / 180)) / Math.PI) / 2 * worldHeight;

    return {
      x: x - centerX + mapWidth / 2 + mapState.dragOffset.x,
      y: y - centerY + mapHeight / 2 + mapState.dragOffset.y
    };
  };

  // Convert pixel to lat/lng coordinates
  const pixelToLatLng = (x: number, y: number, mapWidth: number, mapHeight: number) => {
    const scale = Math.pow(2, mapState.zoom);
    const worldWidth = 256 * scale;
    const worldHeight = 256 * scale;

    const centerX = (mapState.centerLng + 180) / 360 * worldWidth;
    const centerY = (1 - Math.log(Math.tan(mapState.centerLat * Math.PI / 180) + 1 / Math.cos(mapState.centerLat * Math.PI / 180)) / Math.PI) / 2 * worldHeight;

    const worldX = x - mapWidth / 2 + centerX - mapState.dragOffset.x;
    const worldY = y - mapHeight / 2 + centerY - mapState.dragOffset.y;

    const lng = (worldX / worldWidth) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * worldY / worldHeight)));
    const lat = latRad * 180 / Math.PI;

    return { lat, lng };
  };

  const renderMap = () => {
    if (!mapRef.current) return;

    const mapWidth = mapRef.current.offsetWidth;
    const mapHeight = 600;

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
      cursor: ${mapState.isDragging ? 'grabbing' : 'grab'};
    `;

    // Calculate tiles needed based on map size
    const tilesX = Math.ceil(mapWidth / 256) + 2;
    const tilesY = Math.ceil(mapHeight / 256) + 2;

    // Calculate center tile
    const scale = Math.pow(2, mapState.zoom);
    const centerTileX = Math.floor((mapState.centerLng + 180) / 360 * scale);
    const centerTileY = Math.floor((1 - Math.log(Math.tan(mapState.centerLat * Math.PI / 180) + 1 / Math.cos(mapState.centerLat * Math.PI / 180)) / Math.PI) / 2 * scale);

    const startX = centerTileX - Math.floor(tilesX / 2);
    const startY = centerTileY - Math.floor(tilesY / 2);

    // Load tiles
    for (let i = 0; i < tilesX; i++) {
      for (let j = 0; j < tilesY; j++) {
        const tileX = startX + i;
        const tileY = startY + j;
        
        if (tileX >= 0 && tileY >= 0 && tileX < Math.pow(2, mapState.zoom) && tileY < Math.pow(2, mapState.zoom)) {
          const img = document.createElement('img');
          img.src = `https://tile.openstreetmap.org/${mapState.zoom}/${tileX}/${tileY}.png`;
          
          const pixelX = (tileX - centerTileX) * 256 + mapWidth / 2 + mapState.dragOffset.x;
          const pixelY = (tileY - centerTileY) * 256 + mapHeight / 2 + mapState.dragOffset.y;
          
          img.style.cssText = `
            position: absolute;
            left: ${pixelX}px;
            top: ${pixelY}px;
            width: 256px;
            height: 256px;
            pointer-events: none;
          `;
          img.crossOrigin = 'anonymous';
          tileContainer.appendChild(img);
        }
      }
    }

    // Add station markers
    stations.forEach(station => {
      const pixel = latLngToPixel(station.coordinates[0], station.coordinates[1], mapWidth, mapHeight);
      
      if (pixel.x >= -20 && pixel.x <= mapWidth + 20 && pixel.y >= -20 && pixel.y <= mapHeight + 20) {
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

        marker.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedStation(station);
          onStationClick?.(station.id);
        });

        tileContainer.appendChild(marker);
      }
    });

    // Mouse events for dragging
    const handleMouseDown = (e: MouseEvent) => {
      setMapState(prev => ({
        ...prev,
        isDragging: true,
        dragStart: { x: e.clientX, y: e.clientY }
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mapState.isDragging) return;
      
      const deltaX = e.clientX - mapState.dragStart.x;
      const deltaY = e.clientY - mapState.dragStart.y;
      
      setMapState(prev => ({
        ...prev,
        dragOffset: {
          x: prev.dragOffset.x + deltaX,
          y: prev.dragOffset.y + deltaY
        },
        dragStart: { x: e.clientX, y: e.clientY }
      }));
    };

    const handleMouseUp = () => {
      if (!mapState.isDragging) return;
      
      // Convert drag offset to new center
      const newCenter = pixelToLatLng(mapWidth / 2 - mapState.dragOffset.x, mapHeight / 2 - mapState.dragOffset.y, mapWidth, mapHeight);
      
      setMapState(prev => ({
        ...prev,
        centerLat: newCenter.lat,
        centerLng: newCenter.lng,
        isDragging: false,
        dragOffset: { x: 0, y: 0 }
      }));
    };

    // Wheel event for zooming
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const zoomDelta = e.deltaY > 0 ? -1 : 1;
      const newZoom = Math.max(3, Math.min(18, mapState.zoom + zoomDelta));
      
      if (newZoom !== mapState.zoom) {
        setMapState(prev => ({ ...prev, zoom: newZoom }));
      }
    };

    tileContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    tileContainer.addEventListener('wheel', handleWheel);

    mapRef.current.appendChild(tileContainer);

    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  };

  useEffect(() => {
    const cleanup = renderMap();
    return cleanup;
  }, [mapState, stations, onStationClick]);

  useEffect(() => {
    const handleResize = () => {
      renderMap();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add pulse animation CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div ref={mapRef} className="w-full" style={{ height: '600px' }} />
      
      {/* Zoom controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 bg-white rounded-lg shadow-lg border">
        <button 
          onClick={() => setMapState(prev => ({ ...prev, zoom: Math.min(18, prev.zoom + 1) }))}
          className="p-2 hover:bg-gray-100 text-lg font-bold w-10 h-10 flex items-center justify-center"
        >
          +
        </button>
        <button 
          onClick={() => setMapState(prev => ({ ...prev, zoom: Math.max(3, prev.zoom - 1) }))}
          className="p-2 hover:bg-gray-100 text-lg font-bold w-10 h-10 flex items-center justify-center"
        >
          −
        </button>
      </div>
      
      {selectedStation && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs">
          <button 
            onClick={() => setSelectedStation(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
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