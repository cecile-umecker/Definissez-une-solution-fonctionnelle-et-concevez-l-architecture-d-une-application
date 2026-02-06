import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})

export class Home implements OnInit {
  public authService = inject(AuthService);

  ngOnInit() {
    // On récupère les infos de Micka dès qu'on arrive ici
    this.authService.checkAuth().subscribe();
  }
}
