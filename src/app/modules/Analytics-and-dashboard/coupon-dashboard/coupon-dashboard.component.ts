import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
import { ExportExcelComponent } from '../../../components/ui/export-excel/export-excel.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface DashboardRow {
  CouponType: string;
  Label: string;
  total: number;
}

export interface CouponOption {
  Code: string;
  Description?: string;
  CouponType?: string;
}

export interface StatusBreakdown {
  Code?: string;
  ALL: number;
  USED: number;
  RESERVED: number;
  OPEN: number;
  VOIDED: number;
}

export interface CouponDetail {
  CouponCode: string;
  StartingDate: string;
  EndingDate: string;
  CurrentStatus: string;
  MemberShipID: string;
  MemberName: string;
  UseDate: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-coupon-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    TableCellDirective,
    SelectComponent,
    ExportExcelComponent,
  ],
  templateUrl: './coupon-dashboard.component.html',
  styleUrl: './coupon-dashboard.component.css',
})
export class CouponDashboardComponent implements OnInit {

  // ─── Step 1: summary ──────────────────────────────────────────────────────
  dashboardRows: DashboardRow[] = [];
  selectedRow: DashboardRow | null = null;

  summaryColumns: TableColumn[] = [
    { key: 'Label', label: 'Category', sortable: true },
    { key: 'total', label: 'Total',    sortable: true },
  ];

  summaryConfig: TableConfig = {
    selectable: false,
    pagination: false,
    searchable: true,
    loading: false,
    emptyMessage: 'No data found.',
  };

  // ─── Step 2: coupon code dropdown ─────────────────────────────────────────
  couponOptions: SelectOption[] = [];
  selectedCode = '';
  isDropdownLoading = false;

  // Map from CouponType → key in dropdown API response
  private readonly dropdownKeyMap: Record<string, string> = {
    Allcoupon:        'allCoupons',
    ActiveCoupons:    'activeCoupons',
    NonActiveCoupons: 'nonActiveCoupons',
    DEAL:             'dealCoupons',
    NORMAL:           'normalCoupons',
    CAMPAIGN:         'campaignCoupons',
    TOPUP:            'topupCoupons',
    SPECIAL:          'allCoupons',
  };

  // ─── Step 3: status breakdown ─────────────────────────────────────────────
  statusRows: StatusBreakdown[] = [];
  showStatusGrid = false;

  statusColumns: TableColumn[] = [
    { key: 'Code',     label: 'Coupon Code', sortable: true },
    { key: 'ALL',      label: 'All',         sortable: true },
    { key: 'USED',     label: 'Used',        sortable: true },
    { key: 'RESERVED', label: 'Reserved',    sortable: true },
    { key: 'OPEN',     label: 'Open',        sortable: true },
    { key: 'VOIDED',   label: 'Voided',      sortable: true },
  ];

  statusConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 7,
    searchable: false,
    loading: false,
    emptyMessage: 'No status data for this coupon.',
  };

  // ─── Step 4: detail grid ──────────────────────────────────────────────────
  detailRows: CouponDetail[] = [];
  showDetailGrid = false;
  totalCount = 0;
  selectedStatusType = 'ALL';

  detailColumns: TableColumn[] = [
    { key: 'CouponCode',    label: 'Coupon Code',   sortable: true },
    { key: 'StartingDate',  label: 'Start Date',    sortable: true },
    { key: 'EndingDate',    label: 'End Date',      sortable: true },
    { key: 'CurrentStatus', label: 'Status',        sortable: true },
    { key: 'MemberShipID',  label: 'Membership ID', sortable: true },
    { key: 'MemberName',    label: 'Member Name',   sortable: true },
    { key: 'UseDate',       label: 'Use Date',      sortable: true },
  ];

  detailConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 30,
    searchable: true,
    loading: false,
    emptyMessage: 'No coupon details found.',
  };

  detailExportColumns = [
    { key: 'CouponCode',    label: 'Coupon Code'   },
    { key: 'StartingDate',  label: 'Start Date'    },
    { key: 'EndingDate',    label: 'End Date'      },
    { key: 'CurrentStatus', label: 'Status'        },
    { key: 'MemberShipID',  label: 'Membership ID' },
    { key: 'MemberName',    label: 'Member Name'   },
    { key: 'UseDate',       label: 'Use Date'      },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadDashboard();
  }

  // ─── Step 1: load summary ─────────────────────────────────────────────────

  loadDashboard(): void {
    this.summaryConfig = { ...this.summaryConfig, loading: true };

    this.dataService.getMethod('api/v1/coupon/dashboard').subscribe({
      next: (res: any) => {
        this.dashboardRows = res.data || [];
        this.summaryConfig = { ...this.summaryConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.summaryConfig = { ...this.summaryConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load coupon dashboard');
      },
    });
  }

  // ─── Step 2: row click → load coupon dropdown ────────────────────────────

  onRowClick(row: any): void {
    if (row.total === 0) return;

    this.selectedRow = row;
    this.selectedCode = '';
    this.couponOptions = [];
    this.statusRows = [];
    this.showStatusGrid = false;
    this.detailRows = [];
    this.showDetailGrid = false;

    this.loadCouponDropdown(row.CouponType);
  }

  loadCouponDropdown(couponType: string): void {
    this.isDropdownLoading = true;

    this.dataService.getMethod('api/v1/coupon/dashboard/dropdown').subscribe({
      next: (res: any) => {
        const key = this.dropdownKeyMap[couponType] ?? 'allCoupons';
        const list: CouponOption[] = res.data?.[key] || [];
        this.couponOptions = list.map(c => ({
          value: c.Code,
          label: c.Description ? `${c.Code} — ${c.Description}` : c.Code,
        }));
        this.isDropdownLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isDropdownLoading = false;
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load coupons');
      },
    });
  }

  // ─── Step 3: coupon selected → status breakdown ──────────────────────────

  onCodeChanged(code: string): void {
    if (!code) return;
    this.selectedCode = code;
    this.detailRows = [];
    this.showDetailGrid = false;
    this.loadStatusBreakdown(code);
  }

  loadStatusBreakdown(code: string): void {
    this.statusConfig = { ...this.statusConfig, loading: true };

    this.dataService.getMethod(`api/v1/coupon/dashboard/coupondetail/${code}`).subscribe({
      next: (res: any) => {
        const raw = res.data;
        this.statusRows = Array.isArray(raw) ? raw : (raw ? [raw] : []);
        this.showStatusGrid = true;
        this.statusConfig = { ...this.statusConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.statusConfig = { ...this.statusConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load status breakdown');
      },
    });
  }

  // ─── Step 4: status row click → detail grid ─────────────────────────────

  onStatusRowClick(row: any): void {
    // Default to ALL when clicking a row; user sees full breakdown
    this.selectedStatusType = 'ALL';
    this.loadCouponDetails('ALL', 1);
  }

  onStatusCellClick(statusType: string, row: StatusBreakdown): void {
    const count = (row as any)[statusType] ?? 0;
    if (count === 0) return;
    this.selectedStatusType = statusType;
    this.loadCouponDetails(statusType, 1);
  }

  loadCouponDetails(statusType: string, page: number): void {
    this.detailConfig = { ...this.detailConfig, loading: true };

    this.dataService.getMethod(`api/v1/coupon/dashboard/coupondetails/${statusType}/${this.selectedCode}/${page}`).subscribe({
      next: (res: any) => {
        this.detailRows  = res.data?.lines || res.data || [];
        this.totalCount  = res.data?.totalcount ?? this.detailRows.length;
        this.showDetailGrid = true;
        this.detailConfig = { ...this.detailConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.detailConfig = { ...this.detailConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load coupon details');
      },
    });
  }

  // ─── Export all CSV ───────────────────────────────────────────────────────

  exportAllToCsv(): void {
    this.dataService.postMethod(
      `api/v1/coupon/dashboard/linetoexport/${this.selectedStatusType}/${this.selectedCode}`, ''
    ).subscribe({
      next: () => {},
      error: (err: any) => {
        if (err?.error?.text) {
          const blob = new Blob([err.error.text], { type: 'text/csv' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `coupon-export-${this.selectedCode}.csv`;
          link.click();
        }
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  isSubType(row: DashboardRow): boolean {
    return row.Label.includes('SubType');
  }

  trimLabel(row: DashboardRow): string {
    return row.Label.trim();
  }

  getStatusBadgeVariant(status: string): 'success' | 'danger' | 'warning' | 'secondary' | 'info' {
    const map: Record<string, 'success' | 'danger' | 'warning' | 'secondary' | 'info'> = {
      OPEN:     'success',
      USED:     'secondary',
      RESERVED: 'info',
      VOIDED:   'danger',
    };
    return map[status?.toUpperCase()] ?? 'secondary';
  }

  onPageChange(page: number): void {
    if (this.showDetailGrid) this.loadCouponDetails(this.selectedStatusType, page);
  }
}