import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws";

export class WebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();

  connect(token: string, onConnect?: () => void, onError?: (error: any) => void) {
    if (this.client?.connected) {
      console.log("WebSocket already connected");
      return;
    }

    this.client = new Client({
      brokerURL: undefined, // Se usa webSocketFactory en su lugar
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("WebSocket connected");
        onConnect?.();
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        onError?.(frame);
      },
      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
        onError?.(error);
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client?.connected) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      console.log("WebSocket disconnected");
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  // Suscribirse a mensajes de un chat
  subscribeToChat(chatId: number, callback: (message: any) => void) {
    if (!this.client?.connected) {
      console.error("WebSocket not connected");
      return;
    }

    const destination = `/topic/chat/${chatId}`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    this.subscriptions.set(`chat-${chatId}`, subscription);
    console.log(`Subscribed to chat ${chatId}`);
  }

  // Suscribirse a indicadores de escritura
  subscribeToTyping(chatId: number, callback: (data: any) => void) {
    if (!this.client?.connected) {
      console.error("WebSocket not connected");
      return;
    }

    const destination = `/topic/chat/${chatId}/typing`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("Error parsing typing indicator:", error);
      }
    });

    this.subscriptions.set(`typing-${chatId}`, subscription);
  }

  // Suscribirse a ediciones de mensajes
  subscribeToEdits(chatId: number, callback: (message: any) => void) {
    if (!this.client?.connected) return;

    const destination = `/topic/chat/${chatId}/edit`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("Error parsing edit:", error);
      }
    });

    this.subscriptions.set(`edit-${chatId}`, subscription);
  }

  // Suscribirse a eliminaciones de mensajes
  subscribeToDeletes(chatId: number, callback: (messageId: string) => void) {
    if (!this.client?.connected) return;

    const destination = `/topic/chat/${chatId}/delete`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      callback(message.body);
    });

    this.subscriptions.set(`delete-${chatId}`, subscription);
  }

  // Suscribirse a reacciones
  subscribeToReactions(chatId: number, callback: (message: any) => void) {
    if (!this.client?.connected) return;

    const destination = `/topic/chat/${chatId}/reaction`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("Error parsing reaction:", error);
      }
    });

    this.subscriptions.set(`reaction-${chatId}`, subscription);
  }

  // Desuscribirse de un chat
  unsubscribeFromChat(chatId: number) {
    const chatSub = this.subscriptions.get(`chat-${chatId}`);
    if (chatSub) {
      chatSub.unsubscribe();
      this.subscriptions.delete(`chat-${chatId}`);
    }

    const typingSub = this.subscriptions.get(`typing-${chatId}`);
    if (typingSub) {
      typingSub.unsubscribe();
      this.subscriptions.delete(`typing-${chatId}`);
    }

    const editSub = this.subscriptions.get(`edit-${chatId}`);
    if (editSub) {
      editSub.unsubscribe();
      this.subscriptions.delete(`edit-${chatId}`);
    }

    const deleteSub = this.subscriptions.get(`delete-${chatId}`);
    if (deleteSub) {
      deleteSub.unsubscribe();
      this.subscriptions.delete(`delete-${chatId}`);
    }

    const reactionSub = this.subscriptions.get(`reaction-${chatId}`);
    if (reactionSub) {
      reactionSub.unsubscribe();
      this.subscriptions.delete(`reaction-${chatId}`);
    }

    console.log(`Unsubscribed from chat ${chatId}`);
  }

  // Enviar mensaje
  sendMessage(data: any) {
    if (!this.client?.connected) {
      console.error("WebSocket not connected");
      return;
    }

    this.client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(data),
    });
  }

  // Enviar indicador de escritura
  sendTypingIndicator(chatId: number, isTyping: boolean) {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({
        chatId,
        isTyping,
      }),
    });
  }
}

// Singleton instance
let wsClient: WebSocketClient | null = null;

export const getWebSocketClient = (): WebSocketClient => {
  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
};