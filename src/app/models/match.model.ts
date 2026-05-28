export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: number;
  apiMatchId: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  startTime: string;
  endTime: string;
  status: string;
  phase: string;
  winningTeam: string;
  isLocked: boolean;
}

export interface Pronostico {
  idMatch: number;
  homeGoals: number;
  awayGoals: number;
  isDraw: boolean;
  winningTeam: string;
}

export enum TournamentPhase {
  GROUP_STAGE = 'GROUP_STAGE',
  ROUND_OF_16 = 'ROUND_OF_16',
  QUARTER_FINALS = 'QUARTER_FINALS',
  SEMI_FINALS = 'SEMI_FINALS',
  THIRD_PLACE = 'THIRD_PLACE',
  FINAL = 'FINAL'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  country: string;
}

export interface AuthResponse {
  token: string;
  email: string;
}

export interface LeaderboardEntry {
  rankPosition: number;
  fullName: string;
  totalPoints: number;
  exactMatchesCount: number;
  goalDiffMatchesCount: number;
  winnerMatchesCount: number;
}
