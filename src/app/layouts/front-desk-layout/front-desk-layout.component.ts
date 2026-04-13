import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-front-desk-layout',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <span class="hotel-name">Kekehyu Hotel</span>
      <span class="spacer"></span>
      <span class="user-name">{{ userName() }}</span>
      <button mat-icon-button (click)="authService.logout()" matTooltip="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: `
    .toolbar {
      background: #1a1a2e;
      color: white;
    }
    .hotel-name {
      font-weight: 600;
      font-size: 18px;
    }
    .spacer {
      flex: 1;
    }
    .user-name {
      margin-right: 8px;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 24px;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }
  `,
})
export class FrontDeskLayoutComponent {
  authService = inject(AuthService);

  userName = () => {
    const user = this.authService.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  };
}
