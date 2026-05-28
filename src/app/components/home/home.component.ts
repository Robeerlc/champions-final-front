import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OngoingMatchesComponent } from '../ongoing-matches/ongoing-matches.component';
import { UpcomingMatchesComponent } from '../upcoming-matches/upcoming-matches.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, OngoingMatchesComponent, UpcomingMatchesComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {}
