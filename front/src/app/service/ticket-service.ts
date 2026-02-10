import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class TicketService {

  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api';

  createTicket(userId: number, subject: string): Observable<any> {
    return this.http.post(`${this.API_URL}/tickets/create`, 
      { userId, subject }, 
      { withCredentials: true } // Indispensable pour les cookies/sessions
    );
  }
}
