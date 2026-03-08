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

export interface BasicDeal {
  DealCode: string;
  tenant_id: string;
  Description: string;
  StartingDate: string;
  EndingDate: string;
  Active: string;
  DealType?: string;
  DealPrice?: number;
  MaximumQty?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-basic-deals',
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
  templateUrl: './basic-deals.component.html',
  styleUrl: './basic-deals.component.css',
})
export class BasicDealsComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  deals: BasicDeal[] = [];
  isLoading = false;

  // ─── Add modal ────────────────────────────────────────────────────────────
  showAddModal = false;
  newDealCode = '';
  isCreating = false;

  readonly addModalConfig: ModalConfig = {
    title: 'Add Basic Deal',
    size: 'sm',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'DealCode',     label: 'Deal Code',     sortable: true  },
    { key: 'Description',  label: 'Description',   sortable: true  },
    { key: 'StartingDate', label: 'Starting Date', sortable: true  },
    { key: 'EndingDate',   label: 'Ending Date',   sortable: true  },
    { key: 'Active',       label: 'Active',        sortable: true  },
    { key: 'actions',      label: 'Actions',       sortable: false },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No basic deals found.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'DealCode',     label: 'Deal Code'     },
    { key: 'Description',  label: 'Description'   },
    { key: 'StartingDate', label: 'Starting Date' },
    { key: 'EndingDate',   label: 'Ending Date'   },
    { key: 'Active',       label: 'Active'        },
    { key: 'DealType',     label: 'Deal Type'     },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadDeals();
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  loadDeals(): void {
    this.isLoading = true;
    this.tableConfig = { ...this.tableConfig, loading: true };

    this.dataService.getMethod('api/v1/deal/all').subscribe({
      next: (res: any) => {
        this.deals = res.data || res || [];
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load deals');
      },
    });
  }

  onDelete(deal: BasicDeal): void {
    this.confirmationService.confirmDelete(deal.DealCode, 'basic deal').then(confirmed => {
      if (!confirmed) return;
      this.dataService
        .deleteMethod(`api/v1/deal/plan/${deal.tenant_id}/${deal.DealCode}`)
        .subscribe({
          next: (res: any) => {
            if (res?.status === 409) {
              this.notificationService.showError('Cannot Delete', 'Deal exists in the system');
            } else {
              this.notificationService.showSuccess('Deleted', `Deal "${deal.DealCode}" deleted`);
              this.loadDeals();
            }
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 409) {
              this.notificationService.showError('Cannot Delete', 'Deal exists in the system');
            } else {
              this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete deal');
            }
          },
        });
    });
  }

  // ─── Add modal ────────────────────────────────────────────────────────────

  openAddModal(): void {
    this.newDealCode = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newDealCode = '';
  }

  createDeal(): void {
    if (!this.newDealCode.trim()) {
      this.notificationService.showError('Validation', 'Deal code is required');
      return;
    }

    this.isCreating = true;
    this.dataService
      .postMethod('api/v1/deal', JSON.stringify({ Code: this.newDealCode.trim() }))
      .subscribe({
        next: (res: any) => {
          this.isCreating = false;
          if (res.status === 200) {
            const code = this.newDealCode.trim();
            this.notificationService.showSuccess('Created', `Deal "${code}" created`);
            this.closeAddModal();
            this.router.navigate(['/crafted/retail/basicdeals', code]);
          } else {
            this.notificationService.showError('Create Failed', 'Error creating deal — possible duplicate');
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isCreating = false;
          this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create deal');
        },
      });
  }

  // ─── Row click ────────────────────────────────────────────────────────────

  onRowClick(deal: any): void {
    this.router.navigate(['/crafted/retail/basicdeals', deal.DealCode]);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getActiveVariant(active: string): 'success' | 'danger' | 'warning' {
    if (active === 'Yes') return 'success';
    if (active === 'No')  return 'danger';
    return 'warning';
  }

  onPageChange(_page: number): void {}
}