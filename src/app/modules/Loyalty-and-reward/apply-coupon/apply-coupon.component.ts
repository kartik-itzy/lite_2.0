import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { TabComponent, TabItem } from '../../../components/ui/tab/tab.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CouponHistory {
  Code: string;
  CouponCode: string;
  MemberName: string;
  RefPhoneNo: string;
  email: string;
  UseDate: string;
  StoreID: string | null;
}

export interface CouponLineDetail {
  Code: string;
  CouponCode: string;
  StartingDate: string;
  EndingDate: string;
  CouponUsed: string;
  CurrentStatus: string;
  ValueFormula?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-apply-coupon',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardComponent, ButtonComponent, BadgeComponent,
    TableComponent, TableCellDirective,
    InputComponent, ModalComponent, TabComponent,
  ],
  templateUrl: './apply-coupon.component.html',
  styleUrl: './apply-coupon.component.css',
})
export class ApplyCouponComponent implements OnInit {

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  activeTab = 'apply';

  tabs: TabItem[] = [
    { label: 'Coupon History', value: 'history' },
    { label: 'Coupon',         value: 'apply'   },
  ];

  // ─── Verify / Apply ───────────────────────────────────────────────────────
  couponCodeInput = '';
  isVerifying = false;
  isApplying = false;

  // Verify result popup
  showApplyModal = false;
  applyPopupDetails: CouponLineDetail | null = null;
  canApply = false;

  // ─── Coupon history table ─────────────────────────────────────────────────
  historyRows: CouponHistory[] = [];
  isHistoryLoading = false;
  selectedHistoryRow: CouponHistory | null = null;
  isCancelling = false;

  historyColumns: TableColumn[] = [
    { key: 'Code',       label: 'Code',        sortable: true  },
    { key: 'CouponCode', label: 'Coupon Code',  sortable: true  },
    { key: 'MemberName', label: 'Member Name',  sortable: true  },
    { key: 'RefPhoneNo', label: 'Phone',        sortable: false },
    { key: 'email',      label: 'Email',        sortable: false },
    { key: 'UseDate',    label: 'Used Date',    sortable: true  },
  ];

  historyConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No coupon history found.',
  };

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadHistory();
  }

  // ─── Tabs ─────────────────────────────────────────────────────────────────

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'history') this.loadHistory();
  }

  // ─── Load history ─────────────────────────────────────────────────────────

  loadHistory(): void {
    this.isHistoryLoading = true;
    this.historyConfig = { ...this.historyConfig, loading: true };
    this.dataService.getMethod('api/v1/coupon/lineused').subscribe({
      next: (res: any) => {
        this.historyRows = res.data || [];
        this.isHistoryLoading = false;
        this.historyConfig = { ...this.historyConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isHistoryLoading = false;
        this.historyConfig = { ...this.historyConfig, loading: false };
        if (err.status !== 404) {
          this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load history');
        }
      },
    });
  }

  // ─── Verify coupon ────────────────────────────────────────────────────────

  verifyCoupon(): void {
    const code = this.couponCodeInput.trim();
    if (!code) {
      this.notificationService.showError('Validation', 'Please enter a coupon code');
      return;
    }
    this.isVerifying = true;
    this.dataService.getMethod(`api/v1/coupon/linedetail/${code}`).subscribe({
      next: (res: any) => {
        this.isVerifying = false;
        if (res.status === 200 && res.data?.[0]) {
          const detail: CouponLineDetail = res.data[0];
          const today = this.getTodayString();

          if (detail.CurrentStatus === 'VOIDED') {
            this.notificationService.showError('Cannot Apply', "Coupon status is VOIDED — cannot be applied");
            return;
          }
          if (detail.CouponUsed === 'Yes' || detail.EndingDate < today) {
            this.notificationService.showError('Cannot Apply', 'Coupon is already used or has expired');
            return;
          }

          this.applyPopupDetails = detail;
          this.canApply = true;
          this.showApplyModal = true;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isVerifying = false;
        this.notificationService.showError('Not Found', 'No coupon found with that code');
      },
    });
  }

  // ─── Apply coupon ─────────────────────────────────────────────────────────

  applyCoupon(): void {
    const code = this.couponCodeInput.trim();
    if (!code) return;
    this.isApplying = true;
    this.dataService.putMethod(`api/v1/coupon/use/${code}`, JSON.stringify({ couponcode: code })).subscribe({
      next: () => {
        this.isApplying = false;
        this.notificationService.showSuccess('Applied', `Coupon "${code}" applied successfully`);
        this.closeApplyModal();
        this.couponCodeInput = '';
        this.loadHistory();
      },
      error: (err: HttpErrorResponse) => {
        this.isApplying = false;
        this.notificationService.showError('Apply Failed', err.error?.message || 'Failed to apply coupon');
      },
    });
  }

  closeApplyModal(): void {
    this.showApplyModal = false;
    this.applyPopupDetails = null;
    this.canApply = false;
  }

  // ─── Cancel coupon (from history) ─────────────────────────────────────────

  onHistoryRowClick(row: any): void {
    this.selectedHistoryRow = row;
  }

  cancelCoupon(): void {
    if (!this.selectedHistoryRow) return;
    const { Code, CouponCode } = this.selectedHistoryRow;
    this.confirmationService.confirmAction(
      'Cancel Coupon',
      `Cancel coupon code <strong>${CouponCode}</strong>?`,
      'danger'
    ).then(confirmed => {
      if (!confirmed) return;
      this.isCancelling = true;
      this.dataService.postMethod('api/v1/coupon/return', JSON.stringify({
        CouponCode: Code,
        CouponNo:   CouponCode,
      })).subscribe({
        next: (res: any) => {
          this.isCancelling = false;
          if (res?.status === 200 || res?.status === 404) {
            this.notificationService.showSuccess('Cancelled', 'Coupon cancelled');
            this.selectedHistoryRow = null;
            this.loadHistory();
          } else {
            this.notificationService.showError('Cancel Failed', 'Could not cancel coupon');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCancelling = false;
          this.notificationService.showError('Cancel Failed', err.error?.message || 'Failed to cancel coupon');
        },
      });
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getTodayString(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  getUsedVariant(used: string): 'danger' | 'success' {
    return used === 'Yes' ? 'danger' : 'success';
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'OPEN')   return 'success';
    if (status === 'CLOSED' || status === 'VOIDED') return 'danger';
    return 'warning';
  }
}