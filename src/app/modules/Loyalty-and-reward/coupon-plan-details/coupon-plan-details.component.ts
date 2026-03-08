import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
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

export interface CouponHeader {
  Code: string;
  tenant_id: string;
  CouponType: string;
  Description: string;
  StartingDate: string;
  EndingDate: string;
  ValueFormula: string;
  CurrentStatus: string;
  NumberofCoupons: number;
  MaxCouponPerMember: number;
  Auto_generated: string;
  LimitMaxCoupon: string;
  ValidateLineCode: string;
  MinTotalValue: string;
  imagepath: string | null;
  Termsandconditions: string | null;
  DisplayText: string | null;
}

export interface CouponLine {
  LineNo: number;
  Code: string;
  CouponCode: string;
  StartingDate: string;
  EndingDate: string;
  ValueFormula: string;
  CouponUsed: string;
  ReceiptNo: string | null;
  StoreID: string | null;
  POSID: string | null;
  UseDate: string | null;
  CurrentStatus: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-coupon-plan-details',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardComponent, ButtonComponent, BadgeComponent,
    TableComponent, TableCellDirective,
    InputComponent, SelectComponent, ModalComponent,
  ],
  templateUrl: './coupon-plan-details.component.html',
  styleUrl: './coupon-plan-details.component.css',
})
export class CouponPlanDetailsComponent implements OnInit {

  // ─── Route param ──────────────────────────────────────────────────────────
  couponCode = '';

  // ─── Header ───────────────────────────────────────────────────────────────
  header: CouponHeader | null = null;
  isHeaderLoading = false;
  editHeader: Partial<CouponHeader> = {};

  couponTypeOptions: SelectOption[] = [
    { value: 'CAMPAIGN', label: 'Campaign' },
    { value: 'TOPUP',    label: 'Top-Up'   },
    { value: 'SPECIAL',  label: 'Special'  },
  ];
  statusOptions: SelectOption[] = [
    { value: 'OPEN',   label: 'OPEN'   },
    { value: 'CLOSED', label: 'CLOSED' },
  ];
  autoGenOptions: SelectOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No',  label: 'No'  },
  ];
  limitMaxOptions: SelectOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No',  label: 'No'  },
  ];
  validateLineOptions: SelectOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No',  label: 'No'  },
  ];

  // ─── Lines — server-side pagination ───────────────────────────────────────
  lines: CouponLine[] = [];
  currentPage = 1;
  totalCount = 0;
  pageCount = 0;
  isLinesLoading = false;
  lineSearchTerm = '';
  isSearchMode = false;

  lineColumns: TableColumn[] = [
    { key: 'CouponCode',   label: 'Coupon Code',   sortable: true  },
    { key: 'StartingDate', label: 'Starting Date', sortable: true  },
    { key: 'EndingDate',   label: 'Ending Date',   sortable: true  },
    { key: 'ValueFormula', label: 'Value Formula', sortable: true  },
    { key: 'CouponUsed',   label: 'Used',          sortable: true  },
    { key: 'CurrentStatus',label: 'Status',        sortable: true  },
    { key: 'ReceiptNo',    label: 'Receipt No',    sortable: false },
    { key: 'StoreID',      label: 'Store',         sortable: false },
    { key: 'POSID',        label: 'POS',           sortable: false },
    { key: 'UseDate',      label: 'Use Date',      sortable: false },
    { key: 'actions',      label: 'Actions',       sortable: false },
  ];

  linesConfig: TableConfig = {
    selectable: false,
    pagination: false,   // manual server-side pagination
    searchable: false,
    loading: false,
    emptyMessage: 'No coupon lines. Use "Generate Lines" to create coupons.',
  };

  // ─── Generate lines modal ─────────────────────────────────────────────────
  showGenerateModal = false;
  generateQty: number | null = null;
  isGenerating = false;

  // ─── Image modal ──────────────────────────────────────────────────────────
  showImageModal = false;
  isUploadingImage = false;
  isDeletingImage = false;

  // ─── T&C modal ────────────────────────────────────────────────────────────
  showTCModal = false;
  tcText = '';
  isSavingTC = false;

  // ─── CSV export ───────────────────────────────────────────────────────────
  isExporting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.couponCode = this.route.snapshot.paramMap.get('couponCode') as string;
    if (!this.couponCode) {
      this.notificationService.showError('Invalid Route', 'No coupon code provided');
      this.router.navigate(['/crafted/retail/coupon']);
      return;
    }
    this.loadHeader();
    this.loadLines(1);
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  loadHeader(): void {
    this.isHeaderLoading = true;
    this.dataService.getMethod('api/v1/coupon/all').subscribe({
      next: (res: any) => {
        const found = (res.data || []).find((c: any) => c.Code === this.couponCode);
        this.header = found ?? null;
        this.editHeader = { ...found };
        this.isHeaderLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isHeaderLoading = false;
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load header');
      },
    });
  }

  saveHeaderField(field: keyof CouponHeader, value: any): void {
    if (field === 'EndingDate' && this.editHeader.StartingDate && value < this.editHeader.StartingDate) {
      this.notificationService.showError('Invalid Date', 'Ending date must be on or after starting date');
      return;
    }
    // Block CouponType change from SPECIAL when image exists
    if (field === 'CouponType' && this.header?.CouponType === 'SPECIAL' && this.header?.imagepath) {
      this.notificationService.showError('Cannot Change', 'To change the coupon type, please delete the image first');
      this.editHeader.CouponType = this.header.CouponType;
      return;
    }
    this.dataService.putMethod(`api/v1/coupon/header/${this.couponCode}`, JSON.stringify({
      column: field,
      value: value,
    })).subscribe({
      next: () => {
        this.notificationService.showSuccess('Updated', `${field} updated`);
        this.loadHeader();
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError('Update Failed', err.error?.message || `Failed to update ${field}`);
      },
    });
  }

  onStatusChange(value: string): void {
    if (value === this.header?.CurrentStatus) return;
    this.confirmationService.confirmAction('Change Status', `Change status to <strong>${value}</strong>?`, 'warning').then(confirmed => {
      if (!confirmed) { this.editHeader.CurrentStatus = this.header?.CurrentStatus; return; }
      this.saveHeaderField('CurrentStatus', value);
    });
  }

  onCouponTypeChange(value: string): void {
    if (value === this.header?.CouponType) return;
    if (this.header?.CouponType === 'SPECIAL' && this.header?.imagepath) {
      this.notificationService.showError('Cannot Change', 'To change the coupon type, please delete the image first');
      this.editHeader.CouponType = this.header.CouponType;
      return;
    }
    this.confirmationService.confirmAction('Change Type', `Change coupon type to <strong>${value}</strong>?`, 'warning').then(confirmed => {
      if (!confirmed) { this.editHeader.CouponType = this.header?.CouponType; return; }
      this.saveHeaderField('CouponType', value);
    });
  }

  // ─── Lines — server-side pagination ───────────────────────────────────────

  loadLines(page: number): void {
    this.isLinesLoading = true;
    this.linesConfig = { ...this.linesConfig, loading: true };
    this.currentPage = page;
    this.dataService.getMethod(`api/v1/coupon/details/${this.couponCode}/${page}`).subscribe({
      next: (res: any) => {
        this.lines = res.data || [];
        this.totalCount = res.totalcount || 0;
        this.pageCount = res.pagecount || 0;
        this.isLinesLoading = false;
        this.linesConfig = { ...this.linesConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLinesLoading = false;
        this.linesConfig = { ...this.linesConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load lines');
      },
    });
  }

  searchLines(): void {
    const term = this.lineSearchTerm.trim();
    if (!term) {
      this.isSearchMode = false;
      this.loadLines(1);
      return;
    }
    this.isSearchMode = true;
    this.isLinesLoading = true;
    this.linesConfig = { ...this.linesConfig, loading: true };
    this.dataService.getMethod(`api/v1/coupon/searchcouponline/${this.couponCode}/${term}`).subscribe({
      next: (res: any) => {
        this.lines = res.data || [];
        this.totalCount = this.lines.length;
        this.pageCount = 1;
        this.currentPage = 1;
        this.isLinesLoading = false;
        this.linesConfig = { ...this.linesConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLinesLoading = false;
        this.linesConfig = { ...this.linesConfig, loading: false };
        this.notificationService.showError('Search Failed', err.error?.message || 'Search failed');
      },
    });
  }

  clearSearch(): void {
    this.lineSearchTerm = '';
    this.isSearchMode = false;
    this.loadLines(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pageCount) return;
    this.loadLines(page);
  }

  getPageNumbers(): number[] {
    const total = this.pageCount;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  }

  formatTotal(n: number): string {
    if (n >= 1e6) return (n / 1e6).toFixed(2) + ' M';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + ' K';
    return String(n);
  }

  // ─── Delete single line ───────────────────────────────────────────────────

  deleteLine(line: CouponLine): void {
    if (line.CouponUsed === 'Yes' || line.CurrentStatus !== 'OPEN') {
      this.notificationService.showError('Cannot Delete', 'Coupon is used or not in OPEN status');
      return;
    }
    this.confirmationService.confirmDelete(line.CouponCode, 'coupon line').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/coupon/lines/${this.couponCode}/${line.LineNo}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', 'Line deleted');
          this.loadLines(this.currentPage);
          this.loadHeader();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete line');
        },
      });
    });
  }

  // ─── Delete ALL lines ─────────────────────────────────────────────────────

  deleteAllLines(): void {
    this.confirmationService.confirmAction(
      'Delete All Lines',
      `Delete <strong>all coupon lines</strong> for <strong>${this.couponCode}</strong>? This cannot be undone.`,
      'danger'
    ).then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/coupon/lines/${this.couponCode}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', 'All lines deleted');
          this.loadLines(1);
          this.loadHeader();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete lines');
        },
      });
    });
  }

  // ─── Generate lines modal ─────────────────────────────────────────────────

  openGenerateModal(): void {
    this.generateQty = null;
    this.showGenerateModal = true;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
    this.generateQty = null;
  }

  generateLines(): void {
    if (!this.generateQty || this.generateQty <= 0) {
      this.notificationService.showError('Validation', 'Enter a valid quantity');
      return;
    }
    if (this.generateQty > 100000) {
      this.notificationService.showError('Validation', 'Maximum limit is 100,000');
      return;
    }
    if (!this.header) return;

    this.isGenerating = true;
    this.dataService.postMethod('api/v1/coupon/lines', JSON.stringify({
      quantity:     this.generateQty,
      code:         this.couponCode,
      StartingDate: this.header.StartingDate,
      EndingDate:   this.header.EndingDate,
      ValueFormula: this.header.ValueFormula,
      StoreGroup:   '',
      CurrentStatus: this.header.CurrentStatus,
    })).subscribe({
      next: () => {
        this.isGenerating = false;
        this.notificationService.showSuccess('Generated', `${this.generateQty} coupon lines created`);
        this.closeGenerateModal();
        this.loadLines(1);
        this.loadHeader();
      },
      error: (err: HttpErrorResponse) => {
        this.isGenerating = false;
        this.notificationService.showError('Generate Failed', err.error?.message || 'Failed to generate lines');
      },
    });
  }

  // ─── CSV Export ───────────────────────────────────────────────────────────

  exportCSV(): void {
    this.isExporting = true;
    this.dataService.postMethod(`api/v1/coupon/linetoexport/${this.couponCode}`, '').subscribe({
      next: () => { this.isExporting = false; },
      error: (err: HttpErrorResponse) => {
        this.isExporting = false;
        // API returns CSV via error.error.text pattern
        if (err.error?.text) {
          const blob = new Blob([err.error.text], { type: 'text/csv' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `Coupon_Lines_${this.couponCode}.csv`;
          link.click();
        } else {
          this.notificationService.showError('Export Failed', err.error?.message || 'Failed to export');
        }
      },
    });
  }

  // ─── Image modal ──────────────────────────────────────────────────────────

  openImageModal(): void {
    if (this.header?.imagepath) {
      this.notificationService.showError('Image Exists', 'Please delete the existing image first');
      return;
    }
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const ext = file.type.split('/').pop()?.toLowerCase();
    if (!['jpeg', 'jpg', 'png'].includes(ext || '')) {
      this.notificationService.showError('Invalid File', 'Please select a JPEG or PNG image');
      return;
    }
    this.isUploadingImage = true;
    this.dataService.getBase64(file).then((base64: any) => {
      const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
      this.dataService.postMethod(`api/v1/coupon/upload/image/${this.couponCode}`, JSON.stringify({
        column: 'imagepath',
        filename: file.name,
        image: base64Data,
      })).subscribe({
        next: () => {
          this.isUploadingImage = false;
          this.notificationService.showSuccess('Uploaded', 'Image uploaded');
          this.closeImageModal();
          this.loadHeader();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingImage = false;
          this.notificationService.showError('Upload Failed', err.error?.message || 'Failed to upload');
        },
      });
    });
  }

  deleteImage(): void {
    if (!this.header?.imagepath) return;
    this.confirmationService.confirmAction('Delete Image', 'Are you sure you want to delete this image?', 'danger').then(confirmed => {
      if (!confirmed) return;
      const match = this.header!.imagepath!.match(/\/([^/]+)$/);
      if (!match) return;
      const base64Name = btoa(match[1]);
      this.isDeletingImage = true;
      this.dataService.deleteMethod(`api/v1/coupon/delete/image/${base64Name}`).subscribe({
        next: () => {
          this.isDeletingImage = false;
          this.notificationService.showSuccess('Deleted', 'Image deleted');
          this.loadHeader();
        },
        error: (err: HttpErrorResponse) => {
          this.isDeletingImage = false;
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete image');
        },
      });
    });
  }

  // ─── T&C modal ────────────────────────────────────────────────────────────

  openTCModal(): void {
    this.tcText = this.header?.Termsandconditions || '';
    this.showTCModal = true;
  }

  closeTCModal(): void {
    this.showTCModal = false;
    this.tcText = '';
  }

  saveTC(): void {
    if (!this.tcText.trim()) return;
    this.isSavingTC = true;
    this.dataService.putMethod(`api/v1/coupon/header/${this.couponCode}`, JSON.stringify({
      column: 'Termsandconditions',
      value: this.tcText,
    })).subscribe({
      next: () => {
        this.isSavingTC = false;
        this.notificationService.showSuccess('Saved', 'Terms & conditions saved');
        this.closeTCModal();
        this.loadHeader();
      },
      error: (err: HttpErrorResponse) => {
        this.isSavingTC = false;
        this.notificationService.showError('Save Failed', err.error?.message || 'Failed to save T&C');
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

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

  getCouponUsedVariant(used: string): 'danger' | 'success' {
    return used === 'Yes' ? 'danger' : 'success';
  }

  goBack(): void {
    this.router.navigate(['/crafted/retail/couponlist']);
  }
}