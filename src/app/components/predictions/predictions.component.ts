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
        const locked = predictions.filter(p => p.isLocked);
        const matchMap = new Map(matches.map(m => [m.id, m]));

        const groupMap = new Map<number, PublicPrediction[]>();
        for (const p of locked) {
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

  phaseLabel(phase: string): string {
    const labels: Record<string, string> = {
      GROUP_STAGE: 'Fase de grupos', ROUND_OF_16: 'Octavos',
      QUARTER_FINALS: 'Cuartos', SEMI_FINALS: 'Semifinales',
      THIRD_PLACE: 'Tercer puesto', FINAL: 'Final'
    };
    return labels[phase] ?? phase;
  }
}
