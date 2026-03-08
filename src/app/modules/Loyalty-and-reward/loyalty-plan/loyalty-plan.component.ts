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
import { ModalComponent } from '../../../components/ui/modal/modal.component';
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

export interface LoyaltyPlan {
  tenant_id: string;
  Code: string;
  Description: string;
  BaseType: string;
  ActiveDate: string;
  ExpiryDate: string;
  PlanStatus: string;
  PointStatus: string;
  PointsIssued: string;
  PointsUsed: string;
  CreatedBy: string;
  LastModifiedOn: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-loyalty-plan',
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
  templateUrl: './loyalty-plan.component.html',
  styleUrl: './loyalty-plan.component.css',
})
export class LoyaltyPlanComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  plans: LoyaltyPlan[] = [];
  isLoading = false;

  // ─── Add plan modal ───────────────────────────────────────────────────────
  showAddModal = false;
  newLoyaltyCode = '';
  isCreating = false;

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'Code',          label: 'Code',          sortable: true },
    { key: 'Description',   label: 'Description',   sortable: true },
    { key: 'BaseType',      label: 'Base Type',     sortable: true },
    { key: 'ActiveDate',    label: 'Active Date',   sortable: true },
    { key: 'ExpiryDate',    label: 'Expiry Date',   sortable: true },
    { key: 'PlanStatus',    label: 'Status',        sortable: true },
    { key: 'actions',       label: 'Actions',       sortable: false },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 15,
    searchable: true,
    loading: false,
    emptyMessage: 'No loyalty plans found.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'Code',        label: 'Code'        },
    { key: 'Description', label: 'Description' },
    { key: 'BaseType',    label: 'Base Type'   },
    { key: 'ActiveDate',  label: 'Active Date' },
    { key: 'ExpiryDate',  label: 'Expiry Date' },
    { key: 'PlanStatus',  label: 'Status'      },
    { key: 'CreatedBy',   label: 'Created By'  },
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

    this.dataService.getMethod('api/v1/loyalty/all').subscribe({
      next: (res: any) => {
        this.plans = res.data || [];
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load loyalty plans');
      },
    });
  }

  onDelete(plan: LoyaltyPlan): void {
    this.confirmationService.confirmDelete(plan.Code, 'loyalty plan').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/loyalty/plan/${plan.tenant_id}/${plan.Code}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', `Loyalty plan "${plan.Code}" deleted`);
          this.loadPlans();
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message || 'Failed to delete loyalty plan';
          const isInUse = msg.toLowerCase().includes('exists') || err.status === 409;
          this.notificationService.showError('Delete Failed', isInUse ? 'Loyalty plan exists in the system and cannot be deleted' : msg);
        },
      });
    });
  }

  // ─── Add plan modal ───────────────────────────────────────────────────────

  openAddModal(): void {
    this.newLoyaltyCode = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newLoyaltyCode = '';
  }

  createPlan(): void {
    if (!this.newLoyaltyCode.trim()) {
      this.notificationService.showError('Validation', 'Loyalty code is required');
      return;
    }

    this.isCreating = true;
    this.dataService.postMethod('api/v1/loyalty/Plans', JSON.stringify({
      LoyaltyCode: this.newLoyaltyCode.trim(),
    })).subscribe({
      next: (res: any) => {
        this.isCreating = false;
        if (res.status === 200) {
          this.notificationService.showSuccess('Created', `Loyalty plan "${this.newLoyaltyCode}" created`);
          this.closeAddModal();
          // Navigate to details via route param
          this.router.navigate(['/crafted/retail/loyalty', this.newLoyaltyCode.trim()]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isCreating = false;
        this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create loyalty plan');
      },
    });
  }

  // ─── Row click → navigate to details ─────────────────────────────────────

  onRowClick(plan: any): void {
    this.router.navigate(['/crafted/retail/loyalty', plan.Code]);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getPlanStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'Enabled')  return 'success';
    if (status === 'Disabled') return 'danger';
    return 'warning';
  }

  onPageChange(_page: number): void {}
}