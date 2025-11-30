import { StationData } from '@/types/websocket';

export const getStationStatus = (station: StationData): 'online' | 'offline' | 'error' => {
  if (station.station_status === 'error') return 'error';
  if (station.station_status === 'connected' || station.station_status === 'initializing') return 'online';
  return 'offline';
};

export const getStatusLabel = (status: 'online' | 'offline' | 'error') => {
  switch (status) {
    case 'online': return 'Активна';
    case 'offline': return 'Оффлайн';
    case 'error': return 'Ошибка';
  }
};
