import { WSClientMessage, WSServerMessage, StationData } from '@/types/websocket';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, (data: any) => void>();
  private requestCounter = 0;

  constructor(url: string) {
    this.url = url;
    console.log('🔌 WebSocket service created with URL:', url);
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔄 Attempting to connect to:', this.url);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected to:', this.url);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSServerMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          console.error('Failed to connect to:', this.url);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: WSServerMessage) {
    if (message.requestId && this.messageHandlers.has(message.requestId)) {
      const handler = this.messageHandlers.get(message.requestId);
      if (handler) {
        handler(message);
        this.messageHandlers.delete(message.requestId);
      }
    }

    // Обработка real-time обновлений
    if (message.type === 'update') {
      this.handleRealtimeUpdate(message);
    }
  }

  private handleRealtimeUpdate(message: WSServerMessage) {
    console.log('📡 Real-time обновление:', message);
    
    if (message.action === 'stationUpdate') {
      const updates = message.data?.updates || [];
      
      // Вызываем все зарегистрированные коллбэки
      this.updateCallbacks.forEach(callback => {
        try {
          callback(updates);
        } catch (error) {
          console.error('Ошибка в коллбэке обновления:', error);
        }
      });
      
      // Эмитируем событие для компонентов
      const event = new CustomEvent('stationUpdate', {
        detail: { updates }
      });
      window.dispatchEvent(event);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }

  private sendMessage(message: WSClientMessage): Promise<WSServerMessage> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.error('❌ WebSocket не подключен. Состояние:', this.ws?.readyState);
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const requestId = this.generateRequestId();
      message.requestId = requestId;

      console.log('📤 Отправляем сообщение:', JSON.stringify(message, null, 2));

      // Устанавливаем обработчик ответа
      this.messageHandlers.set(requestId, (response: WSServerMessage) => {
        console.log('📥 Получен ответ:', JSON.stringify(response, null, 2));
        if (response.type === 'error') {
          reject(new Error(response.error?.message || 'Unknown error'));
        } else {
          resolve(response);
        }
      });

      // Отправляем сообщение
      try {
        this.ws.send(JSON.stringify(message));
        console.log('✅ Сообщение отправлено, ожидаем ответ...');
      } catch (error) {
        console.error('❌ Ошибка отправки сообщения:', error);
        reject(error);
      }

      // Таймаут для запроса
      setTimeout(() => {
        if (this.messageHandlers.has(requestId)) {
          this.messageHandlers.delete(requestId);
          console.error('⏰ Таймаут запроса:', requestId);
          reject(new Error('Request timeout'));
        }
      }, 10000); // 10 секунд таймаут
    });
  }

  // API методы
  async getStations(filters?: any, pagination?: { page: number; limit: number }): Promise<StationData[]> {
    const response = await this.sendMessage({
      type: 'request',
      action: 'getStations',
      data: {
        filters,
        pagination
      },
      requestId: ''
    });

    return response.data?.stations || [];
  }

  async getStationById(stationId: string): Promise<StationData | null> {
    const response = await this.sendMessage({
      type: 'request',
      action: 'getStationById',
      data: {
        stationId
      },
      requestId: ''
    });

    return response.data?.station || null;
  }

  async getStationDetail(stationId: string): Promise<StationData | null> {
    console.log('📡 Отправляем запрос getStationDetail для:', stationId);
    console.log('🔌 Состояние WebSocket:', this.ws?.readyState);
    
    const response = await this.sendMessage({
      type: 'request',
      action: 'getStationDetail',
      data: {
        stationId
      },
      requestId: ''
    });

    console.log('📡 Получен ответ getStationDetail:', response);
    return response.data?.station || null;
  }

  async getMonitoringData(): Promise<any> {
    console.log('📡 Запрашиваем данные мониторинга');
    const response = await this.sendMessage({
      type: 'request',
      action: 'getMonitoringData',
      data: {},
      requestId: ''
    });
    return response.data || {};
  }

  async getStatisticsData(filters?: any): Promise<any> {
    console.log('📡 Запрашиваем данные статистики');
    const response = await this.sendMessage({
      type: 'request',
      action: 'getStatisticsData',
      data: { filters },
      requestId: ''
    });
    return response.data || {};
  }

  async getMapData(): Promise<any> {
    console.log('📡 Запрашиваем данные для карты');
    const response = await this.sendMessage({
      type: 'request',
      action: 'getMapData',
      data: {},
      requestId: ''
    });
    return response.data || {};
  }

  async getGlobalStats(): Promise<any> {
    console.log('📡 Запрашиваем глобальную статистику');
    const response = await this.sendMessage({
      type: 'request',
      action: 'getGlobalStats',
      data: {},
      requestId: ''
    });
    return response.data || {};
  }

  async getChartData(chartType: string, period: string = 'week'): Promise<any> {
    console.log('📡 Запрашиваем данные для графика:', chartType);
    const response = await this.sendMessage({
      type: 'request',
      action: 'getChartData',
      data: { chartType, period },
      requestId: ''
    });
    return response.data || {};
  }

  // Подписка на real-time обновления
  onStationUpdate(callback: (updates: any[]) => void) {
    this.updateCallbacks.push(callback);
  }

  private updateCallbacks: ((updates: any[]) => void)[] = [];

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.updateCallbacks = [];
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance - используем WSS с SSL сертификатом
export const wsService = new WebSocketService('wss://78.138.143.58:10009/ws');