import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../service/auth-service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})

export class Home implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private authSub?: Subscription; 

  ngOnInit() {
    this.authSub = this.authService.checkAuth().subscribe();
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe(); 
  }
}
