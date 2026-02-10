import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Message, StompSubscription } from '@stomp/stompjs'; // Ajout de StompSubscription
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: Client | null = null;
  private currentSubscription: StompSubscription | null = null; // 👈 Stocke l'abonnement au ticket
  
  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) { }

  connect(ticketId: number): void {
    // 1. Si un client existe déjà, on le désactive pour repartir sur du propre
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

      // 2. On s'assure que le Subject est vide avant de charger le nouveau ticket
      this.messagesSubject.next([]);

      // 3. On s'abonne au topic du ticket et on stocke la subscription
      this.currentSubscription = this.stompClient!.subscribe(`/topic/ticket/${ticketId}`, (message: Message) => {
        if (message.body) {
          const data = JSON.parse(message.body);
          
          // GESTION DOUBLE : Historique (Array) ou Message seul (Object)
          if (Array.isArray(data)) {
            // Si c'est un historique, on remplace tout (en aplatissant si besoin)
            const history = Array.isArray(data[0]) ? data[0] : data;
            this.messagesSubject.next(history);
          } else {
            // Si c'est un message seul, on l'ajoute à la liste
            const currentMessages = this.messagesSubject.getValue();
            this.messagesSubject.next([...currentMessages, data]);
          }
        }
      });

      // 4. Une fois connecté, on demande automatiquement l'historique
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

  // Cette méthode ferme TOUT (utile quand on quitte la page chat)
  disconnect(): void {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.messagesSubject.next([]); // On vide pour le prochain affichage
  }

  loadHistory(ticketId: number) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/chat/${ticketId}/load`
      });
    }
  }
}