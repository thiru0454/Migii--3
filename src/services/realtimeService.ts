import { EventEmitter } from 'events';

interface RealtimeEvent {
  type: string;
  collection: string;
  operation: string;
  document: any;
}

class RealtimeService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private isConnecting = false;

  constructor() {
    super();
    console.log('Initializing RealtimeService...');
    this.connect();
  }

  private connect() {
    if (this.isConnecting) {
      console.log('Already attempting to connect...');
      return;
    }

    this.isConnecting = true;
    const wsUrl = `ws://${window.location.hostname}:${process.env.NEXT_PUBLIC_WS_PORT || '3000'}`;
    console.log('Attempting to connect to WebSocket at:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          console.log('Received real-time update:', data);
          this.emit('change', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      console.log(`Attempting to reconnect in ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  public disconnect() {
    console.log('Disconnecting WebSocket...');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    if (this.isConnecting) return 'connecting';
    return this.ws.readyState === WebSocket.OPEN ? 'connected' : 'disconnected';
  }
}

export const realtimeService = new RealtimeService(); 