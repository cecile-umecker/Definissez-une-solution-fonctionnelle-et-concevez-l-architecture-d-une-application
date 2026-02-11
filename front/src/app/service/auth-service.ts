import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<any | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials, {
      withCredentials: true 
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user); 
      })
    );
  }

  checkAuth(): Observable<any> {
    return this.http.get(`${this.API_URL}/me`, { withCredentials: true }).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUserValue() {
    return this.currentUserSubject.value;
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        console.log('Déconnexion réussie');
      }),
      catchError((err) => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }
}