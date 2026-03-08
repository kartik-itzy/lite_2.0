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

export interface TopupPromotion {
  Code: string;
  tenant_id: string;
  Description: string;
  ActiveDate: string;
  ExpirayDate: string;
  PlanStatus: string;
  fortier: string;
  DisplayText: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-topup-promotion',
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
  templateUrl: './topup-promotion.component.html',
  styleUrl: './topup-promotion.component.css',
})
export class TopupPromotionComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  topups: TopupPromotion[] = [];

  // ─── Add modal ────────────────────────────────────────────────────────────
  showAddModal = false;
  newTopupCode = '';
  isCreating = false;

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'Code',        label: 'Code',        sortable: true },
    { key: 'Description', label: 'Description', sortable: true },
    { key: 'ActiveDate',  label: 'Active Date', sortable: true },
    { key: 'ExpirayDate', label: 'Expiry Date', sortable: true },
    { key: 'PlanStatus',  label: 'Status',      sortable: true },
    { key: 'fortier',     label: 'Tier',        sortable: true },
    { key: 'actions',     label: 'Actions',     sortable: false },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 15,
    searchable: true,
    loading: false,
    emptyMessage: 'No top-up promotions found.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'Code',        label: 'Code'        },
    { key: 'Description', label: 'Description' },
    { key: 'ActiveDate',  label: 'Active Date' },
    { key: 'ExpirayDate', label: 'Expiry Date' },
    { key: 'PlanStatus',  label: 'Status'      },
    { key: 'fortier',     label: 'Tier'        },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadTopups();
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  loadTopups(): void {
    this.tableConfig = { ...this.tableConfig, loading: true };
    this.dataService.getMethod('api/v1/redeem/topup/all').subscribe({
      next: (res: any) => {
        this.topups = res.data || [];
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load top-up promotions');
      },
    });
  }

  onDelete(topup: TopupPromotion): void {
    this.confirmationService.confirmDelete(topup.Code, 'top-up promotion').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/redeem/topup/header/${topup.Code}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', `Top-up promotion "${topup.Code}" deleted`);
          this.loadTopups();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete top-up promotion');
        },
      });
    });
  }

  // ─── Add modal ────────────────────────────────────────────────────────────

  openAddModal(): void {
    this.newTopupCode = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newTopupCode = '';
  }

  createTopup(): void {
    if (!this.newTopupCode.trim()) {
      this.notificationService.showError('Validation', 'Top-up code is required');
      return;
    }
    this.isCreating = true;
    this.dataService.postMethod('api/v1/redeem/topup/header', JSON.stringify({
      Code: this.newTopupCode.trim(),
    })).subscribe({
      next: (res: any) => {
        this.isCreating = false;
        if (res.status === 200) {
          this.notificationService.showSuccess('Created', `Top-up promotion "${this.newTopupCode}" created`);
          const code = this.newTopupCode.trim();
          this.closeAddModal();
          this.router.navigate(['/crafted/retail/topup_promotion', code]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isCreating = false;
        this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create top-up promotion');
      },
    });
  }

  // ─── Row click → navigate to details ─────────────────────────────────────

  onRowClick(topup: any): void {
    this.router.navigate(['/crafted/retail/topup_promotion', topup.Code]);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getPlanStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'Enabled')  return 'success';
    if (status === 'Disabled') return 'danger';
    return 'warning';
  }

  onPageChange(_page: number): void {}
}