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

export interface CouponPlan {
  tenant_id: string;
  Code: string;
  CouponType: string;
  Description: string;
  StartingDate: string;
  EndingDate: string;
  ValueFormula: string;
  CurrentStatus: string;
  NumberofCoupons: number;
  MaxCouponPerMember: number;
  Auto_generated: string;
  imagepath: string | null;
  Termsandconditions: string | null;
  LastModifiedOn: string;
}

@Component({
  selector: 'app-coupon-plan',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardComponent, ButtonComponent, BadgeComponent,
    TableComponent, TableCellDirective,
    InputComponent, ExportExcelComponent, ModalComponent,
  ],
  templateUrl: './coupon-plan.component.html',
  styleUrl: './coupon-plan.component.css',
})
export class CouponPlanComponent implements OnInit {

  coupons: CouponPlan[] = [];

  // ─── Add modal ────────────────────────────────────────────────────────────
  showAddModal = false;
  newCouponCode = '';
  isCreating = false;

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
    { key: 'Code',            label: 'Code'             },
    { key: 'CouponType',      label: 'Coupon Type'      },
    { key: 'Description',     label: 'Description'      },
    { key: 'StartingDate',    label: 'Starting Date'    },
    { key: 'EndingDate',      label: 'Ending Date'      },
    { key: 'CurrentStatus',   label: 'Status'           },
    { key: 'NumberofCoupons', label: 'No. of Coupons'   },
    { key: 'ValueFormula',    label: 'Value Formula'    },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.tableConfig = { ...this.tableConfig, loading: true };
    this.dataService.getMethod('api/v1/coupon/all').subscribe({
      next: (res: any) => {
        this.coupons = res.data || [];
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load coupon plans');
      },
    });
  }

  onDelete(coupon: CouponPlan): void {
    this.confirmationService.confirmDelete(coupon.Code, 'coupon plan').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/coupon/plan/${coupon.tenant_id}/${coupon.Code}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', `Coupon plan "${coupon.Code}" deleted`);
          this.loadCoupons();
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message || '';
          const inUse = msg.toLowerCase().includes('exists') || err.status === 409;
          this.notificationService.showError('Delete Failed', inUse ? "Coupon's exist in the system and cannot be deleted" : msg || 'Failed to delete');
        },
      });
    });
  }

  openAddModal(): void {
    this.newCouponCode = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newCouponCode = '';
  }

  createCoupon(): void {
    if (!this.newCouponCode.trim()) {
      this.notificationService.showError('Validation', 'Coupon code is required');
      return;
    }
    this.isCreating = true;
    this.dataService.postMethod('api/v1/coupon/header', JSON.stringify({
      Code: this.newCouponCode.trim(),
    })).subscribe({
      next: (res: any) => {
        this.isCreating = false;
        if (res.status === 200) {
          const code = this.newCouponCode.trim();
          this.notificationService.showSuccess('Created', `Coupon "${code}" created`);
          this.closeAddModal();
          this.router.navigate(['/crafted/retail/coupon', code]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isCreating = false;
        this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create coupon');
      },
    });
  }

  onRowClick(coupon: any): void {
    this.router.navigate(['/crafted/retail/couponlist', coupon.Code]);
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'OPEN')   return 'success';
    if (status === 'CLOSED') return 'danger';
    return 'warning';
  }

  getCouponTypeVariant(type: string): 'primary' | 'warning' | 'secondary' {
    if (type === 'SPECIAL')  return 'primary';
    if (type === 'CAMPAIGN') return 'warning';
    return 'secondary';
  }

  onPageChange(_page: number): void {}
}