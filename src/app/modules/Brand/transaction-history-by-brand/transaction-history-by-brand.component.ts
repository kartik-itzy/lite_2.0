import { Component, OnInit } from '@angular/core';
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

export interface BrandTransaction {
  brand_id: string;
  ReceiptNo: string;
  CardNo: string;
  TopupAmount: string;
  Points: string;
  PointValue: string;
  PointDate: string;
  PointTime: string;
  TransactionType: string;
  MemberName: string;
}

export interface BrandAnalytics {
  totalTransactions: number;
  totalTopupAmount: number;
  totalPoints: number;
  totalPointValue: number;
  cancelledTopup: number;
  cancelledSales: number;
  addPoints: number;
  cancelAddPoints: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-transaction-history-by-brand',
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
  templateUrl: './transaction-history-by-brand.component.html',
  styleUrl: './transaction-history-by-brand.component.css',
})
export class TransactionHistoryByBrandComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  isLoading = false;
  transactions: BrandTransaction[] = [];

  // ─── Date filter ──────────────────────────────────────────────────────────
  fromDate = '';
  toDate = '';

  // ─── Analytics ────────────────────────────────────────────────────────────
  analytics: BrandAnalytics = {
    totalTransactions: 0,
    totalTopupAmount: 0,
    totalPoints: 0,
    totalPointValue: 0,
    cancelledTopup: 0,
    cancelledSales: 0,
    addPoints: 0,
    cancelAddPoints: 0,
  };

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'brand_id',        label: 'Brand',         sortable: true },
    { key: 'ReceiptNo',       label: 'Receipt No',    sortable: true },
    { key: 'TransactionType', label: 'Type',          sortable: true },
    { key: 'MemberName',      label: 'Member',        sortable: true },
    { key: 'CardNo',          label: 'Card No',       sortable: true },
    { key: 'PointDate',       label: 'Date',          sortable: true },
    { key: 'PointTime',       label: 'Time',          sortable: true },
    { key: 'TopupAmount',     label: 'Topup Amount',  sortable: true },
    { key: 'Points',          label: 'Points',        sortable: true },
    { key: 'PointValue',      label: 'Point Value',   sortable: true },
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
    { key: 'brand_id',        label: 'Brand'         },
    { key: 'ReceiptNo',       label: 'Receipt No'    },
    { key: 'TransactionType', label: 'Type'          },
    { key: 'MemberName',      label: 'Member'        },
    { key: 'CardNo',          label: 'Card No'       },
    { key: 'PointDate',       label: 'Date'          },
    { key: 'PointTime',       label: 'Time'          },
    { key: 'TopupAmount',     label: 'Topup Amount'  },
    { key: 'Points',          label: 'Points'        },
    { key: 'PointValue',      label: 'Point Value'   },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

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
      .getMethod(`api/v1/member/historytransactionsbybrand/${this.fromDate}/${this.toDate}`)
      .subscribe({
        next: (res: any) => {
          this.transactions = res.data || [];
          this.calculateAnalytics();
          this.isLoading = false;
          this.tableConfig = { ...this.tableConfig, loading: false };
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.tableConfig = { ...this.tableConfig, loading: false };
          this.notificationService.showError(
            'Load Failed',
            err.error?.message || 'Failed to load brand transaction history'
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
        .filter(t => t.TransactionType?.toUpperCase() === 'TOPUP')
        .reduce((sum, t) => sum + parseFloat(t.TopupAmount || '0'), 0),

      totalPoints: txns
        .reduce((sum, t) => sum + parseFloat(t.Points || '0'), 0),

      totalPointValue: txns
        .reduce((sum, t) => sum + parseFloat(t.PointValue || '0'), 0),

      cancelledTopup:   txns.filter(t => t.TransactionType === 'TOPUP_CANCEL').length,
      cancelledSales:   txns.filter(t => t.TransactionType === 'MANUAL_CANCEL').length,
      addPoints:        txns.filter(t => t.TransactionType === 'MANUAL_SALES').length,
      cancelAddPoints:  txns.filter(t => t.TransactionType === 'Reset').length,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getBadgeVariant(type: string): 'success' | 'info' | 'warning' | 'secondary' | 'danger' {
    const map: Record<string, 'success' | 'info' | 'warning' | 'secondary' | 'danger'> = {
      'TOPUP':         'success',
      'Sales':         'info',
      'Activation':    'warning',
      'Redemption':    'secondary',
      'TOPUP_CANCEL':  'danger',
      'MANUAL_CANCEL': 'danger',
      'MANUAL_SALES':  'info',
      'Reset':         'warning',
    };
    return map[type] ?? 'secondary';
  }

  formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  onPageChange(_page: number): void {}
}