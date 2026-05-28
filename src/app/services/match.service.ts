import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Match, TournamentPhase } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private baseUrl = 'https://porramundialmetrica-championsfinalback-w-59fd54-193-70-44-51.sslip.io/api';

  constructor(private http: HttpClient) {}

  private asUtc(t: string): string {
    return t && !t.endsWith('Z') && !t.includes('+') ? t + 'Z' : t;
  }

  private normalize(m: Match): Match {
    return { ...m, startTime: this.asUtc(m.startTime), endTime: this.asUtc(m.endTime) };
  }

  getAllMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches`).pipe(map(list => list.map(m => this.normalize(m))));
  }

  getOngoingMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches/ongoing`).pipe(map(list => list.map(m => this.normalize(m))));
  }

  getMatchByPhase(phase: TournamentPhase): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.baseUrl}/matches/phase/${phase}`).pipe(map(list => list.map(m => this.normalize(m))));
  }
}
