const ERROR_CODES: Record<string, string> = {
  // Сигналы
  'sig1': 'Перегрев',
  'sig2': 'Низкое напряжение',
  'sig3': 'Высокое напряжение',
  'sig4': 'Потеря связи',
  'sig5': 'Аварийная остановка',
  
  // Ректификаторы
  'rect1:fault': 'Ошибка в модуле 1',
  'rect2:fault': 'Ошибка в модуле 2',
  'rect3:fault': 'Ошибка в модуле 3',
  'rect4:fault': 'Ошибка в модуле 4',
  
  // Коннекторы
  'connector1:fault': 'Ошибка коннектора 1',
  'connector2:fault': 'Ошибка коннектора 2',
};

export function parseErrorInfo(errorInfo: string | null): string[] {
  if (!errorInfo) return [];
  
  const errors = errorInfo.split(',').map(code => code.trim());
  
  return errors.map(code => {
    const humanReadable = ERROR_CODES[code];
    return humanReadable || code;
  });
}

export function getErrorSeverity(errorInfo: string | null): 'critical' | 'warning' | 'info' {
  if (!errorInfo) return 'info';
  
  const errors = errorInfo.toLowerCase();
  
  if (errors.includes('sig5') || errors.includes('fault')) {
    return 'critical';
  }
  
  if (errors.includes('sig1') || errors.includes('sig3') || errors.includes('sig4')) {
    return 'warning';
  }
  
  return 'info';
}
