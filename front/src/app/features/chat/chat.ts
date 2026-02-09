import { Component } from '@angular/core';
import { AuthService } from '../../service/auth-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat {
  selectedTicketId: number | null = null;
  isClosed = false;
  activeMessages = [
    { id: 1, senderId: 1, text: "Bonjour, j'ai un problème avec ma réservation.", timestamp: '10:42' },
    { id: 2, senderId: 3, text: "Bonjour ! Je regarde ça tout de suite. Quel est votre numéro de dossier ?", timestamp: '10:43' },
    { id: 3, senderId: 1, text: "C'est le YourCar-789.", timestamp: '10:44' }
  ];
  sectionsOpen = {
    unassigned: true,
    mine: true,
    archived: false,
    active: true,
    closedClient: false
  };

  constructor(public authService: AuthService) {}

  toggleSection(section: 'unassigned' | 'mine' | 'archived' | 'active' | 'closedClient') {
    this.sectionsOpen[section] = !this.sectionsOpen[section];
  }

  selectTicket(id: number) {
    this.selectedTicketId = id;
  }

  createNewTicket() {
    console.log("Création d'un nouveau ticket...");
    // Plus tard : appel API
  }

  // Dans chat.component.ts
isMyMessage(messageAuthorId: number, currentUserId: number): boolean {
  return messageAuthorId === currentUserId;
}
}
