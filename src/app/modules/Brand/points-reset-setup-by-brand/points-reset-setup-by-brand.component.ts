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

export type ResetPattern    = 'calendar' | 'custom' | 'noreset';
export type MemberLevelRule = 'maintain' | 'reset' | 'expiry';

@Component({
  selector: 'app-points-reset-setup-by-brand',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, ModalComponent],
  templateUrl: './points-reset-setup-by-brand.component.html',
  styleUrl: './points-reset-setup-by-brand.component.css',
})
export class PointsResetSetupByBrandComponent implements OnInit {

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

  // ─── Pattern selection ────────────────────────────────────────────────────
  resetPattern: ResetPattern = 'calendar';

  // ─── Calendar Reset ───────────────────────────────────────────────────────
  calendarDay:       number = 31;
  calendarMonth:     number = 12;
  calendarTime:      string = '00:00';
  calendarFrequency: number = 1;

  // ─── Custom Date Reset ────────────────────────────────────────────────────
  customDay:   number = 16;
  customMonth: number = 1;
  customTime:  string = '00:00';

  // ─── Member Level ─────────────────────────────────────────────────────────
  memberLevelRule: MemberLevelRule = 'maintain';
  levelExpiry:     number          = 1;
  balanceReset:    boolean         = false;

  // ─── Month options ────────────────────────────────────────────────────────
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
      this.router.navigate(['/crafted/retail/points-reset-by-brand']);
      return;
    }
    this.loadBrandName();
    this.loadResetDetails();
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

  loadResetDetails(): void {
    this.isLoading = true;
    this.dataService.getMethod(`api/v1/member/brandreset/details/${this.brandId}`).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 200 && res.data?.length > 0) {
          this.hasExistingData = true;
          this.mapApiDataToForm(res.data[0]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status !== 404) {
          this.notificationService.showError('Load Failed', err.error?.message ?? 'Failed to load reset details');
        }
      },
    });
  }

  mapApiDataToForm(data: any): void {
    if (data.reset_pattern === 'INTERVAL') {
      this.resetPattern      = 'calendar';
      this.calendarFrequency = data.intervalyear ?? 1;
      this.balanceReset      = data.balance_reset === 'Yes';
      if (data.reset_date) {
        const d            = new Date(data.reset_date);
        this.calendarDay   = d.getDate();
        this.calendarMonth = d.getMonth() + 1;
      }
      this.calendarTime = data.reset_time ?? '00:00';
    } else if (data.reset_pattern === 'DATE') {
      this.resetPattern = 'custom';
      this.balanceReset = data.balance_reset === 'Yes';
      if (data.reset_date) {
        const d          = new Date(data.reset_date);
        this.customDay   = d.getDate();
        this.customMonth = d.getMonth() + 1;
      }
      this.customTime = data.reset_time ?? '00:00';
    } else if (data.reset_pattern === 'NO_RESET') {
      this.resetPattern = 'noreset';
    }

    const retainKey = data.level_retain ?? data.level_retrain; // guard API typo
    if (retainKey === 'Yes') {
      this.memberLevelRule = 'maintain';
      this.levelExpiry     = data.level_expiry ?? 1;
    } else if (data.level_expiry) {
      this.memberLevelRule = 'expiry';
      this.levelExpiry     = data.level_expiry;
    } else {
      this.memberLevelRule = 'reset';
    }
  }

  // ─── Computed ─────────────────────────────────────────────────────────────

  get formattedCalendarDate(): string {
    const m = this.months.find(m => m.value === this.calendarMonth)?.label ?? '';
    return `${m} ${this.calendarDay}`;
  }

  get formattedCustomDate(): string {
    const m = this.months.find(m => m.value === this.customMonth)?.label ?? '';
    return `${m} ${this.customDay}`;
  }

  getDaysInMonth(month: number): number {
    return new Date(new Date().getFullYear(), month, 0).getDate();
  }

  get calendarDaysArray(): number[] {
    return Array.from({ length: this.getDaysInMonth(this.calendarMonth) }, (_, i) => i + 1);
  }

  get customDaysArray(): number[] {
    return Array.from({ length: this.getDaysInMonth(this.customMonth) }, (_, i) => i + 1);
  }

  get confirmSummary(): { label: string; value: string }[] {
    if (!this.pendingPayload) return [];
    const p = this.pendingPayload;
    const rows: { label: string; value: string }[] = [];

    const patternMap: Record<string, string> = {
      INTERVAL: 'Yearly Reset',
      DATE:     'Specific Date Reset',
      NO_RESET: 'No Reset — Points Never Expire',
    };
    rows.push({ label: 'Reset Pattern', value: patternMap[p.reset_pattern] ?? p.reset_pattern });
    if (p.reset_date)   rows.push({ label: 'Reset Date',    value: new Date(p.reset_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) });
    if (p.reset_time)   rows.push({ label: 'Reset Time',    value: p.reset_time });
    if (p.intervalyear) rows.push({ label: 'Interval',      value: `${p.intervalyear} Year${p.intervalyear > 1 ? 's' : ''}` });
    if (p.level_retain) rows.push({ label: 'Retain Level',  value: p.level_retain });
    if (p.level_expiry) rows.push({ label: 'Level Expiry',  value: `${p.level_expiry} Year${p.level_expiry > 1 ? 's' : ''}` });
    rows.push({ label: 'Reset Balance', value: p.balance_reset });
    return rows;
  }

  // ─── Interactions ─────────────────────────────────────────────────────────

  selectPattern(pattern: ResetPattern): void {
    this.resetPattern = pattern;
    if (pattern === 'noreset') this.memberLevelRule = 'maintain';
  }

  selectMemberLevel(level: MemberLevelRule): void {
    this.memberLevelRule = level;
  }

  onCalendarMonthChange(): void {
    const max = this.getDaysInMonth(this.calendarMonth);
    if (this.calendarDay > max) this.calendarDay = max;
  }

  onCustomMonthChange(): void {
    const max = this.getDaysInMonth(this.customMonth);
    if (this.customDay > max) this.customDay = max;
  }

  // ─── Save flow ────────────────────────────────────────────────────────────

  validateDateTime(day: number, month: number, time: string): boolean {
    const year = new Date().getFullYear();
    const dt   = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${time}`);
    if (dt <= new Date()) {
      this.notificationService.showError('Invalid Date', 'Reset date and time must be in the future.');
      return false;
    }
    return true;
  }

  save(): void {
    if (this.resetPattern === 'calendar' && !this.validateDateTime(this.calendarDay, this.calendarMonth, this.calendarTime)) return;
    if (this.resetPattern === 'custom'   && !this.validateDateTime(this.customDay,   this.customMonth,   this.customTime))   return;
    this.pendingPayload     = this.buildPayload();
    this.isConfirmModalOpen = true;
  }

  confirmSave(): void {
    if (!this.pendingPayload || this.isSaving) return;
    this.isSaving           = true;
    this.isConfirmModalOpen = false;

    const payload  = this.pendingPayload;
    const label    = this.hasExistingData ? 'Update' : 'Create';
    const request$ = this.hasExistingData
      ? this.dataService.putMethod(`api/v1/member/brandreset/update/${this.brandId}`, JSON.stringify(payload))
      : this.dataService.postMethod(`api/v1/member/brandreset/create/${this.brandId}`, JSON.stringify(payload));

    request$.subscribe({
      next: (res: any) => {
        this.isSaving        = false;
        this.hasExistingData = true;
        this.notificationService.showSuccess(`${label}d`, res.message ?? `Reset policy ${label.toLowerCase()}d successfully`);
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        this.notificationService.showError(`${label} Failed`, err.error?.message ?? `Failed to ${label.toLowerCase()} reset policy`);
      },
    });
  }

  // ─── Delete flow ──────────────────────────────────────────────────────────

  openDeleteConfirm(): void {
    this.isDeleteConfirmOpen = true;
  }

  confirmDelete(): void {
    this.isDeleteConfirmOpen = false;
    this.dataService.deleteMethod(`api/v1/member/brandreset/delete/${this.brandId}`).subscribe({
      next: (res: any) => {
        this.hasExistingData = false;
        this.resetForm();
        this.notificationService.showSuccess('Deleted', res.message ?? 'Reset policy deleted successfully');
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError('Delete Failed', err.error?.message ?? 'Failed to delete reset policy');
      },
    });
  }

  // ─── Build payload ────────────────────────────────────────────────────────

  buildPayload(): any {
    const year    = new Date().getFullYear();
    const payload: any = {
      balance_reset: this.balanceReset ? 'Yes' : 'No',
    };

    // Member level
    if (this.memberLevelRule === 'maintain') {
      payload.level_retain = 'Yes';
      payload.level_expiry = this.levelExpiry;
    } else if (this.memberLevelRule === 'expiry') {
      payload.level_retain = 'No';
      payload.level_expiry = this.levelExpiry;
    } else {
      payload.level_retain = 'No';
      payload.level_expiry = null;
    }

    // Pattern
    if (this.resetPattern === 'calendar') {
      payload.reset_pattern = 'INTERVAL';
      payload.reset_date    = `${year}-${String(this.calendarMonth).padStart(2, '0')}-${String(this.calendarDay).padStart(2, '0')}`;
      payload.reset_time    = this.calendarTime;
      payload.intervalyear  = this.calendarFrequency;
    } else if (this.resetPattern === 'custom') {
      payload.reset_pattern = 'DATE';
      payload.reset_date    = `${year}-${String(this.customMonth).padStart(2, '0')}-${String(this.customDay).padStart(2, '0')}`;
      payload.reset_time    = this.customTime;
      payload.intervalyear  = null;
    } else {
      payload.reset_pattern = 'NO_RESET';
      payload.reset_date    = null;
      payload.reset_time    = null;
      payload.intervalyear  = null;
      payload.level_retain  = 'Yes';
      payload.level_expiry  = null;
    }

    return payload;
  }

  resetForm(): void {
    this.resetPattern      = 'calendar';
    this.calendarDay       = 31;
    this.calendarMonth     = 12;
    this.calendarTime      = '00:00';
    this.calendarFrequency = 1;
    this.customDay         = 16;
    this.customMonth       = 1;
    this.customTime        = '00:00';
    this.memberLevelRule   = 'maintain';
    this.levelExpiry       = 1;
    this.balanceReset      = false;
  }

  goBack(): void {
    this.router.navigate(['/crafted/retail/points-reset-by-brand']);
  }
}