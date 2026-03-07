import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';

export type ExpiryPattern = 'monthly' | 'yearly' | 'no-expiry';

@Component({
  selector: 'app-points-expiry-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './points-expiry-setup.component.html',
  styleUrl: './points-expiry-setup.component.css',
})
export class PointsExpirySetupComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  isSaving = false;
  hasExistingData = false;

  // ─── Confirm modal ────────────────────────────────────────────────────────
  isConfirmModalOpen = false;
  pendingPayload: any = null;

  // ─── Pattern ──────────────────────────────────────────────────────────────
  expiryPattern: ExpiryPattern = 'monthly';

  // ─── Config fields ────────────────────────────────────────────────────────
  intervalValue: number = 1;   // 1-99 months or years
  expiryDay: number = 1;        // 1-31
  expiryMonth: number = 1;      // 1-12 (yearly only)
  expiryTime: string = '00:00';

  // ─── Month options ────────────────────────────────────────────────────────
  readonly months = [
    { value: 1,  label: 'January'   },
    { value: 2,  label: 'February'  },
    { value: 3,  label: 'March'     },
    { value: 4,  label: 'April'     },
    { value: 5,  label: 'May'       },
    { value: 6,  label: 'June'      },
    { value: 7,  label: 'July'      },
    { value: 8,  label: 'August'    },
    { value: 9,  label: 'September' },
    { value: 10, label: 'October'   },
    { value: 11, label: 'November'  },
    { value: 12, label: 'December'  },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadExpiryDetails();
  }

  // ─── API ───────────────────────────────────────────────────────────────────

  loadExpiryDetails(): void {
    this.dataService.getMethod('api/v1/member/pointsexpiry/details').subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.data?.length > 0) {
          this.hasExistingData = true;
          this.mapApiDataToForm(response.data[0]);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showError('Load Failed', error.error?.message || 'Failed to load expiry details');
      },
    });
  }

  mapApiDataToForm(data: any): void {
    if (data.expiry_pattern === 'MONTHLY') {
      this.expiryPattern  = 'monthly';
      this.intervalValue  = data.interval_value || 1;
      this.expiryDay      = data.expiry_day     || 1;
      this.expiryTime     = data.expiry_time     || '00:00';
    } else if (data.expiry_pattern === 'YEARLY') {
      this.expiryPattern  = 'yearly';
      this.intervalValue  = data.interval_value || 1;
      this.expiryDay      = data.expiry_day     || 1;
      this.expiryMonth    = data.expiry_month   || 1;
      this.expiryTime     = data.expiry_time     || '00:00';
    } else if (data.expiry_pattern === 'NO_EXPIRY') {
      this.expiryPattern = 'no-expiry';
    }
  }

  // ─── Computed ──────────────────────────────────────────────────────────────

  get intervalUnit(): string {
    return this.expiryPattern === 'monthly' ? 'month(s)' : 'year(s)';
  }

  get previewText(): string {
    if (this.expiryPattern === 'no-expiry') return '';
    const monthName = this.months.find(m => m.value === this.expiryMonth)?.label || '';
    if (this.expiryPattern === 'monthly') {
      return `Points will expire on day <strong>${this.expiryDay}</strong> at <strong>${this.expiryTime}</strong>, every <strong>${this.intervalValue} month(s)</strong>.`;
    }
    return `Points will expire on <strong>${monthName} ${this.expiryDay}</strong> at <strong>${this.expiryTime}</strong>, every <strong>${this.intervalValue} year(s)</strong>.`;
  }

  get confirmSummary(): { label: string; value: string }[] {
    if (!this.pendingPayload) return [];
    const p = this.pendingPayload;
    const rows: { label: string; value: string }[] = [];

    const patternMap: Record<string, string> = {
      MONTHLY:   'Monthly Expiry',
      YEARLY:    'Yearly Expiry',
      NO_EXPIRY: 'No Expiry — Points Never Expire',
    };
    rows.push({ label: 'Expiry Pattern', value: patternMap[p.expiry_pattern] || p.expiry_pattern });
    if (p.interval_value) rows.push({ label: 'Interval',    value: `${p.interval_value} ${this.intervalUnit}` });
    if (p.expiry_day)     rows.push({ label: 'Day',         value: String(p.expiry_day) });
    if (p.expiry_month) {
      const mLabel = this.months.find(m => m.value === p.expiry_month)?.label || String(p.expiry_month);
      rows.push({ label: 'Month', value: mLabel });
    }
    if (p.expiry_time)    rows.push({ label: 'Time',        value: p.expiry_time });
    return rows;
  }

  // ─── Interactions ──────────────────────────────────────────────────────────

  selectPattern(pattern: ExpiryPattern): void {
    this.expiryPattern = pattern;
  }

  onMonthChange(): void {
    const maxDay = new Date(new Date().getFullYear(), this.expiryMonth, 0).getDate();
    if (this.expiryDay > maxDay) this.expiryDay = maxDay;
  }

  preventZero(event: Event, field: 'interval' | 'day'): void {
    const input = event.target as HTMLInputElement;
    const val = parseInt(input.value, 10);
    if (val === 0 || isNaN(val)) {
      if (field === 'interval') this.intervalValue = 1;
      if (field === 'day')      this.expiryDay     = 1;
    }
  }

  validateOnBlur(event: Event, field: 'interval' | 'day'): void {
    const input = event.target as HTMLInputElement;
    const val = parseInt(input.value, 10);
    if (field === 'interval') {
      if (!val || val < 1)  this.intervalValue = 1;
      if (val > 99)         this.intervalValue = 99;
    }
    if (field === 'day') {
      const max = this.expiryPattern === 'yearly'
        ? new Date(new Date().getFullYear(), this.expiryMonth, 0).getDate()
        : 31;
      if (!val || val < 1) this.expiryDay = 1;
      if (val > max)       this.expiryDay = max;
    }
  }

  isFormValid(): boolean {
    if (this.expiryPattern === 'no-expiry') return true;
    return this.intervalValue >= 1 && this.expiryDay >= 1 && !!this.expiryTime;
  }

  // ─── Save flow ─────────────────────────────────────────────────────────────

  save(): void {
    if (!this.isFormValid()) return;
    this.pendingPayload = this.buildPayload();
    this.isConfirmModalOpen = true;
  }

  confirmSave(): void {
    if (!this.pendingPayload || this.isSaving) return;
    this.isSaving = true;
    this.isConfirmModalOpen = false;

    const payload = this.pendingPayload;
    const method$ = this.hasExistingData
      ? this.dataService.putMethod('api/v1/member/expiry/update', JSON.stringify(payload))
      : this.dataService.postMethod('api/v1/member/expiry/create', JSON.stringify(payload));

    method$.subscribe({
      next: (response: any) => {
        this.notificationService.showSuccess(
          this.hasExistingData ? 'Updated' : 'Created',
          response.message || `Points expiry policy ${this.hasExistingData ? 'updated' : 'created'} successfully`
        );
        if (!this.hasExistingData) this.hasExistingData = true;
        this.isSaving = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.notificationService.showError(
          this.hasExistingData ? 'Update Failed' : 'Create Failed',
          error.error?.message || 'Failed to save expiry policy'
        );
      },
    });
  }

  buildPayload(): any {
    if (this.expiryPattern === 'no-expiry') {
      return { expiry_pattern: 'NO_EXPIRY', interval_value: null, expiry_day: null, expiry_month: null, expiry_time: null };
    }

    const payload: any = {
      expiry_pattern: this.expiryPattern === 'monthly' ? 'MONTHLY' : 'YEARLY',
      interval_value: this.intervalValue,
      expiry_day:     this.expiryDay,
      expiry_time:    this.expiryTime,
      expiry_month:   this.expiryPattern === 'yearly' ? this.expiryMonth : null,
    };
    return payload;
  }

  resetForm(): void {
    this.expiryPattern  = 'monthly';
    this.intervalValue  = 1;
    this.expiryDay      = 1;
    this.expiryMonth    = 1;
    this.expiryTime     = '00:00';
  }
}