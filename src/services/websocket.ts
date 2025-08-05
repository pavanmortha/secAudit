import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string = import.meta.env.VITE_WS_URL || 'ws://localhost:8080') {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('auth_token'),
      },
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    return this.socket;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to real-time updates
  onVulnerabilityUpdate(callback: (data: any) => void) {
    this.socket?.on('vulnerability:updated', callback);
  }

  onAssetUpdate(callback: (data: any) => void) {
    this.socket?.on('asset:updated', callback);
  }

  onAuditUpdate(callback: (data: any) => void) {
    this.socket?.on('audit:updated', callback);
  }

  onScanProgress(callback: (data: any) => void) {
    this.socket?.on('scan:progress', callback);
  }

  onNewActivity(callback: (data: any) => void) {
    this.socket?.on('activity:new', callback);
  }

  onMetricsUpdate(callback: (data: any) => void) {
    this.socket?.on('metrics:updated', callback);
  }

  // Emit events
  joinRoom(room: string) {
    this.socket?.emit('message', JSON.stringify({
      type: 'join_room',
      room: room
    }));
  }

  leaveRoom(room: string) {
    this.socket?.emit('message', JSON.stringify({
      type: 'leave_room',
      room: room
    }));
  }

  startScan(assetId: string) {
    this.socket?.emit('message', JSON.stringify({
      type: 'start_scan',
      assetId: assetId
    }));
  }
  
  authenticate(token: string) {
    this.socket?.emit('message', JSON.stringify({
      type: 'authenticate',
      token: token
    }));
  }
  
  ping() {
    this.socket?.emit('message', JSON.stringify({
      type: 'ping'
    }));
  }

  // Remove listeners
  off(event: string, callback?: Function) {
    this.socket?.off(event, callback);
  }
}

export const websocketService = new WebSocketService();
export default websocketService;