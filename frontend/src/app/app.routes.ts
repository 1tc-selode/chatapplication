import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { ChatLayout } from './features/chat/chat-layout/chat-layout';
import { AdminPanel } from './features/admin/admin-panel/admin-panel';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { 
    path: 'chat', 
    component: ChatLayout,
    canActivate: [authGuard]
  },
  { 
    path: 'admin', 
    component: AdminPanel,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
