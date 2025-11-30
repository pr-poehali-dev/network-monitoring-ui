export interface ParsedError {
  type: 'signal' | 'rectifier' | 'ocpp' | 'connector' | 'unknown';
  code: string;
  label: string;
}

export function parseErrorInfo(errorInfo: string): ParsedError[] {
  if (!errorInfo || errorInfo.trim() === '') {
    return [];
  }

  const parts = errorInfo.split(',').map(p => p.trim());
  const errors: ParsedError[] = [];

  for (const part of parts) {
    if (part.startsWith('sig')) {
      errors.push({
        type: 'signal',
        code: part,
        label: `Сигнал ${part.replace('sig', '')}`
      });
    } else if (part.includes(':')) {
      const [rectifier, status] = part.split(':');
      if (rectifier.startsWith('rect')) {
        errors.push({
          type: 'rectifier',
          code: part,
          label: `Выпрямитель ${rectifier.replace('rect', '')}: ${status === 'fault' ? 'Неисправность' : 'Защита'}`
        });
      }
    } else if (part === 'OCPP not connected') {
      errors.push({
        type: 'ocpp',
        code: part,
        label: 'Нет связи с OCPP'
      });
    } else if (part === 'Connector fault') {
      errors.push({
        type: 'connector',
        code: part,
        label: 'Ошибка коннектора'
      });
    } else {
      errors.push({
        type: 'unknown',
        code: part,
        label: part
      });
    }
  }

  return errors;
}

export function getErrorColor(errorType: ParsedError['type']): string {
  switch (errorType) {
    case 'signal':
      return 'bg-red-100 text-red-700';
    case 'rectifier':
      return 'bg-orange-100 text-orange-700';
    case 'ocpp':
      return 'bg-yellow-100 text-yellow-700';
    case 'connector':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
