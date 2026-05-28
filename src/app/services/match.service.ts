import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match, TournamentPhase } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private baseUrl = 'https://porramundialmetrica-championsfinalback-w-59fd54-193-70-44-51.sslip.io/api';

  constructor(private http: HttpClient) {}

  getAllMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches`);
  }

  getOngoingMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches/ongoing`);
  }

  getMatchByPhase(phase: TournamentPhase): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches/phase/${phase}`);
  }
}
