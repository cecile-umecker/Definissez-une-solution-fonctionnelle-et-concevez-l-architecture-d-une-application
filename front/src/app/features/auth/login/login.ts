import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  errorMessage: string | null = null;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      // On récupère les valeurs typées
      const credentials = this.loginForm.getRawValue();
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login réussi', response);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Erreur de login', err);
          this.errorMessage = 'Email ou mot de passe incorrect.';
        }
      });
    }
  }
}