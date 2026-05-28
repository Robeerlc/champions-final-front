import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaderboardEntry } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private baseUrl = 'https://porramundialmetrica-championsfinalback-w-59fd54-193-70-44-51.sslip.io/api';

  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboard`);
  }
}
