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

export interface RedeemPlan {
  Code: string;
  tenant_id: string;
  Description: string;
  DisplayText: string;
  ActiveDate: string;
  ExpirayDate: string;
  CreatedBy: string | null;
  PlanStatus: string;
  RedeemType: string;
  UpdateToVD: string;
  Termsandconditions: string;
  LastModifiedOn: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-redeem-plan',
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
  templateUrl: './redeem-plan.component.html',
  styleUrl: './redeem-plan.component.css',
})
export class RedeemPlanComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  plans: RedeemPlan[] = [];
  isLoading = false;

  // ─── Add modal ────────────────────────────────────────────────────────────
  showAddModal = false;
  newRedeemCode = '';
  isCreating = false;

  readonly addModalConfig: ModalConfig = {
    title: 'Add Redeem Plan',
    size: 'sm',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'Code',          label: 'Code',          sortable: true  },
    { key: 'Description',   label: 'Description',   sortable: true  },
    { key: 'ActiveDate',    label: 'Active Date',   sortable: true  },
    { key: 'ExpirayDate',   label: 'Expiry Date',   sortable: true  },
    { key: 'PlanStatus',    label: 'Status',        sortable: true  },
    { key: 'actions',       label: 'Actions',       sortable: false },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 12,
    searchable: true,
    loading: false,
    emptyMessage: 'No redeem plans found.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'Code',        label: 'Code'        },
    { key: 'Description', label: 'Description' },
    { key: 'ActiveDate',  label: 'Active Date' },
    { key: 'ExpirayDate', label: 'Expiry Date' },
    { key: 'PlanStatus',  label: 'Status'      },
    { key: 'RedeemType',  label: 'Redeem Type' },
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

    this.dataService.getMethod('api/v1/redeem/all').subscribe({
      next: (res: any) => {
        this.plans = res.data || res || [];
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load redeem plans');
      },
    });
  }

  onDelete(plan: RedeemPlan): void {
    this.confirmationService.confirmDelete(plan.Code, 'redeem plan').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/redeem/header/${plan.Code}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', `Redeem plan "${plan.Code}" deleted`);
          this.loadPlans();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete redeem plan');
        },
      });
    });
  }

  // ─── Add modal ────────────────────────────────────────────────────────────

  openAddModal(): void {
    this.newRedeemCode = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newRedeemCode = '';
  }

  createRedeemPlan(): void {
    if (!this.newRedeemCode.trim()) {
      this.notificationService.showError('Validation', 'Redeem code is required');
      return;
    }

    this.isCreating = true;
    this.dataService
      .postMethod('api/v1/redeem/header', JSON.stringify({ Code: this.newRedeemCode.trim() }))
      .subscribe({
        next: (res: any) => {
          this.isCreating = false;
          if (res.status === 200) {
            const code = this.newRedeemCode.trim();
            this.notificationService.showSuccess('Created', `Redeem plan "${code}" created`);
            this.closeAddModal();
            this.router.navigate(['/crafted/retail/redeemlist', code]);
          } else {
            this.notificationService.showError('Create Failed', 'Error while creating redeem plan');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreating = false;
          this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create redeem plan');
        },
      });
  }

  // ─── Row click → navigate to details ─────────────────────────────────────

  onRowClick(plan: any): void {
    this.router.navigate(['/crafted/retail/redeemlist', plan.Code]);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'Enabled')  return 'success';
    if (status === 'Disabled') return 'danger';
    return 'warning';
  }

  onPageChange(_page: number): void {}
}