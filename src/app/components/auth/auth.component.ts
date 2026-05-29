import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  error: string | null = null;
  loading = false;
  showRegisterPassword = false;

  private noBlankOrEmoji(c: AbstractControl): ValidationErrors | null {
    const v: string = c.value ?? '';
    if (!v.trim()) return { blank: true };
    if (/[\x00-\x1F\x7F­​-‏  ﻿]/.test(v)) return { invisible: true };
    if (/\p{Extended_Pictographic}/u.test(v)) return { emoji: true };
    return null;
  }

  countries = [
    'SPAIN', 'FRANCE', 'GERMANY', 'ITALY', 'ENGLAND',
    'PORTUGAL', 'NETHERLANDS', 'BELGIUM', 'ARGENTINA', 'BRAZIL', 'OTHER'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['',  Validators.required]
    });

    const v = [Validators.required, this.noBlankOrEmoji.bind(this)];
    this.registerForm = this.fb.group({
      fullName: ['', v],
      username: ['', v],
      password: ['', v],
      country: ['SPAIN', Validators.required]
    });
  }

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.error = null;
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = null;

    const { username, password } = this.loginForm.value;
    this.authService.login({ email: `${username}@metrica-global.com`, password }).subscribe({
      next: () => { this.router.navigate(['/pronostico']); },
      error: (err) => {
        this.error = err?.error?.message || 'Email o contraseña incorrectos.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.error = null;

    const { username, password, fullName, country } = this.registerForm.value;
    const email = `${username}@metrica-global.com`;
    this.authService.register({ email, password, fullName, country }).subscribe({
      next: () => {
        this.authService.login({ email, password }).subscribe({
          next: () => { this.router.navigate(['/pronostico']); },
          error: () => {
            this.loading = false;
            this.setMode('login');
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al registrarse.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
