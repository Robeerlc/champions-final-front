import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaderboardEntry } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private baseUrl = isDevMode() ? 'http://localhost:8080/api' : '/api';

  constructor(private http: HttpClient) {}

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboard`);
  }
}