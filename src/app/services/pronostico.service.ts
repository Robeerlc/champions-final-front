import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { of } from 'rxjs';
import { Pronostico, PublicPrediction } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class PronosticoService {
  private baseUrl = 'https://porramundialmetrica-championsfinalback-w-59fd54-193-70-44-51.sslip.io/api';

  constructor(private http: HttpClient) {}

  enviarPronostico(pronostico: Pronostico): Observable<any> {
    return this.http.post(`${this.baseUrl}/predictions`, pronostico).pipe(
      tap(res => console.log('Pronóstico enviado:', res)),
      catchError(err => {
        console.error('Error al enviar pronóstico:', err);
        throw err;
      })
    );
  }

  getMyPredictions(): Observable<PublicPrediction[]> {
    console.log('Llamando a getMyPredictions...');
    return this.http.get<PublicPrediction[]>(`${this.baseUrl}/predictions/me`).pipe(
      tap(res => console.log('Predicciones recibidas:', res)),
      catchError(err => {
        console.error('Error al obtener mis predicciones:', err);
        throw err;
      })
    );
  }

  getAllPredictions(): Observable<PublicPrediction[]> {
    return this.http.get<PublicPrediction[]>(`${this.baseUrl}/predictions`).pipe(
      tap(res => console.log('Todas las predicciones recibidas:', res)),
      catchError(err => {
        console.error('Error al obtener todas las predicciones:', err);
        throw err;
      })
    );
  }
}
