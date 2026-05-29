import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { timer, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchService } from '../../services/match.service';
import { PronosticoService } from '../../services/pronostico.service';
import { Match, Pronostico, TournamentPhase, UserPrediction } from '../../models/match.model';
import { LocalTimePipe } from '../../pipes/local-time.pipe';

@Component({
  selector: 'app-final-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LocalTimePipe],
  templateUrl: './final-form.component.html',
  styleUrls: ['./final-form.component.scss']
})
export class FinalFormComponent implements OnInit {
  form!: FormGroup;
  match: Match | null = null;
  existingPrediction: UserPrediction | null = null;
  loading = true;
  error: string | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private pronosticoService: PronosticoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadData();
    this.form.get('homeGoals')!.valueChanges.subscribe(() => this.syncWinningTeamValidator());
    this.form.get('awayGoals')!.valueChanges.subscribe(() => this.syncWinningTeamValidator());
    timer(60_000, 60_000).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  get winner(): string {
    const h = this.form.get('homeGoals')?.value;
    const a = this.form.get('awayGoals')?.value;
    
    // Si es empate, no hay partido cargado, o los inputs están incompletos, no hay ganador automático
    if (this.isDraw || !this.match || h === null || h === '' || a === null || a === '') {
      return '';
    }
    
    return Number(h) > Number(a) ? this.match.homeTeam : this.match.awayTeam;
  }

  selectDrawWinner(team: string): void {
    this.form.get('winningTeam')!.setValue(team);
    this.cdr.markForCheck();
  }

  private syncWinningTeamValidator(): void {
    const ctrl = this.form.get('winningTeam')!;
    
    if (this.isDraw) {
      // Si es empate, requerimos seleccionar ganador manualmente
      ctrl.setValidators([Validators.required]);
      
      // Solo reseteamos si no está ya vacío para evitar saltos innecesarios
      if (ctrl.value !== '') {
        ctrl.setValue('', { emitEvent: false });
      }
    } else {
      // Si no es empate, auto-asignamos al ganador y quitamos validadores
      ctrl.clearValidators();
      const currentWinner = this.winner;
      
      if (ctrl.value !== currentWinner) {
        ctrl.setValue(currentWinner, { emitEvent: false });
      }
    }
    
    ctrl.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();
  }

  buildForm(): void {
    const integer = (c: import('@angular/forms').AbstractControl) => {
      const val = c.value;
      if (val === null || val === undefined || val === '') {
        return null;
      }
      const num = Number(val);
      return !Number.isInteger(num) ? { integer: true } : null;
    };

    this.form = this.fb.group({
      homeGoals: [null, [Validators.required, Validators.min(0), Validators.max(30), integer]],
      awayGoals: [null, [Validators.required, Validators.min(0), Validators.max(30), integer]],
      winningTeam: ['', Validators.required]
    });
  }

  loadData(): void {
    forkJoin({
      matches: this.matchService.getMatchByPhase(TournamentPhase.FINAL),
      predictions: this.pronosticoService.getMyPredictions()
    }).subscribe({
      next: ({ matches, predictions }) => {
        this.match = matches[0] ?? null;
        if (this.match) {
          this.existingPrediction = predictions.find(p => p.matchId === this.match!.id) ?? null;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'No se pudo cargar el partido de la final.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get timeUntilDeadline(): string {
    if (!this.match) return '';
    const msLeft = new Date(this.match.startTime).getTime() - Date.now() - 24 * 60 * 60 * 1000;
    if (msLeft <= 0) return '';
    const totalMin = Math.floor(msLeft / 60_000);
    const days  = Math.floor(totalMin / (60 * 24));
    const hours = Math.floor((totalMin % (60 * 24)) / 60);
    const mins  = totalMin % 60;
    if (days > 0)  return `${days}d ${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min`;
  }

  get isClosed(): boolean {
    if (!this.match) return false;
    if (this.match.isLocked) return true;
    const hoursUntil = (new Date(this.match.startTime).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil <= 24;
  }

  get isDraw(): boolean {
    const h = this.form.get('homeGoals')?.value;
    const a = this.form.get('awayGoals')?.value;
    
    // Si alguno de los campos es nulo o está vacío, no evaluamos el empate
    if (h === null || h === '' || a === null || a === '') {
      return false;
    }
    
    return Number(h) === Number(a);
  }

  onSubmit(): void {
    if (this.form.invalid || !this.match) return;
    this.error = null;

    const draw = this.isDraw;
    const pronostico: Pronostico = {
      idMatch: this.match.id,
      homeGoals: this.form.value.homeGoals,
      awayGoals: this.form.value.awayGoals,
      isDraw: draw,
      winningTeam: this.form.value.winningTeam
    };

    this.pronosticoService.enviarPronostico(pronostico).subscribe({
      next: (saved: any) => {
        this.existingPrediction = saved ?? {
          id: 0, userId: 0, matchId: this.match!.id,
          homeGoals: pronostico.homeGoals,
          awayGoals: pronostico.awayGoals,
          pointsEarned: 0,
          isDraw: draw,
          winningTeam: pronostico.winningTeam
        };
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al enviar el pronóstico.';
        this.cdr.markForCheck();
      }
    });
  }
}