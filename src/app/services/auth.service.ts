import { Injectable, isDevMode } from '@angular/core'; // <-- Añade isDevMode aquí
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = isDevMode() ? 'http://localhost:8080/api' : '/api';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, data).pipe(
      tap(res => localStorage.setItem(this.tokenKey, res.token))
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}