import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pronostico } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class PronosticoService {
  private baseUrl = isDevMode() ? 'http://localhost:8080/api' : '/api';

  constructor(private http: HttpClient) {}

  enviarPronostico(pronostico: Pronostico): Observable<any> {
    return this.http.post(`${this.baseUrl}/pronosticos`, pronostico);
  }
}