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
  private statusSubscription?: Subscription;
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
    
    this.chatSubscription = this.chatService.messages$.subscribe((messages: any[]) => {
      this.activeMessages = messages;
      this.cdr.detectChanges();
      setTimeout(() => this.scrollToBottom(), 100);
    });

    this.statusSubscription = this.chatService.ticketEvent$.subscribe(event => {
      if (event) {
        console.log(`Signal WebSocket reçu: ${event.type}`);

        if (event.type === 'CLOSED') {
          this.isClosed = true;
        }
        
        if (event.type === 'CLOSED' || event.type === 'ASSIGNED' || event.type === 'CREATED') {
          setTimeout(() => {
            console.log("Rechargement des tickets après signal...");
            this.loadTickets();
          }, 300); 
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  loadTickets() {
    this.ticketService.getUserTickets().subscribe({
      next: (data) => {
        this.userTickets = [...data];
        console.log("Tickets mis à jour dans la sidebar:", this.userTickets);
        
        if (this.userTickets.some(t => t.status)) {
          this.sectionsOpen.active = true;
          this.sectionsOpen.unassigned = true;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur chargement tickets", err)
    });
  }

  selectTicket(id: number) {
    if (this.selectedTicketId === id) return;

    this.selectedTicketId = id;

    const currentTicket = this.userTickets.find(t => t.id === id);
    if (currentTicket) {
      this.isClosed = !currentTicket.status;
    } else {
      this.isClosed = false;
    }

    this.chatService.connect(id);
  }

  sendMessage() {
    if (this.isClosed) return;

    const user = this.authService.getUserValue();
    if (user && this.selectedTicketId && this.newMessageText.trim()) {
      this.chatService.sendMessage(this.selectedTicketId, user.id, this.newMessageText);
      this.newMessageText = ''; 
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
    this.statusSubscription?.unsubscribe();
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

  closeTicket() {
    if (this.selectedTicketId) {
      this.ticketService.closeTicket(this.selectedTicketId).subscribe({
        next: () => {
          this.isClosed = true;
          this.loadTickets();
        },
        error: (err) => console.error("Erreur lors de la fermeture :", err)
      });
    }
  }
}