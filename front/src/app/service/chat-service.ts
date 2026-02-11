import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client | null = null;
  private currentSubscription: StompSubscription | null = null;
  private globalSubscription: StompSubscription | null = null;
  
  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private ticketEventSubject = new BehaviorSubject<any>(null);
  public ticketEvent$ = this.ticketEventSubject.asObservable();

  constructor(private http: HttpClient) { }

  connect(ticketId: number): void {
    if (this.stompClient) {
      this.disconnect();
    }

    const socket = new SockJS('http://localhost:8080/ws');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connecté au serveur STOMP');
      this.messagesSubject.next([]);
      this.ticketEventSubject.next(null);

      this.globalSubscription = this.stompClient!.subscribe('/topic/tickets/new', (message: Message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
          if (data.type === 'TICKET_CREATED') {
            console.log('Alerte : Nouveau ticket créé en base !');
            this.ticketEventSubject.next({ type: 'CREATED' });
          }
        }
      });

      this.currentSubscription = this.stompClient!.subscribe(`/topic/ticket/${ticketId}`, (message: Message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
          
          if (data.type === 'TICKET_CLOSED') {
            this.ticketEventSubject.next({ type: 'CLOSED', id: ticketId });
            return;
          }

          if (data.type === 'TICKET_ASSIGNED') {
            this.ticketEventSubject.next({ type: 'ASSIGNED', id: ticketId, agentId: data.agentId });
            return;
          }

          if (Array.isArray(data)) {
            const history = Array.isArray(data[0]) ? data[0] : data;
            this.messagesSubject.next(history);
          } else {
            const currentMessages = this.messagesSubject.getValue();
            this.messagesSubject.next([...currentMessages, data]);
          }
        }
      });

      this.loadHistory(ticketId);
    };

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }
    if (this.globalSubscription) {
      this.globalSubscription.unsubscribe();
      this.globalSubscription = null;
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.messagesSubject.next([]);
    this.ticketEventSubject.next(null);
  }

  sendMessage(ticketId: number, senderId: number, text: string): void {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = { text: text, senderId: senderId };
      this.stompClient.publish({
        destination: `/app/chat/${ticketId}`,
        body: JSON.stringify(chatMessage)
      });
    }
  }

  loadHistory(ticketId: number) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/chat/${ticketId}/load`
      });
    }
  }
}