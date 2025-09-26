export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  station: string;
  stationId: string;
  message: string;
  description: string;
  startTime: string;
  duration: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface CriticalNotification {
  id: string;
  station: string;
  stationId: string;
  issue: string;
  description: string;
  actionNeeded: string;
  urgency: 'immediate' | 'urgent' | 'high';
  occuredAt: string;
  repeatCount?: number;
  lastAttempt?: string;
}