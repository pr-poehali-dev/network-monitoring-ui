import { StationStats } from './types';

export const mockStationsStats: StationStats[] = [
  {
    id: '1',
    name: 'ЭЗС Центральная',
    city: 'Москва',
    owner: 'ЭнергоТранс',
    connectedApp: 'ChargePoint',
    totalSessions: 1247,
    successfulSessions: 1189,
    totalEnergy: 15843.2,
    errorsCount: 58,
    avgSessionDuration: 45,
    status: 'online',
    lastUpdate: '25.09.2025 16:15:00',
    utilization: 78,
    coordinates: [55.7558, 37.6176],
    connectors: [
      { id: 'c1-1', status: 'charging', type: 'CCS', power: 150 },
      { id: 'c1-2', status: 'available', type: 'CHAdeMO', power: 50 },
      { id: 'c1-3', status: 'available', type: 'Type 2', power: 22 }
    ]
  },
  {
    id: '2',
    name: 'ЭЗС Торговый центр',
    city: 'Москва',
    owner: 'ЭнергоТранс',
    connectedApp: 'Tesla Supercharger',
    totalSessions: 892,
    successfulSessions: 856,
    totalEnergy: 11567.8,
    errorsCount: 36,
    avgSessionDuration: 38,
    status: 'online',
    lastUpdate: '25.09.2025 16:12:00',
    utilization: 65,
    coordinates: [55.7322, 37.6156],
    connectors: [
      { id: 'c2-1', status: 'charging', type: 'CCS', power: 150 },
      { id: 'c2-2', status: 'charging', type: 'CCS', power: 150 },
      { id: 'c2-3', status: 'available', type: 'CCS', power: 150 },
      { id: 'c2-4', status: 'available', type: 'Type 2', power: 22 }
    ]
  },
  {
    id: '3',
    name: 'ЭЗС Парковая',
    city: 'Санкт-Петербург',
    owner: 'Северная Энергия',
    connectedApp: 'EV.Network',
    totalSessions: 1456,
    successfulSessions: 1398,
    totalEnergy: 18923.4,
    errorsCount: 58,
    avgSessionDuration: 52,
    status: 'offline',
    lastUpdate: '25.09.2025 10:30:00',
    utilization: 0,
    coordinates: [59.9343, 30.3351],
    connectors: [
      { id: 'c3-1', status: 'offline', type: 'CCS', power: 100 },
      { id: 'c3-2', status: 'offline', type: 'Type 2', power: 22 }
    ]
  },
  {
    id: '4',
    name: 'ЭЗС Промышленная',
    city: 'Санкт-Петербург',
    owner: 'Северная Энергия',
    connectedApp: 'ChargePoint',
    totalSessions: 2134,
    successfulSessions: 2089,
    totalEnergy: 26784.6,
    errorsCount: 45,
    avgSessionDuration: 48,
    status: 'online',
    lastUpdate: '25.09.2025 16:18:00',
    utilization: 92,
    coordinates: [59.8944, 30.3194],
    connectors: [
      { id: 'c4-1', status: 'charging', type: 'CCS', power: 150 },
      { id: 'c4-2', status: 'charging', type: 'CCS', power: 150 },
      { id: 'c4-3', status: 'charging', type: 'CHAdeMO', power: 50 },
      { id: 'c4-4', status: 'available', type: 'Type 2', power: 22 },
      { id: 'c4-5', status: 'available', type: 'Type 2', power: 22 }
    ]
  },
  {
    id: '5',
    name: 'ЭЗС Аэропорт',
    city: 'Екатеринбург',
    owner: 'УралЭнерго',
    connectedApp: 'Ionity',
    totalSessions: 756,
    successfulSessions: 723,
    totalEnergy: 9876.3,
    errorsCount: 33,
    avgSessionDuration: 41,
    status: 'maintenance',
    lastUpdate: '24.09.2025 14:00:00',
    utilization: 0,
    coordinates: [56.7430, 60.8063],
    connectors: [
      { id: 'c5-1', status: 'error', type: 'CCS', power: 350 },
      { id: 'c5-2', status: 'offline', type: 'CCS', power: 350 },
      { id: 'c5-3', status: 'offline', type: 'Type 2', power: 43 }
    ]
  },
  {
    id: '6',
    name: 'ЭЗС Вокзал',
    city: 'Екатеринбург',
    owner: 'УралЭнерго',
    connectedApp: 'EV.Network',
    totalSessions: 1098,
    successfulSessions: 1034,
    totalEnergy: 13452.7,
    errorsCount: 64,
    avgSessionDuration: 47,
    status: 'online',
    lastUpdate: '25.09.2025 16:20:00',
    utilization: 71,
    coordinates: [56.8389, 60.6057],
    connectors: [
      { id: 'c6-1', status: 'charging', type: 'CCS', power: 100 },
      { id: 'c6-2', status: 'available', type: 'CHAdeMO', power: 50 },
      { id: 'c6-3', status: 'available', type: 'Type 2', power: 22 },
      { id: 'c6-4', status: 'available', type: 'Type 2', power: 22 },
      { id: 'c6-5', status: 'available', type: 'Type 2', power: 22 },
      { id: 'c6-6', status: 'available', type: 'Type 2', power: 22 }
    ]
  }
];