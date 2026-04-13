import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HotelSettingsService } from '../../../core/services/hotel-settings.service';
import { PolicyTemplate } from '../../../core/models';

@Component({
  selector: 'app-policies',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  template: `
    <h2>Policy Management</h2>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editing() ? 'Edit Policy' : 'Add Policy' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="policyForm" (ngSubmit)="onSave()" class="policy-form">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option value="housekeeping">Housekeeping</mat-option>
                  <mat-option value="hotel">Hotel</mat-option>
                  <mat-option value="data_privacy">Data Privacy</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Code</mat-label>
                <input matInput formControlName="code" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Display Order</mat-label>
                <input matInput formControlName="displayOrder" type="number" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Content</mat-label>
              <textarea matInput formControlName="content" rows="4"></textarea>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="cancelForm()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="policyForm.invalid">
                {{ editing() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <mat-card>
      <mat-card-header>
        <mat-card-title>All Policies</mat-card-title>
        <button mat-raised-button color="primary" (click)="openAddForm()">
          <mat-icon>add</mat-icon> Add Policy
        </button>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="policies()" class="full-width">
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let p">{{ p.category }}</td>
          </ng-container>

          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let p">{{ p.code }}</td>
          </ng-container>

          <ng-container matColumnDef="content">
            <th mat-header-cell *matHeaderCellDef>Content</th>
            <td mat-cell *matCellDef="let p" class="content-cell">{{ p.content }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Active</th>
            <td mat-cell *matCellDef="let p">
              <mat-slide-toggle [checked]="p.isActive" (change)="toggleActive(p)" color="primary" />
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let p">
              <button mat-icon-button color="primary" (click)="edit(p)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="delete(p)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    h2 { margin-bottom: 24px; color: #1a1a2e; }
    .form-card { margin-bottom: 24px; }
    .policy-form { padding: 16px 0; display: flex; flex-direction: column; gap: 16px; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    .form-actions { display: flex; gap: 12px; }
    .full-width { width: 100%; }
    .content-cell { max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
  `,
})
export class PoliciesComponent implements OnInit {
  policies = signal<PolicyTemplate[]>([]);
  showForm = signal(false);
  editing = signal<PolicyTemplate | null>(null);
  displayedColumns = ['category', 'code', 'content', 'status', 'actions'];

  private fb = inject(FormBuilder);
  private settingsService = inject(HotelSettingsService);
  private snackBar = inject(MatSnackBar);

  policyForm = this.fb.nonNullable.group({
    category: ['housekeeping' as 'housekeeping' | 'hotel' | 'data_privacy', Validators.required],
    code: ['', Validators.required],
    content: ['', Validators.required],
    displayOrder: [0],
  });

  constructor() {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.settingsService.getPolicies().subscribe((data) => this.policies.set(data));
  }

  openAddForm(): void {
    this.editing.set(null);
    this.policyForm.reset({ category: 'housekeeping', displayOrder: 0 });
    this.showForm.set(true);
  }

  edit(p: PolicyTemplate): void {
    this.editing.set(p);
    this.policyForm.patchValue(p as any);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  onSave(): void {
    if (this.policyForm.invalid) return;
    const data = this.policyForm.getRawValue();
    const e = this.editing();
    const obs = e
      ? this.settingsService.updatePolicy(e.id, data)
      : this.settingsService.createPolicy(data);

    obs.subscribe({
      next: () => {
        this.snackBar.open(e ? 'Updated' : 'Created', 'Close', { duration: 3000 });
        this.showForm.set(false);
        this.load();
      },
      error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
    });
  }

  toggleActive(p: PolicyTemplate): void {
    this.settingsService.updatePolicy(p.id, { isActive: !p.isActive }).subscribe({
      next: () => this.load(),
      error: () => this.snackBar.open('Toggle failed', 'Close', { duration: 3000 }),
    });
  }

  delete(p: PolicyTemplate): void {
    if (!confirm(`Delete policy "${p.code}"?`)) return;
    this.settingsService.deletePolicy(p.id).subscribe({
      next: () => {
        this.snackBar.open('Deleted', 'Close', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 }),
    });
  }
}
