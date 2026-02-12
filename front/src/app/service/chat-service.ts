import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Message, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

/**
 * Service for WebSocket-based real-time chat communication.
 * Manages STOMP connections, message subscriptions, and ticket events.
 */
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

  // Connect to WebSocket and subscribe to ticket chat and events
  // Dans ChatService.ts

// 1. Change le type ici : ajoute "| null"
  connect(ticketId: number | null): void {
    
    if (this.stompClient) {
      this.disconnect();
    }

    const socket = new SockJS('http://localhost:8080/ws');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      // debug: (str) => console.log('STOMP: ' + str), // Décommente si besoin
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connecté au serveur STOMP');
      
      // On vide les messages par défaut
      this.messagesSubject.next([]);

      // 2. ABONNEMENT GLOBAL (Toujours actif, même si ticketId est null)
      this.globalSubscription = this.stompClient!.subscribe('/topic/tickets/new', (message: Message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
          // Gère ici tes notifications globales (nouveau ticket créé, nouveau message reçu ailleurs, etc.)
          if (data.type === 'TICKET_CREATED') {
            this.ticketEventSubject.next({ type: 'CREATED' });
          }
        }
      });

      // 3. ABONNEMENT SPÉCIFIQUE (Uniquement si on a un vrai ID)
      if (ticketId) {
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

        // On charge l'historique seulement si on a ciblé un ticket
        this.loadHistory(ticketId);
      }
    };

    this.stompClient.activate();
  }

  // Disconnect from WebSocket and clean up subscriptions
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

  // Send message to specific ticket chat
  sendMessage(ticketId: number, senderId: number, text: string): void {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = { text: text, senderId: senderId };
      this.stompClient.publish({
        destination: `/app/chat/${ticketId}`,
        body: JSON.stringify(chatMessage)
      });
    }
  }

  // Load chat history for a ticket
  loadHistory(ticketId: number) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/chat/${ticketId}/load`
      });
    }
  }
}