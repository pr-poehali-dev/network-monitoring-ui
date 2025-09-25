import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  const [popupInfo, setPopupInfo] = useState<ChargingStation | null>(null);

  const handleMarkerClick = (station: ChargingStation) => {
    setSelectedStation(station);
    setPopupInfo(station);
    onStationClick?.(station.id);
  };

  return (
    <div className="relative w-full">
      <Map
        initialViewState={{
          longitude: 37.6176,
          latitude: 55.7558,
          zoom: 11
        }}
        style={{
          width: '100%',
          height: '600px',
          borderRadius: '8px'
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        attributionControl={true}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            longitude={station.coordinates[1]}
            latitude={station.coordinates[0]}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(station);
            }}
          >
            <div
              className={`
                w-4 h-4 border-2 border-white rounded-full shadow-lg cursor-pointer
                ${station.status === 'charging' ? 'animate-pulse' : ''}
              `}
              style={{ 
                backgroundColor: getStatusColor(station.status),
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            longitude={popupInfo.coordinates[1]}
            latitude={popupInfo.coordinates[0]}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className="z-50"
          >
            <div className="p-2">
              <h3 className="font-semibold mb-1">{popupInfo.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{popupInfo.location}</p>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getStatusColor(popupInfo.status) }}
                />
                <span className="text-sm">{getStatusLabel(popupInfo.status)}</span>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {selectedStation && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-xs z-[1000]">
          <button 
            onClick={() => setSelectedStation(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl leading-none"
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