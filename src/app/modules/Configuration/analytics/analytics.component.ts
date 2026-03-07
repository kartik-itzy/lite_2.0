import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
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

export interface CouponAnalyticsRow {
  targetID: string;
  campaignID: string;
  campaignName: string;
  targetName: string;
  sent: number;
  opened: number;
  used: number;
  senttime: string[];
}

export interface CampaignMember {
  membershipid: string;
  sendID: string | null;
  targetID: string;
  targetName: string | null;
  campaignID: string;
  campaignName: string;
  received: string;
  opened: string;
  used: string;
  FullName: string;
}

export interface CampaignSendGroup {
  sendID: string | null;
  senttime: string;
  members: CampaignMember[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    ModalComponent,
    TableComponent,
    TableCellDirective,
    ExportExcelComponent,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit {
  private fb = inject(FormBuilder);

  // ─── State ──────────────────────────────────────────────────────────────────
  isLoading = false;
  isDetailLoading = false;
  isDetailModalOpen = false;

  // Active send-group tab index in the detail modal
  activeTabIndex = 0;

  // Selected row for detail drill-down
  selectedRow: CouponAnalyticsRow | null = null;

  // ─── Data ───────────────────────────────────────────────────────────────────
  analyticsData: CouponAnalyticsRow[] = [];
  detailSendGroups: CampaignSendGroup[] = [];

  // ─── Date filter form ───────────────────────────────────────────────────────
  filterForm!: FormGroup;

  // ─── Summary KPIs ────────────────────────────────────────────────────────────
  get totalSent(): number {
    return this.analyticsData.reduce((s, r) => s + (r.sent || 0), 0);
  }
  get totalOpened(): number {
    return this.analyticsData.reduce((s, r) => s + (r.opened || 0), 0);
  }
  get totalUsed(): number {
    return this.analyticsData.reduce((s, r) => s + (r.used || 0), 0);
  }
  get openRate(): string {
    if (!this.totalSent) return '0%';
    return ((this.totalOpened / this.totalSent) * 100).toFixed(1) + '%';
  }

  // ─── Main table ─────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'campaignID',   label: 'Campaign ID',   sortable: true },
    { key: 'campaignName', label: 'Campaign Name', sortable: true },
    { key: 'targetID',     label: 'Target ID',     sortable: true },
    { key: 'targetName',   label: 'Target Name',   sortable: true },
    { key: 'sent',         label: 'Sent',          sortable: true },
    { key: 'opened',       label: 'Opened',        sortable: true },
    { key: 'used',         label: 'Used',          sortable: true },
    { key: 'senttime',     label: 'Last Sent',     sortable: true },
    { key: 'actions',      label: 'Details',       align: 'center' },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No analytics data. Select a date range and click Load.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'campaignID',   label: 'Campaign ID'   },
    { key: 'campaignName', label: 'Campaign Name' },
    { key: 'targetID',     label: 'Target ID'     },
    { key: 'targetName',   label: 'Target Name'   },
    { key: 'sent',         label: 'Sent'          },
    { key: 'opened',       label: 'Opened'        },
    { key: 'used',         label: 'Used'          },
  ];

  // ─── Detail table (inside modal) ────────────────────────────────────────────
  memberColumns: TableColumn[] = [
    { key: 'FullName',      label: 'Full Name',    sortable: true },
    { key: 'membershipid',  label: 'Membership ID', sortable: true },
    { key: 'received',      label: 'Received',     align: 'center' },
    { key: 'opened',        label: 'Opened',       align: 'center' },
    { key: 'used',          label: 'Used',         align: 'center' },
  ];

  memberTableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No members for this send',
  };

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService
  ) {}

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const today = new Date();
    const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);

    this.filterForm = this.fb.group({
      fromDate: [this.formatDate(sixMonthsAgo), Validators.required],
      toDate:   [this.formatDate(today),        Validators.required],
    });

    this.loadAnalytics();
  }

  // ─── API calls ───────────────────────────────────────────────────────────────

  loadAnalytics(): void {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { fromDate, toDate } = this.filterForm.value;

    this.dataService
      .postMethod('api/v1/member/couponAnalytics', JSON.stringify({ fromDate, toDate }))
      .subscribe({
        next: (data: any) => {
          this.analyticsData = data.data || [];
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.notificationService.showError(
            'Load Failed',
            error.error?.message || 'Failed to load coupon analytics'
          );
        },
      });
  }

  openDetailModal(row: CouponAnalyticsRow): void {
    this.selectedRow = row;
    this.activeTabIndex = 0;
    this.detailSendGroups = [];
    this.isDetailModalOpen = true;
    this.isDetailLoading = true;

    this.dataService
      .postMethod(
        'api/v1/member/CouponAnalyticsPerCampaign',
        JSON.stringify({
          targetIDs:   [row.targetID],
          campaignIDs: [row.campaignID],
        })
      )
      .subscribe({
        next: (data: any) => {
          this.detailSendGroups = data.data || [];
          this.isDetailLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isDetailLoading = false;
          this.notificationService.showError(
            'Detail Load Failed',
            error.error?.message || 'Failed to load campaign detail'
          );
        },
      });
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    this.selectedRow = null;
    this.detailSendGroups = [];
  }

  // ─── Active send group ────────────────────────────────────────────────────────

  get activeGroup(): CampaignSendGroup | null {
    return this.detailSendGroups[this.activeTabIndex] ?? null;
  }

  setActiveTab(index: number): void {
    this.activeTabIndex = index;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  latestSentTime(row: CouponAnalyticsRow): string {
    if (!row.senttime?.length) return '—';
    const sorted = [...row.senttime].sort((a, b) => b.localeCompare(a));
    return sorted[0];
  }

  getBadgeVariant(value: string): 'success' | 'danger' {
    return value?.toLowerCase() === 'yes' ? 'success' : 'danger';
  }

  onPageChange(page: number): void {}
}