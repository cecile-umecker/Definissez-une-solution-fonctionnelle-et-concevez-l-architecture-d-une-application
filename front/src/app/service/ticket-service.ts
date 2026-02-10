import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service'; // Vérifie le chemin de ton auth service

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // 👈 On injecte l'auth pour checker le rôle
  private readonly API_URL = 'http://localhost:8080/api/tickets';

  createTicket(userId: number, subject: string): Observable<any> {
    return this.http.post(`${this.API_URL}/create`, 
      { userId, subject }, 
      { withCredentials: true }
    );
  }

  getUserTickets(): Observable<any[]> {
    const user = this.authService.getUserValue();
    
    // Si c'est un agent, on appelle ton endpoint /all
    if (user && user.role === 'ROLE_AGENT') {
      return this.http.get<any[]>(`${this.API_URL}/all`, { withCredentials: true });
    }

    // Sinon on reste sur /my
    return this.http.get<any[]>(`${this.API_URL}/my`, { withCredentials: true });
  }
}