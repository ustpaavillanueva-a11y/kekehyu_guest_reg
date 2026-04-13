import { Component, signal, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';
import { SignaturePadComponent } from '../../../shared/components/signature-pad/signature-pad.component';
import { GuestService } from '../../../core/services/guest.service';
import { RoomTypeService } from '../../../core/services/room-type.service';
import { HotelSettingsService } from '../../../core/services/hotel-settings.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoomType, HotelSettings } from '../../../core/models';

@Component({
  selector: 'app-guest-registration',
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    SignaturePadComponent,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <h2>Guest Registration</h2>

    <mat-stepper linear #stepper>
      <!-- Step 1: Guest Information -->
      <mat-step [stepControl]="guestInfoForm">
        <ng-template matStepLabel>Guest Information</ng-template>

        <form [formGroup]="guestInfoForm" class="step-form">
          <div class="form-grid">
            <mat-form-field appearance="outline">
              <mat-label>Guest Name *</mat-label>
              <input matInput formControlName="name" placeholder="Full name" />
              @if (guestInfoForm.get('name')?.hasError('required') && guestInfoForm.get('name')?.touched) {
                <mat-error>Name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phoneNumber" placeholder="e.g. 0917 826 8950" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <input matInput formControlName="country" placeholder="e.g. Philippines" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Vehicle Plate No.</mat-label>
              <input matInput formControlName="vehiclePlateNo" placeholder="e.g. ABC 1234" />
            </mat-form-field>
          </div>

          <mat-checkbox formControlName="validIdPresented" color="primary">
            Valid ID Presented
          </mat-checkbox>

          <div class="step-actions">
            <button mat-raised-button color="primary" matStepperNext [disabled]="guestInfoForm.invalid">
              Next
            </button>
          </div>
        </form>
      </mat-step>

      <!-- Step 2: Room Reservations -->
      <mat-step [stepControl]="reservationsForm">
        <ng-template matStepLabel>Room Reservations</ng-template>

        <form [formGroup]="reservationsForm" class="step-form">
          @for (reservation of reservations.controls; track $index; let i = $index) {
            <mat-card class="room-card">
              <mat-card-header>
                <mat-card-title>Room {{ i + 1 }}</mat-card-title>
                @if (reservations.length > 1) {
                  <button mat-icon-button color="warn" (click)="removeReservation(i)">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </mat-card-header>

              <mat-card-content [formGroupName]="i">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Reservation #</mat-label>
                    <input matInput formControlName="reservationNumber" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Room Type</mat-label>
                    <mat-select formControlName="roomTypeId">
                      @for (rt of roomTypes(); track rt.id) {
                        <mat-option [value]="rt.id">{{ rt.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Room Number</mat-label>
                    <input matInput formControlName="roomNumber" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Check-in Date</mat-label>
                    <input matInput [matDatepicker]="checkinPicker" formControlName="checkInDate" />
                    <mat-datepicker-toggle matSuffix [for]="checkinPicker" />
                    <mat-datepicker #checkinPicker />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Check-in Time</mat-label>
                    <input matInput formControlName="checkInTime" type="time" />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Check-out Date</mat-label>
                    <input matInput [matDatepicker]="checkoutPicker" formControlName="checkOutDate" />
                    <mat-datepicker-toggle matSuffix [for]="checkoutPicker" />
                    <mat-datepicker #checkoutPicker />
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Check-out Time</mat-label>
                    <input matInput formControlName="checkOutTime" type="time" />
                  </mat-form-field>
                </div>

                <!-- Accompanying Guests -->
                <h4>Accompanying Guests</h4>
                <div formArrayName="accompanyingGuests">
                  @for (ag of getAccompanyingGuests(i).controls; track $index; let j = $index) {
                    <div class="accompanying-guest" [formGroupName]="j">
                      <mat-form-field appearance="outline" class="flex-grow">
                        <mat-label>Name</mat-label>
                        <input matInput formControlName="name" />
                      </mat-form-field>
                      <mat-checkbox formControlName="validIdPresented" color="primary">ID</mat-checkbox>
                      <button mat-icon-button color="warn" (click)="removeAccompanyingGuest(i, j)">
                        <mat-icon>remove_circle</mat-icon>
                      </button>
                    </div>
                  }
                </div>
                <button mat-stroked-button type="button" (click)="addAccompanyingGuest(i)">
                  <mat-icon>person_add</mat-icon> Add Companion
                </button>
              </mat-card-content>
            </mat-card>
          }

          <button mat-stroked-button color="primary" type="button" (click)="addReservation()" class="add-room-btn">
            <mat-icon>add</mat-icon> Add Room
          </button>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <button mat-raised-button color="primary" matStepperNext>Next</button>
          </div>
        </form>
      </mat-step>

      <!-- Step 3: Policies -->
      <mat-step [stepControl]="policiesForm">
        <ng-template matStepLabel>Hotel Policies</ng-template>

        <form [formGroup]="policiesForm" class="step-form">
          <h3>HOUSEKEEPING POLICY</h3>
          <mat-checkbox formControlName="policyHousekeeping1" color="primary">
            I understand that make-up room service is upon request only.
          </mat-checkbox>
          <mat-checkbox formControlName="policyHousekeeping2" color="primary">
            I acknowledge that housekeeping staff are not allowed to enter the room without guest consent.
          </mat-checkbox>

          <mat-divider />

          <h3>HOTEL POLICIES (PLEASE CHECK TO ACKNOWLEDGE)</h3>
          <mat-checkbox formControlName="policySmoking" color="primary">
            Smoking inside rooms is prohibited. A ₱5,000 smoking fee applies.
          </mat-checkbox>
          <mat-checkbox formControlName="policyCorkage" color="primary">
            A 30% corkage fee applies.
          </mat-checkbox>
          <mat-checkbox formControlName="policyNoPets" color="primary">
            No pets allowed.
          </mat-checkbox>
          <mat-checkbox formControlName="policyNegligence" color="primary">
            Guests are responsible for negligence.
          </mat-checkbox>
          <mat-checkbox formControlName="policyMinors" color="primary">
            Minors must be accompanied by adults.
          </mat-checkbox>
          <mat-checkbox formControlName="policyParking" color="primary">
            Parking is limited and subject to availability.
          </mat-checkbox>
          <mat-checkbox formControlName="policySafe" color="primary">
            Hotel is not liable for loss/theft. Digital safe is provided.
          </mat-checkbox>
          <mat-checkbox formControlName="policyForceMajeure" color="primary">
            Force majeure clause acknowledged.
          </mat-checkbox>

          <mat-divider />

          <h3>DATA PRIVACY</h3>
          <mat-checkbox formControlName="policyDataPrivacy" color="primary">
            I acknowledge the data privacy policy.
          </mat-checkbox>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <button mat-raised-button color="primary" matStepperNext [disabled]="policiesForm.invalid">
              Next
            </button>
          </div>
        </form>
      </mat-step>

      <!-- Step 4: Signatures -->
      <mat-step>
        <ng-template matStepLabel>Signatures</ng-template>

        <form [formGroup]="signatureForm" class="step-form">
          <h3>GUEST ACKNOWLEDGMENT</h3>
          <p class="agreement-text">
            I hereby acknowledge that I have read, understood, and agree to abide by the Terms & Conditions.
          </p>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Guest Printed Name *</mat-label>
            <input matInput formControlName="guestPrintedName" />
          </mat-form-field>

          <div class="signature-section">
            <label>Guest Signature *</label>
            <app-signature-pad (signatureChange)="onGuestSignature($event)" />
          </div>

          <p class="date-display">Date: {{ today }}</p>

          <mat-divider />

          <h3>FOR FRONT DESK USE ONLY</h3>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Processed by</mat-label>
            <input matInput formControlName="processedByName" readonly />
          </mat-form-field>

          <div class="signature-section">
            <label>Front Desk Signature *</label>
            <app-signature-pad (signatureChange)="onFrontDeskSignature($event)" />
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Remarks</mat-label>
            <textarea matInput formControlName="remarks" rows="3"></textarea>
          </mat-form-field>

          <div class="step-actions">
            <button mat-button matStepperPrevious>Back</button>
            <button
              mat-raised-button
              color="primary"
              [disabled]="!isFormValid() || submitting()"
              (click)="onSubmit()"
            >
              @if (submitting()) {
                <mat-spinner diameter="20" />
              } @else {
                Submit & Generate PDF
              }
            </button>
          </div>
        </form>
      </mat-step>
    </mat-stepper>
  `,
  styles: `
    :host {
      display: block;
    }

    h2 {
      margin-bottom: 24px;
      color: #1a1a2e;
    }

    .step-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .room-card {
      margin-bottom: 16px;

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .accompanying-guest {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .flex-grow {
      flex: 1;
    }

    .add-room-btn {
      align-self: flex-start;
    }

    .step-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
    }

    .signature-section {
      margin: 16px 0;

      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }
    }

    .agreement-text {
      font-style: italic;
      color: #555;
      margin-bottom: 16px;
    }

    .date-display {
      color: #666;
      font-size: 14px;
    }

    h3 {
      color: #1a1a2e;
      margin-top: 16px;
    }

    mat-divider {
      margin: 16px 0;
    }
  `,
})
export class GuestRegistrationComponent implements OnInit {
  roomTypes = signal<RoomType[]>([]);
  hotelSettings = signal<HotelSettings | null>(null);
  submitting = signal(false);
  today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  private fb = inject(FormBuilder);
  private guestSignatureData = '';
  private frontDeskSignatureData = '';

  guestInfoForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phoneNumber: [''],
    email: [''],
    country: [''],
    vehiclePlateNo: [''],
    validIdPresented: [false],
  });

  reservationsForm = this.fb.group({
    reservations: this.fb.array([this.createReservationGroup()]),
  });

  policiesForm = this.fb.nonNullable.group({
    policyHousekeeping1: [false, Validators.requiredTrue],
    policyHousekeeping2: [false, Validators.requiredTrue],
    policySmoking: [false, Validators.requiredTrue],
    policyCorkage: [false, Validators.requiredTrue],
    policyNoPets: [false, Validators.requiredTrue],
    policyNegligence: [false, Validators.requiredTrue],
    policyMinors: [false, Validators.requiredTrue],
    policyParking: [false, Validators.requiredTrue],
    policySafe: [false, Validators.requiredTrue],
    policyForceMajeure: [false, Validators.requiredTrue],
    policyDataPrivacy: [false, Validators.requiredTrue],
  });

  signatureForm = this.fb.nonNullable.group({
    guestPrintedName: ['', Validators.required],
    processedByName: [''],
    remarks: [''],
  });

  private guestService = inject(GuestService);
  private roomTypeService = inject(RoomTypeService);
  private hotelSettingsService = inject(HotelSettingsService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  constructor() {}

  ngOnInit(): void {
    this.roomTypeService.getActive().subscribe((types) => this.roomTypes.set(types));

    this.hotelSettingsService.getSettings().subscribe((settings) => {
      this.hotelSettings.set(settings);
    });

    const user = this.authService.user();
    if (user) {
      this.signatureForm.patchValue({
        processedByName: `${user.firstName} ${user.lastName}`,
      });
    }
  }

  get reservations(): FormArray {
    return this.reservationsForm.get('reservations') as FormArray;
  }

  getAccompanyingGuests(reservationIndex: number): FormArray {
    return this.reservations.at(reservationIndex).get('accompanyingGuests') as FormArray;
  }

  createReservationGroup() {
    return this.fb.group({
      reservationNumber: ['', Validators.required],
      roomTypeId: ['', Validators.required],
      roomNumber: ['', Validators.required],
      checkInDate: ['', Validators.required],
      checkOutDate: [''],
      checkInTime: ['14:00'],
      checkOutTime: ['11:00'],
      accompanyingGuests: this.fb.array([]),
    });
  }

  addReservation(): void {
    this.reservations.push(this.createReservationGroup());
  }

  removeReservation(index: number): void {
    this.reservations.removeAt(index);
  }

  addAccompanyingGuest(reservationIndex: number): void {
    const guests = this.getAccompanyingGuests(reservationIndex);
    guests.push(
      this.fb.group({
        name: ['', Validators.required],
        validIdPresented: [false],
        signature: [''],
      })
    );
  }

  removeAccompanyingGuest(reservationIndex: number, guestIndex: number): void {
    this.getAccompanyingGuests(reservationIndex).removeAt(guestIndex);
  }

  onGuestSignature(data: string): void {
    this.guestSignatureData = data;
  }

  onFrontDeskSignature(data: string): void {
    this.frontDeskSignatureData = data;
  }

  isFormValid(): boolean {
    return (
      this.guestInfoForm.valid &&
      this.policiesForm.valid &&
      this.signatureForm.valid &&
      !!this.guestSignatureData &&
      !!this.frontDeskSignatureData
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.submitting.set(true);

    const guestInfo = this.guestInfoForm.getRawValue();
    const reservations = this.reservations.getRawValue().map((r: any) => ({
      ...r,
      checkInDate: this.formatDate(r.checkInDate),
      checkOutDate: r.checkOutDate ? this.formatDate(r.checkOutDate) : undefined,
    }));
    const policies = this.policiesForm.getRawValue();
    const signature = this.signatureForm.getRawValue();

    const payload = {
      ...guestInfo,
      reservations,
      agreement: {
        ...policies,
        guestPrintedName: signature.guestPrintedName,
        guestSignature: this.guestSignatureData,
        signatureDate: this.formatDate(new Date()),
        processedByName: signature.processedByName,
        processedBySignature: this.frontDeskSignatureData,
        remarks: signature.remarks || undefined,
      },
    };

    this.guestService.register(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Guest registered successfully!', 'Close', { duration: 3000 });
        this.resetForm();
      },
      error: (err) => {
        this.submitting.set(false);
        this.snackBar.open(err.error?.message ?? 'Registration failed', 'Close', { duration: 5000 });
      },
    });
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private resetForm(): void {
    this.guestInfoForm.reset();
    this.reservationsForm.reset();
    this.policiesForm.reset();
    this.signatureForm.reset();
    this.guestSignatureData = '';
    this.frontDeskSignatureData = '';

    const user = this.authService.user();
    if (user) {
      this.signatureForm.patchValue({
        processedByName: `${user.firstName} ${user.lastName}`,
      });
    }

    while (this.reservations.length > 1) {
      this.reservations.removeAt(1);
    }
  }
}
