import { Component, inject } from '@angular/core';
import { AuthService } from '../../service/auth-service';
import { CommonModule } from '@angular/common';
import { Router,  } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  router = inject(Router);
  authService = inject(AuthService);

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log("Déconnexion réussie, redirection...");
        this.router.navigate(['/login']);
      },
      error: (err) => console.error("Erreur lors du logout", err)
    });
  }
}

