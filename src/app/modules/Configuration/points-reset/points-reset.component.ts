import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

export type ResetPattern = 'calendar' | 'custom' | 'noreset';
export type MemberLevelRule = 'maintain' | 'reset' | 'expiry';

@Component({
  selector: 'app-points-reset',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './points-reset.component.html',
  styleUrl: './points-reset.component.css',
})
export class PointsResetComponent implements OnInit {

  // ─── Save state ───────────────────────────────────────────────────────────
  isSaving = false;
  hasExistingData = false;

  // ─── Confirm modal ────────────────────────────────────────────────────────
  isConfirmModalOpen = false;
  pendingPayload: any = null;
  isDeleteConfirmOpen = false;

  // ─── Pattern selection ────────────────────────────────────────────────────
  resetPattern: ResetPattern = 'calendar';

  // ─── Calendar Reset ───────────────────────────────────────────────────────
  calendarDay: number = 31;
  calendarMonth: number = 12;
  calendarTime: string = '00:00';
  calendarFrequency: number = 1;

  // ─── Custom Date Reset ────────────────────────────────────────────────────
  customDay: number = 16;
  customMonth: number = 1;
  customTime: string = '00:00';

  // ─── Member Level ─────────────────────────────────────────────────────────
  memberLevelRule: MemberLevelRule = 'maintain';
  levelExpiry: number = 1;
  balanceReset: boolean = false;

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
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadResetDetails();
  }

  // ─── API ───────────────────────────────────────────────────────────────────

  loadResetDetails(): void {
    this.dataService.getMethod('api/v1/member/reset/details').subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.data?.length > 0) {
          this.hasExistingData = true;
          this.mapApiDataToForm(response.data[0]);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showError('Load Failed', error.error?.message || 'Failed to load reset details');
      },
    });
  }

  mapApiDataToForm(data: any): void {
    if (data.reset_pattern === 'INTERVAL') {
      this.resetPattern = 'calendar';
      this.calendarFrequency = data.intervalyear || 1;
      this.balanceReset = data.balance_reset === 'Yes';
      if (data.reset_date) {
        const d = new Date(data.reset_date);
        this.calendarDay   = d.getDate();
        this.calendarMonth = d.getMonth() + 1;
      }
      this.calendarTime = data.reset_time || '00:00';
    } else if (data.reset_pattern === 'DATE') {
      this.resetPattern = 'custom';
      this.balanceReset = data.balance_reset === 'Yes';
      if (data.reset_date) {
        const d = new Date(data.reset_date);
        this.customDay   = d.getDate();
        this.customMonth = d.getMonth() + 1;
      }
      this.customTime = data.reset_time || '00:00';
    } else if (data.reset_pattern === 'NO_RESET') {
      this.resetPattern = 'noreset';
    }

    if (data.level_retain === 'Yes') {
      this.memberLevelRule = 'maintain';
      this.levelExpiry = data.level_expiry || 1;
    } else if (data.level_expiry) {
      this.memberLevelRule = 'expiry';
      this.levelExpiry = data.level_expiry;
    } else {
      this.memberLevelRule = 'reset';
    }
  }

  // ─── Computed ──────────────────────────────────────────────────────────────

  get formattedCalendarDate(): string {
    const m = this.months.find(m => m.value === this.calendarMonth)?.label || '';
    return `${m} ${this.calendarDay}`;
  }

  get formattedCustomDate(): string {
    const m = this.months.find(m => m.value === this.customMonth)?.label || '';
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
      DATE: 'Specific Date Reset',
      NO_RESET: 'No Reset — Points Never Expire',
    };
    rows.push({ label: 'Reset Pattern', value: patternMap[p.reset_pattern] || p.reset_pattern });

    if (p.reset_date)   rows.push({ label: 'Reset Date',    value: new Date(p.reset_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) });
    if (p.reset_time)   rows.push({ label: 'Reset Time',    value: p.reset_time });
    if (p.intervalyear) rows.push({ label: 'Interval',      value: `${p.intervalyear} Year${p.intervalyear > 1 ? 's' : ''}` });
    if (p.level_retain) rows.push({ label: 'Retain Level',  value: p.level_retain });
    if (p.level_expiry) rows.push({ label: 'Level Expiry',  value: `${p.level_expiry} Year${p.level_expiry > 1 ? 's' : ''}` });
    if (p.balance_reset !== undefined) rows.push({ label: 'Reset Balance', value: p.balance_reset });

    return rows;
  }

  // ─── Interactions ──────────────────────────────────────────────────────────

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

  // ─── Save flow ─────────────────────────────────────────────────────────────

  validateDateTime(day: number, month: number, time: string): boolean {
    const year = new Date().getFullYear();
    const dt = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${time}`);
    if (dt <= new Date()) {
      this.notificationService.showError('Invalid Date', 'Reset date and time must be in the future.');
      return false;
    }
    return true;
  }

  save(): void {
    if (this.resetPattern === 'calendar') {
      if (!this.validateDateTime(this.calendarDay, this.calendarMonth, this.calendarTime)) return;
    } else if (this.resetPattern === 'custom') {
      if (!this.validateDateTime(this.customDay, this.customMonth, this.customTime)) return;
    }

    this.pendingPayload = this.buildPayload();
    this.isConfirmModalOpen = true;
  }

  confirmSave(): void {
    if (!this.pendingPayload || this.isSaving) return;
    this.isSaving = true;
    this.isConfirmModalOpen = false;

    const payload = this.pendingPayload;

    if (this.hasExistingData) {
      if (payload.intervalyear === 0 || payload.level_expiry === 0) {
        this.notificationService.showError('Invalid Value', 'Interval Year and Level Expiry cannot be 0.');
        this.isSaving = false;
        return;
      }
      this.dataService.putMethod('api/v1/member/reset/update', JSON.stringify(payload)).subscribe({
        next: (response: any) => {
          this.notificationService.showSuccess('Updated', response.message || 'Reset policy updated successfully');
          this.isSaving = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isSaving = false;
          this.notificationService.showError('Update Failed', error.error?.message || 'Failed to update reset policy');
        },
      });
    } else {
      this.dataService.postMethod('api/v1/member/reset/create', JSON.stringify(payload)).subscribe({
        next: (response: any) => {
          this.notificationService.showSuccess('Created', response.message || 'Reset policy created successfully');
          this.hasExistingData = true;
          this.isSaving = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isSaving = false;
          this.notificationService.showError('Create Failed', error.error?.message || 'Failed to create reset policy');
        },
      });
    }
  }

  openDeleteConfirm(): void {
    this.isDeleteConfirmOpen = true;
  }

  confirmDelete(): void {
    this.isDeleteConfirmOpen = false;
    this.dataService.deleteMethod('api/v1/member/reset/delete').subscribe({
      next: (response: any) => {
        this.notificationService.showSuccess('Deleted', response.message || 'Reset policy deleted successfully');
        this.hasExistingData = false;
        this.resetForm();
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showError('Delete Failed', error.error?.message || 'Failed to delete reset policy');
      },
    });
  }

  buildPayload(): any {
    const year = new Date().getFullYear();
    const payload: any = {
      balance_reset: this.balanceReset ? 'Yes' : 'No',
    };

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

    if (this.resetPattern === 'calendar') {
      payload.reset_pattern = 'INTERVAL';
      payload.reset_date = `${year}-${String(this.calendarMonth).padStart(2, '0')}-${String(this.calendarDay).padStart(2, '0')}`;
      payload.reset_time = this.calendarTime;
      payload.intervalyear = this.calendarFrequency;
    } else if (this.resetPattern === 'custom') {
      payload.reset_pattern = 'DATE';
      payload.reset_date = `${year}-${String(this.customMonth).padStart(2, '0')}-${String(this.customDay).padStart(2, '0')}`;
      payload.reset_time = this.customTime;
      payload.intervalyear = null;
    } else {
      payload.reset_pattern = 'NO_RESET';
      payload.reset_date = null;
      payload.reset_time = null;
      payload.intervalyear = null;
      payload.level_retain = 'Yes';
      payload.level_expiry = null;
    }

    return payload;
  }

  resetForm(): void {
    this.resetPattern = 'calendar';
    this.calendarDay = 31;
    this.calendarMonth = 12;
    this.calendarTime = '00:00';
    this.calendarFrequency = 1;
    this.customDay = 16;
    this.customMonth = 1;
    this.customTime = '00:00';
    this.memberLevelRule = 'maintain';
    this.levelExpiry = 1;
    this.balanceReset = false;
  }
}