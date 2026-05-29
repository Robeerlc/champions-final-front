import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pronostico, UserPrediction, PublicPrediction } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class PronosticoService {
  private baseUrl = 'https://porramundialmetrica-championsfinalback-w-59fd54-193-70-44-51.sslip.io/api';

  constructor(private http: HttpClient) {}

  enviarPronostico(pronostico: Pronostico): Observable<any> {
    return this.http.post(`${this.baseUrl}/predictions`, pronostico);
  }

  getMyPredictions(): Observable<UserPrediction[]> {
    return this.http.get<UserPrediction[]>(`${this.baseUrl}/predictions/me`);
  }

  getAllPredictions(): Observable<PublicPrediction[]> {
    return this.http.get<PublicPrediction[]>(`${this.baseUrl}/predictions`);
  }
}
