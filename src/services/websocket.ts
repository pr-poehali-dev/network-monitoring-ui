import { WSClientMessage, WSServerMessage, StationData } from '@/types/websocket';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 20;
  private reconnectDelay = 1000;
  private messageHandlers = new Map<string, (data: any) => void>();
  private requestCounter = 0;
  private subscribed = false;
  private isConnecting = false;
  private messageQueue: Array<{message: WSClientMessage, resolve: any, reject: any}> = [];

  constructor(url: string) {
    this.url = url;
    console.log('🔌 WebSocket service created with URL:', url);
  }

  connect(): Promise<void> {
    // Если уже подключены, не создаем новое соединение
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('✅ Already connected, skipping');
      return Promise.resolve();
    }
    
    // Если идет подключение, не создаем еще одно
    if (this.isConnecting) {
      console.log('⏳ Connection already in progress, skipping');
      return Promise.resolve();
    }
    
    this.isConnecting = true;
    console.log('🔄 Starting new connection...');
    
    return new Promise((resolve, reject) => {
      try {
        console.log('🔄 Attempting to connect to:', this.url);
        this.ws = new WebSocket(this.url);
        
        // Таймаут на подключение 15 секунд
        const connectTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            console.error('❌ Connection timeout');
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 15000);

        this.ws.onopen = () => {
          clearTimeout(connectTimeout);
          this.isConnecting = false;
          console.log('✅ WebSocket connected to:', this.url);
          this.reconnectAttempts = 0;
          this.subscribed = false;
          
          // Отправляем сообщения из очереди
          this.processMessageQueue();
          
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
          clearTimeout(connectTimeout);
          this.isConnecting = false;
          console.log('🔌 WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
          
          // Только реконнект если это не намеренное отключение (код 1000)
          if (event.code !== 1000) {
            this.handleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectTimeout);
          this.isConnecting = false;
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
    // Обработка real-time обновлений (приоритет выше)
    if (message.type === 'update' && message.action === 'stationUpdate') {
      this.handleRealtimeUpdate(message);
      return;
    }

    // Обработка ответов на запросы
    if (message.requestId && this.messageHandlers.has(message.requestId)) {
      const handler = this.messageHandlers.get(message.requestId);
      if (handler) {
        handler(message);
        this.messageHandlers.delete(message.requestId);
      }
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
    // Не пытаемся переподключиться если уже идет подключение или уже подключены
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`⏳ Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }
  
  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const item = this.messageQueue.shift();
      if (item) {
        this.sendMessageDirect(item.message).then(item.resolve).catch(item.reject);
      }
    }
  }

  private sendMessage(message: WSClientMessage): Promise<WSServerMessage> {
    return new Promise((resolve, reject) => {
      // Если WebSocket не подключен или подключается, добавляем в очередь
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        if (this.isConnecting || this.reconnectAttempts > 0) {
          console.log('⏳ Queueing message until connection is established');
          this.messageQueue.push({ message, resolve, reject });
          return;
        }
        reject(new Error('WebSocket is not connected'));
        return;
      }
      
      this.sendMessageDirect(message).then(resolve).catch(reject);
    });
  }
  
  private sendMessageDirect(message: WSClientMessage): Promise<WSServerMessage> {
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
          const errorMsg = response.message || 'Unknown error';
          reject(new Error(errorMsg));
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
      }, 30000); // 30 секунд таймаут
    });
  }

  // API методы
  async getAllStations(filters?: { region?: string; station_status?: string }): Promise<StationData[]> {
    const message: WSClientMessage = {
      type: 'request',
      action: 'getAllStations',
      requestId: ''
    };
    
    if (filters) {
      message.filters = filters;
    }
    
    const response = await this.sendMessage(message);
    return response.data?.stations || [];
  }

  async getStationById(stationId: number): Promise<StationData | null> {
    const response = await this.sendMessage({
      type: 'request',
      action: 'getStationById',
      stationId,
      requestId: ''
    });

    return response.data?.station || null;
  }

  async getStationBySerialNumber(serialNumber: string): Promise<StationData | null> {
    console.log('🔍 Requesting station by serial number:', serialNumber);
    const response = await this.sendMessage({
      type: 'request',
      action: 'getStationBySerialNumber',
      serialNumber,
      requestId: ''
    });

    console.log('📦 Response for serial', serialNumber, ':', response);
    return response.data?.station || null;
  }

  async subscribeToUpdates(): Promise<void> {
    if (this.subscribed) return;

    await this.sendMessage({
      type: 'request',
      action: 'subscribeUpdates',
      requestId: ''
    });

    this.subscribed = true;
    console.log('🔔 Subscribed to station updates');
  }

  async unsubscribeFromUpdates(): Promise<void> {
    if (!this.subscribed) return;

    await this.sendMessage({
      type: 'request',
      action: 'unsubscribeUpdates',
      requestId: ''
    });

    this.subscribed = false;
    console.log('🔕 Unsubscribed from station updates');
  }

  async getStationTransactions(
    serialNumber: string,
    from?: string,
    to?: string,
    limit?: number
  ): Promise<any[]> {
    const message: WSClientMessage = {
      type: 'request',
      action: 'getStationTransactions',
      serialNumber,
      requestId: ''
    };

    if (from) message.from = from;
    if (to) message.to = to;
    if (limit) message.limit = limit;

    const response = await this.sendMessage(message);
    return response.data?.transactions || [];
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.subscribed = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService('wss://eprom.online:10008');