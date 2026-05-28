import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { timer, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchService } from '../../services/match.service';
import { Match } from '../../models/match.model';

const LIVE_STATUSES = ['IN_PLAY', 'LIVE', 'EXTRA_TIME', 'PENALTY', 'PAUSED', 'HALFTIME'];
const DONE_STATUSES = ['FINISHED', 'FULL_TIME', 'SUSPENDED', 'POSTPONED'];
const STATUS_LABELS: Record<string, string> = {
  TIMED: 'Programado', SCHEDULED: 'Programado', PENDING: 'Programado',
  IN_PLAY: 'En juego',  LIVE: 'En juego',
  PAUSED: 'Descanso',   HALFTIME: 'Descanso',
  FINISHED: 'Finalizado', FULL_TIME: 'Finalizado',
  EXTRA_TIME: 'Prórroga', PENALTY: 'Penaltis',
  SUSPENDED: 'Suspendido', POSTPONED: 'Aplazado',
};

@Component({
  selector: 'app-ongoing-matches',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ongoing-matches.component.html',
  styleUrls: ['./ongoing-matches.component.scss']
})
export class OngoingMatchesComponent implements OnInit {
  matches: Match[] = [];
  loading = true;
  error: string | null = null;

  private destroyRef = inject(DestroyRef);
  private currentInterval = 15_000;

  constructor(private matchService: MatchService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.startPolling();
  }

  private startPolling(): void {
    timer(0, this.currentInterval).pipe(
      switchMap(() => this.matchService.getOngoingMatches().pipe(catchError(() => of(null)))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      if (data === null) {
        if (this.loading) { this.error = 'No se pudo cargar.'; this.loading = false; }
      } else {
        this.matches = data;
        this.loading = false;
        this.error = null;
      }
      this.cdr.markForCheck();
    });
  }

  statusLabel(match: Match): string {
    return STATUS_LABELS[match.status] ?? match.status;
  }

  statusClass(match: Match): string {
    if (LIVE_STATUSES.includes(match.status)) return 'live';
    if (DONE_STATUSES.includes(match.status)) return 'finished';
    return 'scheduled';
  }

  scoreVisible(match: Match): boolean {
    return [...LIVE_STATUSES, ...DONE_STATUSES].includes(match.status);
  }
}
