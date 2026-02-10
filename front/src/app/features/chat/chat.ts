import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../service/auth-service';
import { ChatService } from '../../service/chat-service'; // Ajuste le chemin
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Indispensable pour le champ texte
import { Subscription } from 'rxjs';
import { TicketService } from '../../service/ticket-service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit, OnDestroy {
  selectedTicketId: number | null = null;
  newMessageText: string = '';
  activeMessages: any[] = [];
  private chatSubscription?: Subscription;
  isClosed = false;
  sectionsOpen = {
    unassigned: true,
    mine: true,
    archived: false,
    active: true,
    closedClient: false
  };

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
    private ticketService: TicketService 
  ) {}

  ngOnInit(): void {
    this.chatSubscription = this.chatService.messages$.subscribe(messages => {
      this.activeMessages = messages;
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.ticketStatus !== undefined) {
          this.isClosed = !lastMsg.ticketStatus; 
        }
      }
    });
  }

  selectTicket(id: number) {
    this.selectedTicketId = id;
    this.chatService.disconnect(); 
    this.chatService.connect(id);
  }

  sendMessage() {
    if (this.isClosed) return; // Sécurité supplémentaire

    this.authService.currentUser$.subscribe(user => {
      if (user && this.selectedTicketId && this.newMessageText.trim()) {
        this.chatService.sendMessage(this.selectedTicketId, user.id, this.newMessageText);
        this.newMessageText = '';
      }
    }).unsubscribe();
  }

  isMyMessage(messageAuthorId: number): boolean {
    return messageAuthorId === this.authService.getUserValue().id;
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
    this.chatSubscription?.unsubscribe();
  }

  toggleSection(section: 'unassigned' | 'mine' | 'archived' | 'active' | 'closedClient') {
    this.sectionsOpen[section] = !this.sectionsOpen[section];
  }

  createNewTicket() {
    const subject = prompt("Quel est l'objet de votre demande ?");
    
    if (subject) {
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.ticketService.createTicket(user.id, subject).subscribe(newTicket => {
            console.log("Ticket créé avec l'ID :", newTicket.id);
            this.selectTicket(newTicket.id);
          });
        }
      }).unsubscribe();
    }
  }
}