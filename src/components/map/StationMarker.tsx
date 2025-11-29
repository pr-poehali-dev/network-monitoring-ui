import { getConnectorStatus } from '@/utils/connectors';
import { StationStatus } from '@/types/websocket';

interface Connector {
  id: string;
  status: number;
  type: number;
}

interface StationMarkerProps {
  stationStatus: StationStatus;
  connectors: Connector[];
  size?: number;
}

const getStationStatusColor = (status: StationStatus) => {
  switch (status) {
    case 'connected': return '#22C55E';
    case 'disconnected': return '#9CA3AF';
    case 'error': return '#EF4444';
    case 'initializing': return '#F59E0B';
    default: return '#9CA3AF';
  }
};

const getConnectorStatusColor = (statusId: number) => {
  const info = getConnectorStatus(statusId);
  
  switch (info.type) {
    case 'available': return '#22C55E';
    case 'charging': return '#3B82F6';
    case 'preparing': return '#F59E0B';
    case 'finishing': return '#F97316';
    case 'faulted': return '#EF4444';
    case 'unavailable': return '#9CA3AF';
    case 'unknown': return '#A855F7';
    default: return '#9CA3AF';
  }
};

export default function StationMarker({ stationStatus, connectors, size = 48 }: StationMarkerProps) {
  const centerSize = size * 0.6;
  const ringRadius = size / 2;
  const centerRadius = centerSize / 2;
  const gapDegrees = 3;
  
  const segmentAngle = 360 / connectors.length;
  const arcAngle = segmentAngle - gapDegrees;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-md">
      <defs>
        {connectors.map((connector, index) => {
          const startAngle = index * segmentAngle - 90;
          const endAngle = startAngle + arcAngle;
          
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          
          const x1 = size / 2 + centerRadius * Math.cos(startRad);
          const y1 = size / 2 + centerRadius * Math.sin(startRad);
          const x2 = size / 2 + ringRadius * Math.cos(startRad);
          const y2 = size / 2 + ringRadius * Math.sin(startRad);
          
          const x3 = size / 2 + ringRadius * Math.cos(endRad);
          const y3 = size / 2 + ringRadius * Math.sin(endRad);
          const x4 = size / 2 + centerRadius * Math.cos(endRad);
          const y4 = size / 2 + centerRadius * Math.sin(endRad);
          
          const largeArcOuter = arcAngle > 180 ? 1 : 0;
          const largeArcInner = arcAngle > 180 ? 1 : 0;
          
          return (
            <path
              key={connector.id}
              id={`segment-${index}`}
              d={`
                M ${x1} ${y1}
                L ${x2} ${y2}
                A ${ringRadius} ${ringRadius} 0 ${largeArcOuter} 1 ${x3} ${y3}
                L ${x4} ${y4}
                A ${centerRadius} ${centerRadius} 0 ${largeArcInner} 0 ${x1} ${y1}
                Z
              `}
              fill={getConnectorStatusColor(connector.status)}
            />
          );
        })}
      </defs>
      
      {connectors.map((connector, index) => (
        <use key={connector.id} href={`#segment-${index}`} />
      ))}
      
      <circle
        cx={size / 2}
        cy={size / 2}
        r={centerRadius}
        fill={getStationStatusColor(stationStatus)}
        stroke="white"
        strokeWidth="2"
      />
      
      <path
        d={`M ${size / 2} ${size} L ${size / 2} ${size + 8} L ${size / 2 - 4} ${size + 4} L ${size / 2 + 4} ${size + 4} L ${size / 2} ${size + 8}`}
        fill={getStationStatusColor(stationStatus)}
        stroke="white"
        strokeWidth="1"
      />
    </svg>
  );
}

export function generateMarkerSVG(stationStatus: StationStatus, connectors: Connector[], size = 48): string {
  const centerSize = size * 0.6;
  const ringRadius = size / 2;
  const centerRadius = centerSize / 2;
  const gapDegrees = 3;
  
  const segmentAngle = 360 / connectors.length;
  const arcAngle = segmentAngle - gapDegrees;
  
  const segments = connectors.map((connector, index) => {
    const startAngle = index * segmentAngle - 90;
    const endAngle = startAngle + arcAngle;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = size / 2 + centerRadius * Math.cos(startRad);
    const y1 = size / 2 + centerRadius * Math.sin(startRad);
    const x2 = size / 2 + ringRadius * Math.cos(startRad);
    const y2 = size / 2 + ringRadius * Math.sin(startRad);
    
    const x3 = size / 2 + ringRadius * Math.cos(endRad);
    const y3 = size / 2 + ringRadius * Math.sin(endRad);
    const x4 = size / 2 + centerRadius * Math.cos(endRad);
    const y4 = size / 2 + centerRadius * Math.sin(endRad);
    
    const largeArcOuter = arcAngle > 180 ? 1 : 0;
    const largeArcInner = arcAngle > 180 ? 1 : 0;
    
    return `
      <path
        d="M ${x1} ${y1}
           L ${x2} ${y2}
           A ${ringRadius} ${ringRadius} 0 ${largeArcOuter} 1 ${x3} ${y3}
           L ${x4} ${y4}
           A ${centerRadius} ${centerRadius} 0 ${largeArcInner} 0 ${x1} ${y1}
           Z"
        fill="${getConnectorStatusColor(connector.status)}"
      />
    `;
  }).join('');
  
  return `
    <svg width="${size}" height="${size + 8}" viewBox="0 0 ${size} ${size + 8}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      ${segments}
      <circle
        cx="${size / 2}"
        cy="${size / 2}"
        r="${centerRadius}"
        fill="${getStationStatusColor(stationStatus)}"
        stroke="white"
        stroke-width="2"
      />
      <path
        d="M ${size / 2} ${size} L ${size / 2 - 4} ${size + 6} L ${size / 2 + 4} ${size + 6} Z"
        fill="${getStationStatusColor(stationStatus)}"
        stroke="white"
        stroke-width="1"
      />
    </svg>
  `;
}