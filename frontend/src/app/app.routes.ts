import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/users.component').then((m) => m.AdminUsersComponent),
      },
      {
        path: 'rates',
        loadComponent: () =>
          import('./features/admin/rates/rates.component').then((m) => m.AdminRatesComponent),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./features/admin/sessions/sessions.component').then(
            (m) => m.AdminSessionsComponent,
          ),
      },
      {
        path: 'sessions/new',
        loadComponent: () =>
          import('./features/admin/sessions/new-session.component').then(
            (m) => m.NewSessionComponent,
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/analytics/analytics.component').then(
            (m) => m.AnalyticsComponent,
          ),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./features/admin/admin-reservations/admin-reservations.component').then(
            (m) => m.AdminReservationsComponent,
          ),
      },
    ],
  },
  {
    path: 'player',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/player/dashboard/player-dashboard.component').then(
            (m) => m.PlayerDashboardComponent,
          ),
      },
      {
        path: 'directory',
        loadComponent: () =>
          import('./features/player/member-directory/member-directory.component').then(
            (m) => m.MemberDirectoryComponent,
          ),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./features/player/profile/profile-edit.component').then(
            (m) => m.ProfileEditComponent,
          ),
      },
      {
        path: 'reserve',
        loadComponent: () =>
          import('./features/player/reserve-court/reserve-court.component').then(
            (m) => m.ReserveCourtComponent,
          ),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./features/player/my-reservations/my-reservations.component').then(
            (m) => m.MyReservationsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
