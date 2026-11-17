import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Plaques } from './components/plaques/plaques';
import { Plaque } from './components/plaque/plaque';
import {Login} from './components/login/login';
import { Profile } from './components/profile/profile';
import { AdminUsers } from './components/admin-users/admin-users';
import { authGuard, adminGuard } from './services/auth-guards';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'plaques', component: Plaques },
  { path: 'plaques/:id', component: Plaque },
  { path: 'login', component: Login },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'admin/users', component: AdminUsers, canActivate: [adminGuard] }
];
