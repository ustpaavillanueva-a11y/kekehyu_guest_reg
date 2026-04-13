import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Auth layout (no sidebar)
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Main layout (with sidebar)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      // Dashboard - Admin & Super Admin
      {
        path: 'dashboard',
        canActivate: [roleGuard('admin', 'super_admin')],
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },

      // Guest Registration - Front Desk & Super Admin
      {
        path: 'guest-registration',
        canActivate: [roleGuard('front_desk', 'super_admin')],
        loadComponent: () =>
          import('./features/front-desk/guest-registration/guest-registration.component').then((m) => m.GuestRegistrationComponent),
      },

      // My Registrations - Front Desk
      {
        path: 'my-registrations',
        canActivate: [roleGuard('front_desk')],
        loadComponent: () =>
          import('./features/front-desk/my-registrations/my-registrations.component').then((m) => m.MyRegistrationsComponent),
      },

      // Guest List - Admin & Super Admin
      {
        path: 'guests',
        canActivate: [roleGuard('admin', 'super_admin')],
        loadComponent: () => import('./features/admin/guest-list/guest-list.component').then((m) => m.GuestListComponent),
      },
      {
        path: 'guests/:period',
        canActivate: [roleGuard('admin', 'super_admin')],
        loadComponent: () => import('./features/admin/guest-list/guest-list.component').then((m) => m.GuestListComponent),
      },

      // Front Desk Activity - Admin & Super Admin
      {
        path: 'activity/:period',
        canActivate: [roleGuard('admin', 'super_admin')],
        loadComponent: () =>
          import('./features/admin/front-desk-activity/front-desk-activity.component').then((m) => m.FrontDeskActivityComponent),
      },

      // User Management - Super Admin
      {
        path: 'users',
        canActivate: [roleGuard('super_admin')],
        loadComponent: () =>
          import('./features/super-admin/user-management/user-management.component').then((m) => m.UserManagementComponent),
      },
      {
        path: 'users/add',
        canActivate: [roleGuard('super_admin')],
        loadComponent: () =>
          import('./features/super-admin/user-management/user-management.component').then((m) => m.UserManagementComponent),
      },

      // Room Types - Super Admin
      {
        path: 'room-types',
        canActivate: [roleGuard('super_admin')],
        loadComponent: () =>
          import('./features/super-admin/room-types/room-types.component').then((m) => m.RoomTypesComponent),
      },

      // Policies - Super Admin
      {
        path: 'policies',
        canActivate: [roleGuard('super_admin')],
        loadComponent: () =>
          import('./features/super-admin/policies/policies.component').then((m) => m.PoliciesComponent),
      },

      // Hotel Settings - Super Admin
      {
        path: 'settings',
        canActivate: [roleGuard('super_admin')],
        loadComponent: () =>
          import('./features/super-admin/settings/hotel-settings.component').then((m) => m.HotelSettingsComponent),
      },
    ],
  },

  // Wildcard
  { path: '**', redirectTo: 'login' },
];
