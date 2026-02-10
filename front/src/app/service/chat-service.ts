import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client | null = null;
  
  // Cette liste de messages sera "observable" par tes composants
  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() { }

  // 1. Connexion au serveur
  connect(ticketId: number): void {
    // On pointe vers l'URL que tu as définie dans Spring (registry.addEndpoint("/ws"))
    const socket = new SockJS('http://localhost:8080/ws');

    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connecté : ' + frame);

      // 2. Abonnement au topic spécifique du ticket
      this.stompClient?.subscribe(`/topic/ticket/${ticketId}`, (message: Message) => {
        if (message.body) {
          const newMessage = JSON.parse(message.body);
          // On ajoute le nouveau message à la liste existante
          const currentMessages = this.messagesSubject.getValue();
          this.messagesSubject.next([...currentMessages, newMessage]);
        }
      });
    };

    this.stompClient.activate();
  }

  // 3. Envoi d'un message
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
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}