import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';

export interface PaymentLog {
  EntryNo: number;
  OrderID: string;
  amount: string;
  cardnumber: string;
  tenantID: string;
  brand_id: string | null;
  EntryStatus: string | null;
  tenderType: string;
  bankTransaction: string | null;
  TransDate: string | null;
  TransTime: string | null;
  LastModifiedOn: string;
}

@Component({
  selector: 'app-payment-log',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    TableComponent,
    TableCellDirective,
    BadgeComponent,
    ExportExcelComponent,
  ],
  templateUrl: './payment-log.component.html',
  styleUrl: './payment-log.component.css',
})
export class PaymentLogComponent implements OnInit {
  // ─── State ─────────────────────────────────────────────────────────────────
  isLoading = false;
  paymentLogData: PaymentLog[] = [];

  // ─── Table ─────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'EntryNo',      label: 'Entry No',      },
    { key: 'OrderID',      label: 'Order ID',      },
    { key: 'cardnumber',   label: 'Card Number',   },
    { key: 'amount',       label: 'Amount',        },
    { key: 'tenderType',   label: 'Tender Type',   },
    { key: 'brand_id',     label: 'Brand',         },
    { key: 'EntryStatus',  label: 'Status',      align: 'center' },
    { key: 'TransDate',    label: 'Trans Date',  transform:'date'   },
    { key: 'TransTime',    label: 'Trans Time'                   },
    { key: 'LastModifiedOn', label: 'Last Modified', transform:'date' },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No payment log records found',
  };

  // ─── Export ────────────────────────────────────────────────────────────────
  exportColumns: ExportColumn[] = [
    { key: 'EntryNo',        label: 'Entry No'      },
    { key: 'OrderID',        label: 'Order ID'      },
    { key: 'cardnumber',     label: 'Card Number'   },
    { key: 'amount',         label: 'Amount'        },
    { key: 'tenderType',     label: 'Tender Type'   },
    { key: 'brand_id',       label: 'Brand'         },
    { key: 'EntryStatus',    label: 'Status'        },
    { key: 'TransDate',      label: 'Trans Date'    },
    { key: 'TransTime',      label: 'Trans Time'    },
    { key: 'LastModifiedOn', label: 'Last Modified' },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPaymentLog();
  }

  // ─── Data ───────────────────────────────────────────────────────────────────

  loadPaymentLog(): void {
    this.isLoading = true;
    this.dataService.getMethod('api/v1/member/getpaymentlog').subscribe({
      next: (data: any) => {
        this.paymentLogData = data.data || [];
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.notificationService.showError(
          'Load Failed',
          error.error?.message || 'Failed to load payment log'
        );
      },
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  getStatusVariant(status: string | null): 'success' | 'danger' | 'warning' {
    if (!status) return 'warning';
    const s = status.toLowerCase();
    if (s === 'success') return 'success';
    if (s === 'fail' || s === 'failed') return 'danger';
    return 'warning';
  }

  onPageChange(page: number): void {}
}