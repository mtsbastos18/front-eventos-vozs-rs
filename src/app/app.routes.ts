import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/public/landing-page/landing-page';
import { EventDetailsComponent } from './features/public/event-details/event-details';
import { LoginComponent } from './features/admin/login/login';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { EventManagementComponent } from './features/admin/event-management/event-management';
import { ParticipantListComponent } from './features/admin/participant-list/participant-list';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'inscricao/:id', component: EventDetailsComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'events', component: EventManagementComponent },
      { path: 'events/:id/participants', component: ParticipantListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
