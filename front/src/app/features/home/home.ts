import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})

export class Home implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    // On récupère les infos de Micka dès qu'on arrive ici
    this.authService.checkAuth().subscribe();
  }

  onLogout() {
  this.authService.logout().subscribe({
    next: () => this.router.navigate(['/login'])
  });
}
}
