import { useState, useEffect } from 'react';
import { StationData } from '@/types/websocket';
import Icon from '@/components/ui/icon';
import { generateMapHtml } from '@/components/map/MapHtmlGenerator';
import MapIframe from '@/components/map/MapIframe';
import StationInfoPopup from '@/components/map/StationInfoPopup';

interface MapProps {
  stations: StationData[];
  onStationClick?: (stationId: number) => void;
  clustering?: boolean;
  onClusteringChange?: (enabled: boolean) => void;
}

export default function MapComponent({ stations, onStationClick, clustering = true }: MapProps) {
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
    const html = generateMapHtml(validStations, clustering);
    setMapHtml(html);
  }, [stations.length, clustering]);

  const handleStationClick = (stationId: number) => {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setSelectedStation(station);
    }
    if (onStationClick) {
      onStationClick(stationId);
    }
  };

  if (!mapHtml) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Icon name="Loader2" className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapIframe 
        mapHtml={mapHtml} 
        onStationClick={handleStationClick}
        onIframeRef={setIframeRef}
      />
      
      {selectedStation && (
        <StationInfoPopup 
          station={selectedStation} 
          onClose={() => setSelectedStation(null)} 
        />
      )}
    </div>
  );
}
