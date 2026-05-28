import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'https://porramundialmetrica-championsfinalback-w-59fd54-193-70-44-51.sslip.io/api';
  private wsUrl = 'https://porramundialmetrica-championsfinalback-w-59fd54-193-70-44-51.sslip.io/ws-chat';

  messages = signal<ChatMessage[]>([]);
  connected = signal(false);

  private client!: Client;

  connect(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.logout();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        this.connected.set(true);
        this.client.subscribe('/topic/global', (message) => {
          const body: ChatMessage = JSON.parse(message.body);
          this.messages.update(list => [...list, body]);
        });
      },
      onDisconnect: () => this.connected.set(false),
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
  }

  sendMessage(message: string): void {
    if (this.client?.connected) {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ message })
      });
    }
  }

  loadHistory(): void {
    this.http.get<ChatMessage[]>(`${this.baseUrl}/chat/history`).subscribe({
      next: (data) => this.messages.set(data.reverse()),
      error: (err) => console.error('Error loading chat history', err)
    });
  }
}
