import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    HeaderComponent,
  ],
  template: `
    <mat-sidenav-container class="main-layout">
      <mat-sidenav
        [mode]="sidenavMode()"
        [opened]="sidenavOpened()"
        (openedChange)="sidenavOpened.set($event)"
        class="sidenav"
      >
        <app-sidebar (menuItemClick)="onMenuItemClick()" />
      </mat-sidenav>

      <mat-sidenav-content>
        <app-header (toggleSidenav)="toggleSidenav()" />
        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .main-layout {
      height: 100vh;
    }

    .sidenav {
      width: 280px;
      background: #1a1a2e;
    }

    .content {
      padding: 24px;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }
  `,
})
export class MainLayoutComponent {
  sidenavOpened = signal(true);
  sidenavMode = signal<'side' | 'over'>('side');

  toggleSidenav(): void {
    this.sidenavOpened.update((v) => !v);
  }

  onMenuItemClick(): void {
    if (this.sidenavMode() === 'over') {
      this.sidenavOpened.set(false);
    }
  }
}
