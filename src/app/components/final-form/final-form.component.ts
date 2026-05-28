import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchService } from '../../services/match.service';
import { PronosticoService } from '../../services/pronostico.service';
import { Match, Pronostico, TournamentPhase } from '../../models/match.model';

@Component({
  selector: 'app-final-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './final-form.component.html',
  styleUrls: ['./final-form.component.scss']
})
export class FinalFormComponent implements OnInit {
  form!: FormGroup;
  match: Match | null = null;
  loading = true;
  submitted = false;
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
    this.loadMatch();
    this.form.get('homeGoals')!.valueChanges.subscribe(() => this.syncWinningTeamValidator());
    this.form.get('awayGoals')!.valueChanges.subscribe(() => this.syncWinningTeamValidator());
    // Refresh countdown every minute
    timer(60_000, 60_000).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  get winner(): string {
    const h = Number(this.form.value.homeGoals);
    const a = Number(this.form.value.awayGoals);
    if (this.isDraw || !this.match) return '';
    return h > a ? this.match.homeTeam : this.match.awayTeam;
  }

  selectDrawWinner(team: string): void {
    this.form.get('winningTeam')!.setValue(team);
    this.cdr.markForCheck();
  }

  private syncWinningTeamValidator(): void {
    const ctrl = this.form.get('winningTeam')!;
    if (this.isDraw) {
      ctrl.setValidators(Validators.required);
      ctrl.setValue('', { emitEvent: false });
    } else {
      ctrl.clearValidators();
      ctrl.setValue(this.winner, { emitEvent: false });
    }
    ctrl.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();
  }

  buildForm(): void {
    this.form = this.fb.group({
      homeGoals: [null, [Validators.required, Validators.min(0)]],
      awayGoals: [null, [Validators.required, Validators.min(0)]],
      winningTeam: ['', Validators.required]
    });
  }

  loadMatch(): void {
    this.matchService.getMatchByPhase(TournamentPhase.FINAL).subscribe({
      next: (matches) => {
        this.match = matches[0];
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
    const h = this.form.value.homeGoals;
    const a = this.form.value.awayGoals;
    return h !== null && a !== null && Number(h) === Number(a);
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
      next: () => {
        this.submitted = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al enviar el pronóstico.';
        this.cdr.markForCheck();
      }
    });
  }

  resetForm(): void {
    this.submitted = false;
    this.error = null;
    this.form.reset();
  }
}
