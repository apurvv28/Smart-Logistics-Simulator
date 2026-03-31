import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class SimulationSocket {
  constructor() {
    this.stompClient = null;
    this.callbacks = [];
  }

  connect() {
    const socket = new SockJS('http://localhost:8080/ws/simulation-feed');
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null; // Disable debug logging
    
    this.stompClient.connect({}, (frame) => {
      console.log('Connected to WebSocket');
      this.stompClient.subscribe('/topic/events', (message) => {
        const event = JSON.parse(message.body);
        this.callbacks.forEach(cb => cb(event));
      });
    }, (error) => {
      console.error('WebSocket error:', error);
      setTimeout(() => this.connect(), 5000); // Reconnect after 5s
    });
  }

  onEvent(callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.stompClient && this.stompClient.connected) {
      try {
        this.stompClient.disconnect();
      } catch (e) {
        console.warn('Disconnect failed', e);
      }
    }
  }
}

export const simulationSocket = new SimulationSocket();
