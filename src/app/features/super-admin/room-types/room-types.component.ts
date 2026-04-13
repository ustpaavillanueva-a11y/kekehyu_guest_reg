import { Component, OnInit, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RoomTypeService } from '../../../core/services/room-type.service';
import { RoomType } from '../../../core/models';

@Component({
  selector: 'app-room-types',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  template: `
    <h2>Room Types</h2>

    @if (showForm()) {
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ editing() ? 'Edit Room Type' : 'Add Room Type' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="roomForm" (ngSubmit)="onSave()" class="room-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input matInput formControlName="name" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
            <div class="form-actions">
              <button mat-button type="button" (click)="cancelForm()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="roomForm.invalid">
                {{ editing() ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    }

    <mat-card>
      <mat-card-header>
        <mat-card-title>All Room Types</mat-card-title>
        <button mat-raised-button color="primary" (click)="openAddForm()">
          <mat-icon>add</mat-icon> Add Room Type
        </button>
      </mat-card-header>
      <mat-card-content>
        <table mat-table [dataSource]="roomTypes()" class="full-width">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let rt">{{ rt.name }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let rt">{{ rt.description || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Active</th>
            <td mat-cell *matCellDef="let rt">
              <mat-slide-toggle [checked]="rt.isActive" (change)="toggleActive(rt)" color="primary" />
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let rt">
              <button mat-icon-button color="primary" (click)="edit(rt)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="delete(rt)">
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
    .room-form { padding: 16px 0; display: flex; flex-direction: column; gap: 16px; }
    .form-actions { display: flex; gap: 12px; }
    .full-width { width: 100%; }
    mat-card-header { display: flex; justify-content: space-between; align-items: center; }
  `,
})
export class RoomTypesComponent implements OnInit {
  roomTypes = signal<RoomType[]>([]);
  showForm = signal(false);
  editing = signal<RoomType | null>(null);
  displayedColumns = ['name', 'description', 'status', 'actions'];

  private fb = inject(FormBuilder);
  private roomTypeService = inject(RoomTypeService);
  private snackBar = inject(MatSnackBar);

  roomForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.roomTypeService.getAll().subscribe((data) => this.roomTypes.set(data));
  }

  openAddForm(): void {
    this.editing.set(null);
    this.roomForm.reset();
    this.showForm.set(true);
  }

  edit(rt: RoomType): void {
    this.editing.set(rt);
    this.roomForm.patchValue(rt);
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  onSave(): void {
    if (this.roomForm.invalid) return;

    const data = this.roomForm.getRawValue();
    const e = this.editing();
    const obs = e ? this.roomTypeService.update(e.id, data) : this.roomTypeService.create(data);

    obs.subscribe({
      next: () => {
        this.snackBar.open(e ? 'Updated' : 'Created', 'Close', { duration: 3000 });
        this.showForm.set(false);
        this.load();
      },
      error: () => this.snackBar.open('Failed', 'Close', { duration: 3000 }),
    });
  }

  toggleActive(rt: RoomType): void {
    this.roomTypeService.update(rt.id, { isActive: !rt.isActive }).subscribe({
      next: () => this.load(),
      error: () => this.snackBar.open('Toggle failed', 'Close', { duration: 3000 }),
    });
  }

  delete(rt: RoomType): void {
    if (!confirm(`Delete room type "${rt.name}"?`)) return;
    this.roomTypeService.delete(rt.id).subscribe({
      next: () => {
        this.snackBar.open('Deleted', 'Close', { duration: 3000 });
        this.load();
      },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 }),
    });
  }
}
