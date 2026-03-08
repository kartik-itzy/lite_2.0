import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';

export type ExpiryPattern = 'monthly' | 'yearly' | 'no-expiry';

@Component({
  selector: 'app-points-expiry-setup-by-brand',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, ModalComponent],
  templateUrl: './points-expiry-setup-by-brand.component.html',
  styleUrl: './points-expiry-setup-by-brand.component.css',
})
export class PointsExpirySetupByBrandComponent implements OnInit {

  // ─── Route ────────────────────────────────────────────────────────────────
  brandId   = '';
  brandName = '';

  // ─── UI state ─────────────────────────────────────────────────────────────
  isLoading       = false;
  isSaving        = false;
  hasExistingData = false;

  // ─── Modal state ──────────────────────────────────────────────────────────
  isConfirmModalOpen  = false;
  isDeleteConfirmOpen = false;
  pendingPayload: any = null;

  // ─── Form fields ──────────────────────────────────────────────────────────
  expiryPattern: ExpiryPattern = 'monthly';
  intervalValue = 1;
  expiryDay     = 1;
  expiryMonth   = 1;
  expiryTime    = '00:00';

  readonly months = [
    { value: 1,  label: 'January'   }, { value: 2,  label: 'February' },
    { value: 3,  label: 'March'     }, { value: 4,  label: 'April'    },
    { value: 5,  label: 'May'       }, { value: 6,  label: 'June'     },
    { value: 7,  label: 'July'      }, { value: 8,  label: 'August'   },
    { value: 9,  label: 'September' }, { value: 10, label: 'October'  },
    { value: 11, label: 'November'  }, { value: 12, label: 'December' },
  ];

  constructor(
    private route:               ActivatedRoute,
    private router:              Router,
    private dataService:         DataService,
    private notificationService: NotificationService,
  ) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.brandId = this.route.snapshot.paramMap.get('brandId') ?? '';
    if (!this.brandId) {
      this.notificationService.showError('Invalid Route', 'No brand ID found in URL');
      this.router.navigate(['/crafted/retail/pointsexpirysetupbybrand']);
      return;
    }
    this.loadBrandName();
    this.loadExpiryDetails();
  }

  // ─── Data loading ─────────────────────────────────────────────────────────

  loadBrandName(): void {
    this.dataService.getMethod('api/v1/member/getAllBrands').subscribe({
      next: (res: any) => {
        const found = (res.data ?? []).find((b: any) => b.brand_id === this.brandId);
        this.brandName = found?.name?.trim() ?? this.brandId;
      },
      error: () => { this.brandName = this.brandId; },
    });
  }

  loadExpiryDetails(): void {
    this.isLoading = true;
    this.dataService.getMethod(`api/v1/member/brand/pointsexpiry/details/${this.brandId}`).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 200 && res.data) {
          this.hasExistingData = true;
          this.mapApiDataToForm(res.data);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status !== 404) {
          this.notificationService.showError('Load Failed', err.error?.message ?? 'Failed to load expiry details');
        }
      },
    });
  }

  mapApiDataToForm(data: any): void {
    switch (data.expiry_pattern) {
      case 'MONTHLY':
        this.expiryPattern = 'monthly';
        this.intervalValue = data.expiry_interval ?? 1;
        this.expiryDay     = data.expiry_day ?? 1;
        this.expiryTime    = data.expiry_time?.substring(0, 5) ?? '00:00';
        break;
      case 'YEARLY':
        this.expiryPattern = 'yearly';
        this.intervalValue = data.expiry_interval ?? 1;
        this.expiryDay     = data.expiry_day ?? 1;
        this.expiryMonth   = data.expiry_month ?? 1;
        this.expiryTime    = data.expiry_time?.substring(0, 5) ?? '00:00';
        break;
      case 'NO_EXPIRY':
        this.expiryPattern = 'no-expiry';
        break;
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getMonthName(month: number): string {
    return this.months.find(m => m.value === month)?.label ?? '';
  }

  getDaysInMonth(month: number): number {
    return new Date(new Date().getFullYear(), month, 0).getDate();
  }

  isFormValid(): boolean {
    if (this.expiryPattern === 'no-expiry') return true;
    return (
      this.intervalValue >= 1 && this.intervalValue <= 99 &&
      this.expiryDay     >= 1 && this.expiryDay     <= 31 &&
      (this.expiryPattern === 'monthly' || !!this.expiryMonth) &&
      !!this.expiryTime
    );
  }

  // ─── Confirm summary for modal ────────────────────────────────────────────

  get confirmSummary(): { label: string; value: string }[] {
    if (!this.pendingPayload) return [];
    const p = this.pendingPayload;
    const rows: { label: string; value: string }[] = [];

    const patternMap: Record<string, string> = {
      MONTHLY:   'Monthly Expiry',
      YEARLY:    'Yearly Expiry',
      NO_EXPIRY: 'No Expiry — Points Never Expire',
    };
    rows.push({ label: 'Expiry Pattern', value: patternMap[p.expiry_pattern] ?? p.expiry_pattern });
    if (p.expiry_interval) rows.push({ label: 'Interval',  value: `${p.expiry_interval} ${p.expiry_pattern === 'MONTHLY' ? 'Month(s)' : 'Year(s)'}` });
    if (p.expiry_day)      rows.push({ label: 'Day',       value: String(p.expiry_day) });
    if (p.expiry_month)    rows.push({ label: 'Month',     value: this.getMonthName(p.expiry_month) });
    if (p.expiry_time)     rows.push({ label: 'Time',      value: p.expiry_time.substring(0, 5) });
    return rows;
  }

  // ─── Interactions ─────────────────────────────────────────────────────────

  selectPattern(pattern: ExpiryPattern): void {
    this.expiryPattern = pattern;
  }

  onMonthChange(): void {
    const max = this.getDaysInMonth(this.expiryMonth);
    if (this.expiryDay > max) this.expiryDay = max;
  }

  onTimeChange(): void { /* triggers ngModel update */ }

  preventZero(event: any, field: 'interval' | 'day'): void {
    const num = parseInt(event.target.value, 10);
    if (field === 'interval') this.intervalValue = isNaN(num) ? 1 : num;
    else                      this.expiryDay     = isNaN(num) ? 1 : num;
  }

  validateOnBlur(event: any, field: 'interval' | 'day'): void {
    const val = parseInt(event.target.value, 10);
    if (field === 'interval') {
      this.intervalValue = Math.max(1, Math.min(99, isNaN(val) ? 1 : val));
      event.target.value = this.intervalValue;
    } else {
      this.expiryDay = Math.max(1, Math.min(31, isNaN(val) ? 1 : val));
      event.target.value = this.expiryDay;
    }
  }

  // ─── Build payload ────────────────────────────────────────────────────────

  buildPayload(): any {
    const base = { brand_id: this.brandId };
    if (this.expiryPattern === 'monthly') {
      return { ...base, expiry_pattern: 'MONTHLY',   expiry_interval: this.intervalValue, expiry_day: this.expiryDay, expiry_month: null,             expiry_time: `${this.expiryTime}:00` };
    }
    if (this.expiryPattern === 'yearly') {
      return { ...base, expiry_pattern: 'YEARLY',    expiry_interval: this.intervalValue, expiry_day: this.expiryDay, expiry_month: this.expiryMonth, expiry_time: `${this.expiryTime}:00` };
    }
    return   { ...base, expiry_pattern: 'NO_EXPIRY', expiry_interval: null,               expiry_day: null,           expiry_month: null,             expiry_time: null };
  }

  // ─── Save flow ────────────────────────────────────────────────────────────

  save(): void {
    if (!this.isFormValid()) {
      this.notificationService.showError('Validation', 'Please fill all required fields correctly');
      return;
    }
    this.pendingPayload     = this.buildPayload();
    this.isConfirmModalOpen = true;
  }

  confirmSave(): void {
    if (!this.pendingPayload || this.isSaving) return;
    this.isSaving           = true;
    this.isConfirmModalOpen = false;

    const label    = this.hasExistingData ? 'Update' : 'Create';
    const request$ = this.hasExistingData
      ? this.dataService.putMethod(`api/v1/member/brand/pointsexpiry/update/${this.brandId}`, this.pendingPayload)
      : this.dataService.postMethod('api/v1/member/brand/pointsexpiry/create', this.pendingPayload);

    request$.subscribe({
      next: (res: any) => {
        this.isSaving        = false;
        this.hasExistingData = true;
        this.notificationService.showSuccess(`${label}d`, res.message ?? `Expiry policy ${label.toLowerCase()}d successfully`);
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        this.notificationService.showError(`${label} Failed`, err.error?.message ?? `Failed to ${label.toLowerCase()} expiry policy`);
      },
    });
  }

  // ─── Delete flow ──────────────────────────────────────────────────────────

  openDeleteConfirm(): void {
    this.isDeleteConfirmOpen = true;
  }

  confirmDelete(): void {
    this.isDeleteConfirmOpen = false;
    this.dataService.deleteMethod(`api/v1/member/brand/pointsexpiry/delete/${this.brandId}`).subscribe({
      next: (res: any) => {
        this.hasExistingData = false;
        this.resetForm();
        this.notificationService.showSuccess('Deleted', res.message ?? 'Expiry policy deleted successfully');
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError('Delete Failed', err.error?.message ?? 'Failed to delete expiry policy');
      },
    });
  }

  resetForm(): void {
    this.expiryPattern = 'monthly';
    this.intervalValue = 1;
    this.expiryDay     = 1;
    this.expiryMonth   = 1;
    this.expiryTime    = '00:00';
  }

  goBack(): void {
    this.router.navigate(['/crafted/retail/pointsexpirysetupbybrand']);
  }
}