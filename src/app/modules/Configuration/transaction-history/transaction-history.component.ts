import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Transaction {
  ReceiptNo: string;
  CardNo: string;
  TopupAmount: string;
  StoreNo: string | null;
  Points: string;
  PointValue: string;
  PointDate: string;
  PointTime: string;
  TransactionType: string;
  MemberName: string;
}

export interface AnalyticsSummary {
  totalTransactions: number;
  totalTopupAmount: number;
  totalSaleAmount: number;
  totalSalePoints: number;
  cancelledTopup: number;
  cancelledSales: number;
  addPoints: number;
  cancelAddPoints: number;
}

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    TableCellDirective,
    ExportExcelComponent,
  ],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css',
})
export class TransactionHistoryComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  isLoading = false;
  transactions: Transaction[] = [];

  // ─── Date filter ──────────────────────────────────────────────────────────
  fromDate: string = '';
  toDate: string = '';

  // ─── Analytics ────────────────────────────────────────────────────────────
  analytics: AnalyticsSummary = {
    totalTransactions: 0,
    totalTopupAmount: 0,
    totalSaleAmount: 0,
    totalSalePoints: 0,
    cancelledTopup: 0,
    cancelledSales: 0,
    addPoints: 0,
    cancelAddPoints: 0,
  };

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'ReceiptNo',        label: 'Receipt No',    sortable: true },
    { key: 'TransactionType',  label: 'Type',          sortable: true },
    { key: 'MemberName',       label: 'Member',        sortable: true },
    { key: 'CardNo',           label: 'Card No',       sortable: true },
    { key: 'PointDate',        label: 'Date',          sortable: true },
    { key: 'PointTime',        label: 'Time',          sortable: true },
    { key: 'TopupAmount',      label: 'Topup Amount',  sortable: true },
    { key: 'Points',           label: 'Points',        sortable: true },
    { key: 'PointValue',       label: 'Point Value',   sortable: true },
    { key: 'StoreNo',          label: 'Store',         sortable: true },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 20,
    searchable: true,
    loading: false,
    emptyMessage: 'No transactions found for the selected date range.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'ReceiptNo',       label: 'Receipt No'    },
    { key: 'TransactionType', label: 'Type'          },
    { key: 'MemberName',      label: 'Member'        },
    { key: 'CardNo',          label: 'Card No'       },
    { key: 'PointDate',       label: 'Date'          },
    { key: 'PointTime',       label: 'Time'          },
    { key: 'TopupAmount',     label: 'Topup Amount'  },
    { key: 'Points',          label: 'Points'        },
    { key: 'PointValue',      label: 'Point Value'   },
    { key: 'StoreNo',         label: 'Store'         },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.toDate   = this.formatDate(today);
    this.fromDate = this.formatDate(thirtyDaysAgo);
    this.loadTransactions();
  }

  // ─── API ───────────────────────────────────────────────────────────────────

  loadTransactions(): void {
    if (!this.fromDate || !this.toDate) return;

    if (this.fromDate > this.toDate) {
      this.notificationService.showError('Invalid Date Range', 'From date must be before or equal to To date.');
      return;
    }

    this.isLoading = true;
    this.tableConfig = { ...this.tableConfig, loading: true };

    this.dataService
      .getMethod(`api/v1/member/historytransactions/${this.fromDate}/${this.toDate}`)
      .subscribe({
        next: (data: any) => {
          this.transactions = data.data || [];
          this.calculateAnalytics();
          this.isLoading = false;
          this.tableConfig = { ...this.tableConfig, loading: false };
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.tableConfig = { ...this.tableConfig, loading: false };
          this.notificationService.showError(
            'Load Failed',
            error.error?.message || 'Failed to load transaction history'
          );
        },
      });
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  calculateAnalytics(): void {
    const txns = this.transactions;

    this.analytics = {
      totalTransactions: txns.length,

      totalTopupAmount: txns
        .filter(t => t.TransactionType.toUpperCase() === 'TOPUP')
        .reduce((sum, t) => sum + parseFloat(t.TopupAmount || '0'), 0),

      totalSaleAmount: txns
        .filter(t => t.TransactionType === 'Sales')
        .reduce((sum, t) => sum + parseFloat(t.PointValue || '0'), 0),

      totalSalePoints: txns
        .filter(t => t.TransactionType === 'Sales')
        .reduce((sum, t) => sum + parseFloat(t.Points || '0'), 0),

      cancelledTopup: txns.filter(t => t.TransactionType === 'TOPUP_CANCEL').length,
      cancelledSales: txns.filter(t => t.TransactionType === 'MANUAL_CANCEL').length,
      addPoints:      txns.filter(t => t.TransactionType === 'MANUAL_SALES').length,
      cancelAddPoints:txns.filter(t => t.TransactionType === 'Reset').length,
    };
  }

  // ─── Badge variant ────────────────────────────────────────────────────────

  getBadgeVariant(type: string): 'success' | 'info' | 'warning' | 'secondary' | 'danger' {
    const map: Record<string, 'success' | 'info' | 'warning' | 'secondary' | 'danger'> = {
      'TOPUP':        'success',
      'Sales':        'info',
      'Activation':   'warning',
      'Redemption':   'secondary',
      'TOPUP_CANCEL': 'danger',
      'MANUAL_CANCEL':'danger',
      'MANUAL_SALES': 'info',
      'Reset':        'warning',
    };
    return map[type] ?? 'secondary';
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onPageChange(page: number): void {}
}