import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class SimulationSocket {
  constructor() {
    this.stompClient = null;
    this.callbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1s
    this.isIntentionallyClosed = false;
  }

  connect() {
    if (this.isIntentionallyClosed) {
      console.log('WebSocket connection intentionally closed, not reconnecting');
      return;
    }

    try {
      const socket = new SockJS('http://localhost:8081/ws/simulation-feed');
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = null; // Disable debug logging
      
      this.stompClient.connect({}, 
        (frame) => {
          console.log('✓ Connected to WebSocket', frame.command);
          this.reconnectAttempts = 0; // Reset on successful connection
          this.reconnectDelay = 1000; // Reset delay
          
          // Subscribe with error handling
          this.stompClient.subscribe('/topic/events', 
            (message) => {
              try {
                const event = JSON.parse(message.body);
                console.log('Event received:', event.type);
                this.callbacks.forEach(cb => {
                  try {
                    cb(event);
                  } catch (callbackError) {
                    console.error('Callback error:', callbackError);
                  }
                });
              } catch (parseError) {
                console.error('Failed to parse WebSocket message:', parseError, message.body);
              }
            },
            (subscribeError) => {
              console.error('Subscription error:', subscribeError);
            }
          );
        }, 
        (error) => {
          console.error('✗ WebSocket connection error:', error);
          this.handleConnectionError();
        }
      );

      // Handle automatic disconnection
      if (this.stompClient.ws) {
        this.stompClient.ws.onclose = () => {
          if (!this.isIntentionallyClosed) {
            console.warn('WebSocket closed unexpectedly');
            this.handleConnectionError();
          }
        };
      }
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      this.handleConnectionError();
    }
  }

  handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isIntentionallyClosed) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.callbacks.forEach(cb => {
        try {
          cb({
            type: 'CONNECTION_FAILED',
            message: 'Failed to connect to WebSocket after multiple attempts'
          });
        } catch (e) {
          console.error('Error in reconnection failure callback:', e);
        }
      });
    }
  }

  onEvent(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback);
      return () => {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
      };
    }
    return () => {};
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    if (this.stompClient && this.stompClient.connected) {
      try {
        this.stompClient.disconnect(() => {
          console.log('WebSocket disconnected gracefully');
        });
      } catch (e) {
        console.warn('Disconnect error:', e);
      }
    }
  }

  isConnected() {
    return this.stompClient && this.stompClient.connected;
  }

  reconnect() {
    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;
    this.connect();
  }
}

export const simulationSocket = new SimulationSocket();
