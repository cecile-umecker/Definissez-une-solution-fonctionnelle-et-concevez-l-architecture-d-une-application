import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service'; 

/**
 * Service for support ticket operations (create, list, close).
 * Provides different ticket views based on user role.
 */
@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); 
  private readonly API_URL = 'http://localhost:8080/api/tickets';

  // Create new support ticket
  createTicket(userId: number, subject: string): Observable<any> {
    return this.http.post(`${this.API_URL}/create`, 
      { userId, subject }, 
      { withCredentials: true }
    );
  }

  // Get tickets based on user role (all for agents, own for clients)
  getUserTickets(): Observable<any[]> {
    const user = this.authService.getUserValue();
    
    if (user && user.role === 'ROLE_AGENT') {
      return this.http.get<any[]>(`${this.API_URL}/all`, { withCredentials: true });
    }

    return this.http.get<any[]>(`${this.API_URL}/my`, { withCredentials: true });
  }

  // Close ticket by ID
  closeTicket(ticketId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${ticketId}/close`, {}, { withCredentials: true });
  }
}