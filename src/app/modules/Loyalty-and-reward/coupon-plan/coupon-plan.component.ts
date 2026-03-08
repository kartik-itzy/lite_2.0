import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import { ModalComponent, ModalConfig } from '../../../components/ui/modal/modal.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface CouponPlan {
  tenant_id: string;
  Code: string;
  CouponType: string;
  Description: string;
  StartingDate: string;
  EndingDate: string;
  CurrentStatus: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-coupon-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    TableCellDirective,
    InputComponent,
    ExportExcelComponent,
    ModalComponent,
  ],
  templateUrl: './coupon-plan.component.html',
  styleUrl: './coupon-plan.component.css',
})
export class CouponPlanComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  plans: CouponPlan[] = [];
  isLoading = false;

  // ─── Add modal ────────────────────────────────────────────────────────────
  showAddModal = false;
  newCouponCode = '';
  isCreating = false;

  readonly addModalConfig: ModalConfig = {
    title: 'Add Coupon Plan',
    size: 'sm',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'Code',          label: 'Code',          sortable: true  },
    { key: 'CouponType',    label: 'Coupon Type',   sortable: true  },
    { key: 'Description',   label: 'Description',   sortable: true  },
    { key: 'StartingDate',  label: 'Starting Date', sortable: true  },
    { key: 'EndingDate',    label: 'Ending Date',   sortable: true  },
    { key: 'CurrentStatus', label: 'Status',        sortable: true  },
    { key: 'actions',       label: 'Actions',       sortable: false },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 15,
    searchable: true,
    loading: false,
    emptyMessage: 'No coupon plans found.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'Code',          label: 'Code'          },
    { key: 'CouponType',    label: 'Coupon Type'   },
    { key: 'Description',   label: 'Description'   },
    { key: 'StartingDate',  label: 'Starting Date' },
    { key: 'EndingDate',    label: 'Ending Date'   },
    { key: 'CurrentStatus', label: 'Status'        },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadPlans();
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  loadPlans(): void {
    this.isLoading = true;
    this.tableConfig = { ...this.tableConfig, loading: true };

    this.dataService.getMethod('api/v1/coupon/all').subscribe({
      next: (res: any) => {
        this.plans = res.data || res || [];
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError(
          'Load Failed',
          err.error?.message || 'Failed to load coupon plans',
        );
      },
    });
  }

  onDelete(plan: CouponPlan): void {
    this.confirmationService.confirmDelete(plan.Code, 'coupon plan').then(confirmed => {
      if (!confirmed) return;
      this.dataService
        .deleteMethod(`api/v1/coupon/plan/${plan.tenant_id}/${plan.Code}`)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Deleted', `Coupon plan "${plan.Code}" deleted`);
            this.loadPlans();
          },
          error: (err: HttpErrorResponse) => {
            const msg = err.error?.message || 'Failed to delete coupon plan';
            const isInUse =
              msg.toLowerCase().includes('exists') || err.status === 409;
            this.notificationService.showError(
              'Delete Failed',
              isInUse ? "Coupon exists in the system and cannot be deleted" : msg,
            );
          },
        });
    });
  }

  // ─── Add modal ────────────────────────────────────────────────────────────

  openAddModal(): void {
    this.newCouponCode = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newCouponCode = '';
  }

  createCouponPlan(): void {
    if (!this.newCouponCode.trim()) {
      this.notificationService.showError('Validation', 'Coupon code is required');
      return;
    }

    this.isCreating = true;
    this.dataService
      .postMethod('api/v1/coupon/header', JSON.stringify({ Code: this.newCouponCode.trim() }))
      .subscribe({
        next: (res: any) => {
          this.isCreating = false;
          if (res.status === 200) {
            this.notificationService.showSuccess(
              'Created',
              `Coupon plan "${this.newCouponCode}" created`,
            );
            const code = this.newCouponCode.trim();
            this.closeAddModal();
            // Navigate to the details page via route param — no localStorage needed
            this.router.navigate(['/crafted/retail/couponlist', code]);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreating = false;
          this.notificationService.showError(
            'Create Failed',
            err.error?.message || 'Failed to create coupon plan',
          );
        },
      });
  }

  // ─── Row click ────────────────────────────────────────────────────────────

  onRowClick(plan: CouponPlan): void {
    this.router.navigate(['/crafted/retail/couponlist', plan.Code]);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'info' {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'open')     return 'success';
    if (s === 'inactive' || s === 'voided') return 'danger';
    if (s === 'reserved')                   return 'info';
    return 'warning';
  }

  onPageChange(_page: number): void {}
}