import { useEffect } from 'react';

interface MapIframeProps {
  mapHtml: string;
  onStationClick?: (stationId: number) => void;
  onIframeRef: (ref: HTMLIFrameElement | null) => void;
}

export default function MapIframe({ mapHtml, onStationClick, onIframeRef }: MapIframeProps) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'stationClick' && onStationClick) {
        onStationClick(event.data.stationId);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onStationClick]);

  return (
    <iframe
      ref={onIframeRef}
      srcDoc={mapHtml}
      className="w-full h-full border-0"
      title="Карта станций"
    />
  );
}
