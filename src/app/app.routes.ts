import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Plaques } from './components/plaques/plaques';
import { Plaque } from './components/plaque/plaque';
import {Login} from './components/login/login';
import { Profile } from './components/profile/profile';
import { AdminUsers } from './components/admin-users/admin-users';
import { authGuard, adminGuard } from './services/auth-guards';
import { Signup } from './components/signup/signup';
import { PlaqueForm } from './components/plaque-form/plaque-form';
import { AdminReports } from './components/admin-reports/admin-reports';
import { Nearby } from './components/nearby/nearby';
import { Insights } from './components/insights/insights';
import { Account } from './components/account/account';
import { ForgotPassword } from './components/forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'plaques', component: Plaques },
  { path: 'plaques/:id', component: Plaque },
  { path: 'login', component: Login },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'signup', component: Signup },
  { path: 'admin/users', component: AdminUsers, canActivate: [adminGuard] },
  { path: 'admin/plaques/new', component: PlaqueForm, canActivate: [adminGuard] },
  { path: 'admin/plaques/:id/edit', component: PlaqueForm, canActivate: [adminGuard] },
  { path: 'admin/reports', component: AdminReports, canActivate: [adminGuard] },
  { path: 'nearby', component: Nearby },
  { path: 'insights', component: Insights },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'account', component: Account, canActivate: [authGuard] }
];
