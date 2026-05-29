import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  showLoginPassword = false;
  showRegisterPassword = false;
  showSuccessModal = false;
  registeredEmail = '';

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

    const allowed = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžæÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'\-]+$/;
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(allowed)]],
      lastName: ['', [Validators.required, Validators.pattern(allowed)]],
      username: ['', [Validators.required, Validators.pattern(allowed)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(allowed)]],
      country: ['SPAIN', Validators.required]
    });
    this.registerForm.get('country')!.disable();
  }

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.error = null;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.setMode('login');
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

    const { username, password, firstName, lastName, country } = this.registerForm.getRawValue();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const email = `${username}@metrica-global.com`;
    this.authService.register({ email, password, fullName, country }).subscribe({
      next: () => {
        this.registeredEmail = email;
        this.showSuccessModal = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        const springErrors = err?.error?.errors;
        if (Array.isArray(springErrors) && springErrors.length > 0) {
          this.error = springErrors.map((e: any) => e.defaultMessage).join(' · ');
        } else {
          this.error = err?.error?.message?.includes('Validation failed')
            ? 'Revisa los campos introducidos.'
            : (err?.error?.message || 'Error al registrarse.');
        }
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
