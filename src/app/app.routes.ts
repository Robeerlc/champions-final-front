
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { FinalFormComponent } from './components/final-form/final-form.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { ChatComponent } from './components/chat/chat.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',           component: HomeComponent,      canActivate: [authGuard]  },
  { path: 'login',      component: AuthComponent,      canActivate: [guestGuard] },
  { path: 'pronostico', component: FinalFormComponent,  canActivate: [authGuard]  },
  { path: 'ranking',    component: RankingComponent,    canActivate: [authGuard]  },
  { path: 'chat',       component: ChatComponent,       canActivate: [authGuard]  },
  { path: '**',         redirectTo: ''                                             }
];
