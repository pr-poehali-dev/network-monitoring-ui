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
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
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

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
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
    // Эмитируем событие для компонентов
    const event = new CustomEvent('stationUpdate', {
      detail: message.data
    });
    window.dispatchEvent(event);
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
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const requestId = this.generateRequestId();
      message.requestId = requestId;

      // Устанавливаем обработчик ответа
      this.messageHandlers.set(requestId, (response: WSServerMessage) => {
        if (response.type === 'error') {
          reject(new Error(response.error?.message || 'Unknown error'));
        } else {
          resolve(response);
        }
      });

      // Отправляем сообщение
      this.ws.send(JSON.stringify(message));

      // Таймаут для запроса
      setTimeout(() => {
        if (this.messageHandlers.has(requestId)) {
          this.messageHandlers.delete(requestId);
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

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsService = new WebSocketService(
  process.env.NODE_ENV === 'production' 
    ? 'wss://your-websocket-url.com/ws'
    : 'ws://localhost:8080/ws'
);