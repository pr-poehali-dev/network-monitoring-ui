export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'destructive';
    case 'warning': return 'outline';
    case 'info': return 'outline';
    default: return 'outline';
  }
};

export const getSeverityText = (severity: string) => {
  switch (severity) {
    case 'critical': return 'КРИТИЧНАЯ';
    case 'warning': return 'ВНИМАНИЕ';
    case 'info': return 'УВЕДОМЛЕНИЕ';
    default: return 'НЕИЗВЕСТНО';
  }
};

export const getSeverityBg = (severity: string) => {
  switch (severity) {
    case 'critical': return 'border-l-red-500 bg-red-50';
    case 'warning': return 'border-l-orange-500 bg-orange-50';
    case 'info': return 'border-l-blue-500 bg-blue-50';
    default: return 'border-l-gray-500 bg-gray-50';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-red-600';
    case 'acknowledged': return 'text-yellow-600';
    case 'resolved': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Активна';
    case 'acknowledged': return 'Подтверждена';
    case 'resolved': return 'Решена';
    default: return 'Неизвестно';
  }
};

export const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'immediate': return 'bg-red-100 border-red-500 text-red-800';
    case 'urgent': return 'bg-orange-100 border-orange-500 text-orange-800';
    case 'high': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    default: return 'bg-gray-100 border-gray-500 text-gray-800';
  }
};

export const getUrgencyText = (urgency: string) => {
  switch (urgency) {
    case 'immediate': return 'НЕМЕДЛЕННО';
    case 'urgent': return 'СРОЧНО';
    case 'high': return 'ВАЖНО';
    default: return 'ОБЫЧНО';
  }
};

export const getUrgencyIcon = (urgency: string) => {
  switch (urgency) {
    case 'immediate': return 'Zap';
    case 'urgent': return 'AlertTriangle';
    case 'high': return 'AlertCircle';
    default: return 'Info';
  }
};