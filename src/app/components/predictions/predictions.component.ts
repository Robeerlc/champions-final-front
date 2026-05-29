import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatchService } from '../../services/match.service';
import { PronosticoService } from '../../services/pronostico.service';
import { Match, PublicPrediction } from '../../models/match.model';
import { LocalTimePipe } from '../../pipes/local-time.pipe';

interface PredictionGroup {
  match: Match;
  predictions: PublicPrediction[];
}

@Component({
  selector: 'app-predictions',
  standalone: true,
  imports: [CommonModule, LocalTimePipe],
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss']
})
export class PredictionsComponent implements OnInit {
  groups: PredictionGroup[] = [];
  loading = true;
  error: string | null = null;

  filterWinner = 'all';
  filterDraw = 'all'; // 'all' | 'draw' | 'nodraw'

  constructor(
    private matchService: MatchService,
    private pronosticoService: PronosticoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      matches: this.matchService.getAllMatches(),
      predictions: this.pronosticoService.getAllPredictions()
    }).subscribe({
      next: ({ matches, predictions }) => {
        const matchMap = new Map(matches.map(m => [m.id, m]));

        const groupMap = new Map<number, PublicPrediction[]>();
        for (const p of predictions) {
          if (!groupMap.has(p.matchId)) groupMap.set(p.matchId, []);
          groupMap.get(p.matchId)!.push(p);
        }

        this.groups = Array.from(groupMap.entries())
          .filter(([id]) => matchMap.has(id))
          .map(([id, preds]) => ({ match: matchMap.get(id)!, predictions: preds }))
          .sort((a, b) => new Date(a.match.startTime).getTime() - new Date(b.match.startTime).getTime());

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron cargar las predicciones.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get teamOptions(): string[] {
    const teams = new Set<string>();
    this.groups.forEach(g => {
      teams.add(g.match.homeTeam);
      teams.add(g.match.awayTeam);
    });
    return Array.from(teams);
  }

  filteredPredictions(group: PredictionGroup): PublicPrediction[] {
    return group.predictions.filter(p => {
      if (this.filterWinner !== 'all' && p.winningTeam !== this.filterWinner) return false;
      if (this.filterDraw === 'draw' && !p.isDraw) return false;
      if (this.filterDraw === 'nodraw' && p.isDraw) return false;
      return true;
    });
  }

  get hasAnyResults(): boolean {
    return this.groups.some(g => this.filteredPredictions(g).length > 0);
  }

  phaseLabel(phase: string): string {
    const labels: Record<string, string> = {
      GROUP_STAGE: 'Fase de grupos', ROUND_OF_16: 'Octavos',
      QUARTER_FINALS: 'Cuartos', SEMI_FINALS: 'Semifinales',
      THIRD_PLACE: 'Tercer puesto', FINAL: 'Final'
    };
    return labels[phase] ?? phase;
  }
}
