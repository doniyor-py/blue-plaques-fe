import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { authGuard, adminGuard } from './services/auth-guards';

const SITE = ' | Blue Plaques Explorer';

export const routes: Routes = [
  { path: '', component: Home, title: 'Blue Plaques Explorer' },
  { path: 'plaques', title: 'Browse plaques' + SITE,
    loadComponent: () => import('./components/plaques/plaques').then(m => m.Plaques) },
  { path: 'plaques/:id', title: 'Plaque' + SITE,
    loadComponent: () => import('./components/plaque/plaque').then(m => m.Plaque) },
  { path: 'nearby', title: 'Map' + SITE,
    loadComponent: () => import('./components/nearby/nearby').then(m => m.Nearby) },
  { path: 'insights', title: 'Insights' + SITE,
    loadComponent: () => import('./components/insights/insights').then(m => m.Insights) },
  { path: 'login', title: 'Log in' + SITE,
    loadComponent: () => import('./components/login/login').then(m => m.Login) },
  { path: 'signup', title: 'Sign up' + SITE,
    loadComponent: () => import('./components/signup/signup').then(m => m.Signup) },
  { path: 'forgot-password', title: 'Reset your password' + SITE,
    loadComponent: () => import('./components/forgot-password/forgot-password').then(m => m.ForgotPassword) },
  { path: 'profile', title: 'My profile' + SITE, canActivate: [authGuard],
    loadComponent: () => import('./components/profile/profile').then(m => m.Profile) },
  { path: 'account', title: 'Account settings' + SITE, canActivate: [authGuard],
    loadComponent: () => import('./components/account/account').then(m => m.Account) },
  { path: 'admin/users', title: 'Users' + SITE, canActivate: [adminGuard],
    loadComponent: () => import('./components/admin-users/admin-users').then(m => m.AdminUsers) },
  { path: 'admin/plaques/new', title: 'Add a plaque' + SITE, canActivate: [adminGuard],
    loadComponent: () => import('./components/plaque-form/plaque-form').then(m => m.PlaqueForm) },
  { path: 'admin/plaques/:id/edit', title: 'Edit plaque' + SITE, canActivate: [adminGuard],
    loadComponent: () => import('./components/plaque-form/plaque-form').then(m => m.PlaqueForm) },
  { path: 'admin/reports', title: 'Reports' + SITE, canActivate: [adminGuard],
    loadComponent: () => import('./components/admin-reports/admin-reports').then(m => m.AdminReports) },
  { path: 'terms', title: 'Terms of use' + SITE,
    loadComponent: () => import('./components/terms/terms').then(m => m.Terms) },
  { path: 'privacy', title: 'Privacy policy' + SITE,
    loadComponent: () => import('./components/privacy/privacy').then(m => m.Privacy) }
];
