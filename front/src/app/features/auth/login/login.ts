import { Component, inject, OnDestroy } from '@angular/core'; // 👈 Ajout OnDestroy
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth-service';
import { Subscription } from 'rxjs'; // 👈 Ajout Subscription

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  private loginSubscription?: Subscription;
  errorMessage: string | null = null;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.getRawValue();
      
      // On stocke l'abonnement
      this.loginSubscription = this.authService.login(credentials).subscribe({
        next: (response) => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }
}