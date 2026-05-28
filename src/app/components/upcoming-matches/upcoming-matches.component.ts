import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { timer, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchService } from '../../services/match.service';
import { Match } from '../../models/match.model';

const LIVE_STATUSES = ['IN_PLAY', 'LIVE', 'EXTRA_TIME', 'PENALTY', 'PAUSED', 'HALFTIME'];
const DONE_STATUSES = ['FINISHED', 'FULL_TIME', 'SUSPENDED', 'POSTPONED'];
const PHASE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Fase de grupos',
  ROUND_OF_16: 'Octavos',
  QUARTER_FINALS: 'Cuartos',
  SEMI_FINALS: 'Semifinales',
  THIRD_PLACE: 'Tercer puesto',
  FINAL: 'Final',
};

@Component({
  selector: 'app-upcoming-matches',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upcoming-matches.component.html',
  styleUrls: ['./upcoming-matches.component.scss']
})
export class UpcomingMatchesComponent implements OnInit {
  matches: Match[] = [];
  loading = true;
  error: string | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(private matchService: MatchService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Poll data every 5 min; recalculate urgency colors every minute
    timer(0, 5 * 60_000).pipe(
      switchMap(() => this.matchService.getAllMatches().pipe(catchError(() => of(null)))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      if (data === null) {
        if (this.loading) { this.error = 'No se pudo cargar.'; this.loading = false; }
      } else {
        const now = Date.now();
        const limit = now + 5 * 24 * 60 * 60 * 1000;
        this.matches = data
          .filter(m => {
            const start = new Date(m.startTime).getTime();
            const isUpcoming = !LIVE_STATUSES.includes(m.status) && !DONE_STATUSES.includes(m.status);
            return isUpcoming && start >= now && start <= limit;
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        this.loading = false;
        this.error = null;
      }
      this.cdr.markForCheck();
    });

    // Recalculate colors every minute without re-fetching
    timer(60_000, 60_000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.cdr.markForCheck());
  }

  phaseLabel(phase: string): string {
    return PHASE_LABELS[phase] ?? phase;
  }

  hoursUntil(match: Match): number {
    return (new Date(match.startTime).getTime() - Date.now()) / (1000 * 60 * 60);
  }

  // Deadline = 24h before kickoff
  // 0 = normal (>48h to go), 1 = closed (≤24h to go)
  urgency(match: Match): number {
    if (match.isLocked) return 1;
    const h = this.hoursUntil(match);
    if (h <= 24) return 1;  // past deadline
    if (h >= 48) return 0;  // more than 24h until deadline
    return 1 - (h - 24) / 24; // gradient between 48h and 24h
  }

  isClosedForPredictions(match: Match): boolean {
    return match.isLocked || this.hoursUntil(match) <= 24;
  }

  // Interpolate border: #30363d → #da3633
  borderColor(match: Match): string {
    const u = this.urgency(match);
    const r = Math.round(48  + u * 170);
    const g = Math.round(54  + u * 0);
    const b = Math.round(61  - u * 10);
    return `rgb(${r},${g},${b})`;
  }

  bgColor(match: Match): string {
    const u = this.urgency(match);
    return `rgba(218,54,51,${(u * 0.1).toFixed(3)})`;
  }

  urgencyLabel(match: Match): string {
    const hToDeadline = this.hoursUntil(match) - 24;
    if (hToDeadline <= 0)  return 'Cerrado';
    if (hToDeadline < 1)   return `Cierra en ${Math.round(hToDeadline * 60)}min`;
    return `Cierra en ${Math.round(hToDeadline)}h`;
  }
}
