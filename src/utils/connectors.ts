export const CONNECTOR_TYPES: Record<number, string> = {
  1: "CHAdeMO",
  2: "CCS",
  3: "GB/T",
  4: "Type2"
};

export type ConnectorStatusType = 
  | 'available' 
  | 'preparing' 
  | 'charging' 
  | 'finishing' 
  | 'faulted' 
  | 'unavailable'
  | 'unknown';

export interface ConnectorStatusInfo {
  type: ConnectorStatusType;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const CONNECTOR_STATUS_MAP: Record<number, ConnectorStatusInfo> = {
  [-1]: {
    type: 'faulted',
    label: 'Неисправен',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [0]: {
    type: 'available',
    label: 'Доступен',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  [1]: {
    type: 'preparing',
    label: 'Разъем вставлен',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  [2]: {
    type: 'preparing',
    label: 'Подготовка к зарядке',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  [3]: {
    type: 'charging',
    label: 'Зарядка',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  [4]: {
    type: 'finishing',
    label: 'Завершение',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  [5]: {
    type: 'finishing',
    label: 'Ожидание отключения',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  [6]: {
    type: 'preparing',
    label: 'Handshake',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  [7]: {
    type: 'preparing',
    label: 'PreCharge',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  [8]: {
    type: 'preparing',
    label: 'Распознавание',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  [243]: {
    type: 'faulted',
    label: 'Нет питания',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [244]: {
    type: 'faulted',
    label: 'Аварийная кнопка',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [245]: {
    type: 'faulted',
    label: 'Дверь открыта',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [246]: {
    type: 'faulted',
    label: 'Тревога воды',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [247]: {
    type: 'faulted',
    label: 'Датчик удара',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [248]: {
    type: 'faulted',
    label: 'Пожарная тревога',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [249]: {
    type: 'faulted',
    label: 'Нет связи с ПЛК',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [250]: {
    type: 'faulted',
    label: 'ТС не обнаружено',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [251]: {
    type: 'faulted',
    label: 'Ошибка изоляции',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [252]: {
    type: 'faulted',
    label: 'Ошибка связи',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [253]: {
    type: 'faulted',
    label: 'Не готов',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  [254]: {
    type: 'unavailable',
    label: 'Отключен',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  [255]: {
    type: 'faulted',
    label: 'Ошибка',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
};

export function getConnectorType(typeId: number): string {
  return CONNECTOR_TYPES[typeId] || `Type ${typeId}`;
}

export function getConnectorStatus(statusId: number): ConnectorStatusInfo {
  if (statusId in CONNECTOR_STATUS_MAP) {
    return CONNECTOR_STATUS_MAP[statusId];
  }
  
  return {
    type: 'unknown',
    label: `Неизвестно (${statusId})`,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  };
}

export function getStationOverallStatus(connectors: Array<{ status: number }>): {
  status: 'available' | 'charging' | 'error' | 'offline';
  label: string;
} {
  if (!connectors || connectors.length === 0) {
    return { status: 'offline', label: 'Нет коннекторов' };
  }

  const statuses = connectors.map(c => getConnectorStatus(c.status).type);
  
  if (statuses.some(s => s === 'faulted')) {
    return { status: 'error', label: 'Ошибка' };
  }
  
  if (statuses.some(s => s === 'charging')) {
    return { status: 'charging', label: 'Зарядка' };
  }
  
  if (statuses.some(s => s === 'preparing' || s === 'finishing')) {
    return { status: 'charging', label: 'Занято' };
  }
  
  if (statuses.every(s => s === 'unavailable')) {
    return { status: 'offline', label: 'Отключена' };
  }
  
  if (statuses.some(s => s === 'available')) {
    return { status: 'available', label: 'Доступна' };
  }
  
  return { status: 'offline', label: 'Неизвестно' };
}