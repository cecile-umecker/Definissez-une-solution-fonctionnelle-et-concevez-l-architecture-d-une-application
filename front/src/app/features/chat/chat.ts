import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../service/auth-service';
import { ChatService } from '../../service/chat-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  userTickets: any[] = [];

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    
    // Le service s'occupe maintenant de filtrer et formater les données
    this.chatSubscription = this.chatService.messages$.subscribe((messages: any[]) => {
      this.activeMessages = messages;
      console.log("Mise à jour de l'affichage chat:", this.activeMessages.length, "messages");
      
      // On force le rafraîchissement de la vue
      this.cdr.detectChanges();
      
      // Petit scroll automatique vers le bas (optionnel)
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  loadTickets() {
    this.ticketService.getUserTickets().subscribe({
      next: (data) => {
        this.userTickets = data;
      },
      error: (err) => console.error("Erreur chargement tickets", err)
    });
  }

  selectTicket(id: number) {
    if (this.selectedTicketId === id) return; // Évite de recharger si c'est le même

    this.selectedTicketId = id;
    this.isClosed = false; 
    
    // Le service va couper l'ancien tunnel, ouvrir le nouveau et charger l'historique
    this.chatService.connect(id);
  }

  sendMessage() {
    if (this.isClosed) return;

    const user = this.authService.getUserValue();
    if (user && this.selectedTicketId && this.newMessageText.trim()) {
      this.chatService.sendMessage(this.selectedTicketId, user.id, this.newMessageText);
      this.newMessageText = ''; 
      
      // Garder le focus sur le champ
      setTimeout(() => document.querySelector('input')?.focus(), 50);
    }
  }

  private scrollToBottom() {
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  isMyMessage(messageAuthorId: number): boolean {
    return messageAuthorId === this.authService.getUserValue()?.id;
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
    this.chatSubscription?.unsubscribe();
  }

  toggleSection(section: keyof typeof this.sectionsOpen) {
    this.sectionsOpen[section] = !this.sectionsOpen[section];
  }

  createNewTicket() {
    const subject = prompt("Quel est l'objet de votre demande ?");
    if (subject) {
      const user = this.authService.getUserValue();
      if (user) {
        this.ticketService.createTicket(user.id, subject).subscribe(newTicket => {
          this.loadTickets();
          this.selectTicket(newTicket.id);
        });
      }
    }
  }
}