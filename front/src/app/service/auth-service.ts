import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/auth';

  // Le BehaviorSubject qui contient l'état de l'utilisateur (null au début)
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  // Observable que les composants vont écouter
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials, {
      withCredentials: true // CRUCIAL pour que le navigateur accepte le cookie JWT
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user); // On stocke l'utilisateur si succès
      })
    );
  }

  // Cette méthode servira à la Guard
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}