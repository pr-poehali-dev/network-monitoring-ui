import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Component to fix marker icons issue
function FixMarkerIcons() {
  const map = useMap();
  
  useEffect(() => {
    // Fix for default marker icons in Leaflet + bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }, [map]);
  
  return null;
}

// Custom icons for different statuses
const createStatusIcon = (status: string) => {
  const color = {
    available: '#22C55E',
    charging: '#F97316', 
    error: '#EF4444',
    offline: '#9CA3AF'
  }[status] || '#9CA3AF';

  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ${status === 'charging' ? 'animation: pulse 2s infinite;' : ''}
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
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
  // Center map on Moscow
  const center: [number, number] = [55.7558, 37.6176];

  return (
    <MapContainer 
      center={center} 
      zoom={11} 
      style={{ height: '600px', width: '100%', borderRadius: '8px' }}
      scrollWheelZoom={true}
    >
      <FixMarkerIcons />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={station.coordinates}
          icon={createStatusIcon(station.status)}
          onclick={() => onStationClick?.(station.id)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold mb-1">{station.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{station.location}</p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ 
                    backgroundColor: {
                      available: '#22C55E',
                      charging: '#F97316', 
                      error: '#EF4444',
                      offline: '#9CA3AF'
                    }[station.status] 
                  }}
                ></div>
                <span className="text-sm">{getStatusLabel(station.status)}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}