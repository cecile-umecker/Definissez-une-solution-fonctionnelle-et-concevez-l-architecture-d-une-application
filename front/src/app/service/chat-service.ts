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
  
  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  // Flux pour les événements de statut (fermeture, attribution, etc.)
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
      this.ticketEventSubject.next(null); // Reset l'état de l'événement

      this.currentSubscription = this.stompClient!.subscribe(`/topic/ticket/${ticketId}`, (message: Message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
          
          // 1. INTERCEPTION DU SIGNAL DE FERMETURE
          if (data.type === 'TICKET_CLOSED') {
            console.log('Signal de fermeture reçu via WebSocket');
            this.ticketEventSubject.next({ type: 'CLOSED', id: ticketId });
            return;
          }

          // 1bis. 👈 INTERCEPTION DU SIGNAL D'ATTRIBUTION
          if (data.type === 'TICKET_ASSIGNED') {
            console.log('Signal d\'attribution reçu via WebSocket');
            this.ticketEventSubject.next({ type: 'ASSIGNED', id: ticketId, agentId: data.agentId });
            return; // On ne veut pas l'afficher comme un message de chat
          }

          // 2. GESTION DES MESSAGES CLASSIQUES
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

  sendMessage(ticketId: number, senderId: number, text: string): void {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = {
        text: text,
        senderId: senderId
      };
      
      this.stompClient.publish({
        destination: `/app/chat/${ticketId}`,
        body: JSON.stringify(chatMessage)
      });
    }
  }

  disconnect(): void {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.messagesSubject.next([]);
    this.ticketEventSubject.next(null);
  }

  loadHistory(ticketId: number) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/chat/${ticketId}/load`
      });
    }
  }
}