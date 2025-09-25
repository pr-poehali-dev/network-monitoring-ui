import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

// Create custom markers for different statuses
const createStatusIcon = (status: string) => {
  const color = getStatusColor(status);
  
  return L.divIcon({
    className: 'custom-station-marker',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ${status === 'charging' ? 'animation: pulse 2s infinite;' : ''}
      "></div>
      <style>
        .custom-station-marker {
          background: transparent !important;
          border: none !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      </style>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

export default function Map({ stations, onStationClick }: MapProps) {
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  
  // Center map on Moscow
  const center: [number, number] = [55.7558, 37.6176];

  const handleMarkerClick = (station: ChargingStation) => {
    setSelectedStation(station);
    onStationClick?.(station.id);
  };

  return (
    <div className="relative w-full">
      <MapContainer 
        center={center} 
        zoom={11} 
        style={{ height: '600px', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={station.coordinates}
            icon={createStatusIcon(station.status)}
            eventHandlers={{
              click: () => handleMarkerClick(station)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-1">{station.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{station.location}</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getStatusColor(station.status) }}
                  />
                  <span className="text-sm">{getStatusLabel(station.status)}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {selectedStation && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs z-[1000]">
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