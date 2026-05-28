import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardService } from '../../services/leaderboard.service';
import { LeaderboardEntry } from '../../models/match.model';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss']
})
export class RankingComponent implements OnInit {
  entries: LeaderboardEntry[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private leaderboardService: LeaderboardService,
    private cdr: ChangeDetectorRef
  ) {}

  getRowClass(entry: LeaderboardEntry): string {
    if (entry.exactMatchesCount > 0)     return 'row-exact';
    if (entry.goalDiffMatchesCount > 0)  return 'row-diff';
    if (entry.winnerMatchesCount > 0)    return 'row-winner';
    return 'row-none';
  }

  ngOnInit(): void {
    this.leaderboardService.getLeaderboard().subscribe({
      next: (data) => {
        this.entries = data.slice(0, 10);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No se pudo cargar el ranking.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
