import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
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

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface RedeemHeader {
  Code: string;
  tenant_id: string;
  Description: string;
  DisplayText: string;
  ActiveDate: string;
  ExpirayDate: string;
  PlanStatus: string;
  RedeemType: string;
  UpdateToVD: string;
  Termsandconditions: string;
  LastModifiedOn: string;
}

export interface RedeemLine {
  LineNo: number;
  Code: string;
  ActiveDate: string;
  ExpiryDate: string;
  LineType: string;
  LineCode: string;
  LineValue: number;
  DealCode: string | null;
  imagepath: string | null;
  imagename: string | null;
  Termsandconditions: string;
  DisplayText: string;
}

export interface CouponDropdown {
  Code: string;
  CouponType: string;
  Description: string;
  NumberofCoupons: number;
  StartingDate: string;
  EndingDate: string;
}

export interface DealDropdown {
  DealCode: string;
  DealType: string;
  StartingDate: string;
  EndingDate: string;
  DealUseCoupon: string;
  MaximumQty: number;
  Description: string;
  CouponCode: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-redeem-plan-details',
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
    SelectComponent,
    ExportExcelComponent,
    ModalComponent,
  ],
  templateUrl: './redeem-plan-details.component.html',
  styleUrl: './redeem-plan-details.component.css',
})
export class RedeemPlanDetailsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // ─── Route param ──────────────────────────────────────────────────────────
  redeemCode = '';

  // ─── Header ───────────────────────────────────────────────────────────────
  header: RedeemHeader | null = null;
  isHeaderLoading = false;
  isSaving = false;

  // Editable header fields
  editDescription       = '';
  editDisplayText       = '';
  editActiveDate        = '';
  editExpiryDate        = '';
  editPlanStatus        = '';
  editUpdateToVD        = '';
  editTerms             = '';

  readonly statusOptions: SelectOption[] = [
    { value: 'Enabled',  label: 'Enabled'  },
    { value: 'Disabled', label: 'Disabled' },
  ];

  readonly updateToVDOptions: SelectOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No',  label: 'No'  },
  ];

  // ─── Lines table ──────────────────────────────────────────────────────────
  lines: RedeemLine[] = [];
  isLinesLoading = false;

  linesColumns: TableColumn[] = [
    { key: 'LineType',    label: 'Line Type',   sortable: true  },
    { key: 'LineCode',    label: 'Line Code',   sortable: true  },
    { key: 'DealCode',    label: 'Deal Code',   sortable: true  },
    { key: 'LineValue',   label: 'Line Value',  sortable: true  },
    { key: 'ActiveDate',  label: 'Active Date', sortable: true  },
    { key: 'ExpiryDate',  label: 'Expiry Date', sortable: true  },
    { key: 'DisplayText', label: 'Display Text',sortable: false },
    { key: 'actions',     label: 'Actions',     sortable: false },
  ];

  linesConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No redeem lines found.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'LineType',   label: 'Line Type'   },
    { key: 'LineCode',   label: 'Line Code'   },
    { key: 'DealCode',   label: 'Deal Code'   },
    { key: 'LineValue',  label: 'Line Value'  },
    { key: 'ActiveDate', label: 'Active Date' },
    { key: 'ExpiryDate', label: 'Expiry Date' },
    { key: 'DisplayText',label: 'Display Text'},
  ];

  // ─── Add line modal ────────────────────────────────────────────────────────
  showAddLineModal = false;
  isAddingLine = false;
  newLine = {
    LineType:    'COUPON',
    LineCode:    '',
    DealCode:    '',
    LineValue:   '',
    ActiveDate:  '',
    ExpiryDate:  '',
    DisplayText: '',
  };

  readonly addLineModalConfig: ModalConfig = {
    title: 'Add Redeem Line',
    size: 'md',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  readonly lineTypeOptions: SelectOption[] = [
    { value: 'COUPON', label: 'Coupon' },
    { value: 'DEAL',   label: 'Deal'   },
  ];

  // ─── Edit line modal ───────────────────────────────────────────────────────
  showEditLineModal = false;
  isUpdatingLine = false;
  editLine: Partial<RedeemLine> & { LineNo?: number } = {};

  readonly editLineModalConfig: ModalConfig = {
    title: 'Edit Redeem Line',
    size: 'md',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  // ─── T&C modal ────────────────────────────────────────────────────────────
  showTCModal = false;
  tcLine: RedeemLine | null = null;
  tcEditValue = '';
  isSavingTC = false;

  readonly tcModalConfig: ModalConfig = {
    title: 'Terms & Conditions',
    size: 'lg',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  // ─── Coupon lookup modal ───────────────────────────────────────────────────
  showCouponLookup = false;
  couponDropdownItems: CouponDropdown[] = [];
  isCouponLookupLoading = false;

  readonly couponLookupModalConfig: ModalConfig = {
    title: 'Select Coupon Code',
    size: 'xl',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  couponLookupColumns: TableColumn[] = [
    { key: 'Code',            label: 'Code',       sortable: true },
    { key: 'CouponType',      label: 'Type',       sortable: true },
    { key: 'Description',     label: 'Description',sortable: true },
    { key: 'NumberofCoupons', label: '# Coupons',  sortable: true },
    { key: 'StartingDate',    label: 'Start',      sortable: true },
    { key: 'EndingDate',      label: 'End',        sortable: true },
    { key: 'select',          label: '',           sortable: false },
  ];

  couponLookupConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No coupons available.',
  };

  // ─── Deal lookup modal ─────────────────────────────────────────────────────
  showDealLookup = false;
  dealDropdownItems: DealDropdown[] = [];
  isDealLookupLoading = false;

  readonly dealLookupModalConfig: ModalConfig = {
    title: 'Select Deal Code',
    size: 'xl',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  dealLookupColumns: TableColumn[] = [
    { key: 'DealCode',     label: 'Deal Code',  sortable: true },
    { key: 'DealType',     label: 'Type',       sortable: true },
    { key: 'Description',  label: 'Description',sortable: true },
    { key: 'StartingDate', label: 'Start',      sortable: true },
    { key: 'EndingDate',   label: 'End',        sortable: true },
    { key: 'MaximumQty',   label: 'Max Qty',    sortable: true },
    { key: 'select',       label: '',           sortable: false },
  ];

  dealLookupConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No deals available.',
  };

  // ─── Image modal ──────────────────────────────────────────────────────────
  showImageModal = false;
  imageLine: RedeemLine | null = null;
  isUploadingImage = false;
  isDeletingImage = false;

  readonly imageModalConfig: ModalConfig = {
    title: 'Add / Delete Image',
    size: 'md',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.redeemCode = params['redeemcode'] || '';
      if (this.redeemCode) {
        this.loadHeader();
        this.loadLines();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Header API ───────────────────────────────────────────────────────────

  loadHeader(): void {
    this.isHeaderLoading = true;
    this.dataService.getMethod('api/v1/redeem/all').subscribe({
      next: (res: any) => {
        const list: RedeemHeader[] = res.data || res || [];
        this.header = list.find(h => h.Code === this.redeemCode) || null;
        if (this.header) this.syncEditFields();
        this.isHeaderLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isHeaderLoading = false;
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load header');
      },
    });
  }

  private syncEditFields(): void {
    if (!this.header) return;
    this.editDescription = this.header.Description       || '';
    this.editDisplayText = this.header.DisplayText       || '';
    this.editActiveDate  = this.header.ActiveDate        || '';
    this.editExpiryDate  = this.header.ExpirayDate       || '';
    this.editPlanStatus  = this.header.PlanStatus        || '';
    this.editUpdateToVD  = this.header.UpdateToVD        || '';
    this.editTerms       = this.header.Termsandconditions || '';
  }

  updateHeaderField(column: string, value: any): void {
    if (!this.header) return;

    // ExpirayDate must be >= ActiveDate
    if (column === 'ExpirayDate' && value < this.editActiveDate) {
      this.notificationService.showError('Validation', 'Expiry date must be ≥ Active date');
      this.editExpiryDate = this.header.ExpirayDate || '';
      return;
    }

    this.isSaving = true;
    this.dataService
      .putMethod(`api/v1/redeem/header/${this.redeemCode}`, JSON.stringify({ column, value }))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.loadHeader();
        },
        error: (err: HttpErrorResponse) => {
          this.isSaving = false;
          this.notificationService.showError('Update Failed', err.error?.message || `Failed to update ${column}`);
          this.syncEditFields();
        },
      });
  }

  confirmAndUpdateHeader(column: string, newValue: string, oldValue: string): void {
    if (newValue === oldValue) return;
    this.confirmationService.confirmAction(
      `Change ${column}`,
      `Are you sure you want to change ${column} to "${newValue}"?`,
      'warning',
    ).then(confirmed => {
      if (confirmed) {
        this.updateHeaderField(column, newValue);
      } else {
        if (column === 'PlanStatus')  this.editPlanStatus = oldValue;
        if (column === 'UpdateToVD')  this.editUpdateToVD = oldValue;
      }
    });
  }

  // ─── Lines API ────────────────────────────────────────────────────────────

  loadLines(): void {
    this.isLinesLoading = true;
    this.linesConfig = { ...this.linesConfig, loading: true };

    this.dataService.getMethod(`api/v1/redeem/details/${this.redeemCode}`).subscribe({
      next: (res: any) => {
        this.lines = res.data || [];
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

  // ─── Add line modal ────────────────────────────────────────────────────────

  openAddLineModal(): void {
    this.newLine = {
      LineType:    'COUPON',
      LineCode:    '',
      DealCode:    '',
      LineValue:   '',
      ActiveDate:  this.header?.ActiveDate  || '',
      ExpiryDate:  this.header?.ExpirayDate || '',
      DisplayText: '',
    };
    this.showAddLineModal = true;
  }

  closeAddLineModal(): void {
    this.showAddLineModal = false;
  }

  submitAddLine(): void {
    if (!this.newLine.ActiveDate || !this.newLine.ExpiryDate) {
      this.notificationService.showError('Validation', 'Active and expiry dates are required');
      return;
    }
    if (this.newLine.ExpiryDate < this.newLine.ActiveDate) {
      this.notificationService.showError('Validation', 'Expiry date must be ≥ Active date');
      return;
    }
    if (this.newLine.LineType === 'COUPON' && !this.newLine.LineCode) {
      this.notificationService.showError('Validation', 'Line code is required for Coupon type');
      return;
    }

    this.isAddingLine = true;
    this.dataService
      .postMethod('api/v1/redeem/lines', JSON.stringify({
        Code:        this.redeemCode,
        ActiveDate:  this.newLine.ActiveDate,
        ExpiryDate:  this.newLine.ExpiryDate,
        LineType:    this.newLine.LineType,
        LineCode:    this.newLine.LineCode    || null,
        LineValue:   this.newLine.LineValue   || null,
        DealCode:    this.newLine.DealCode    || null,
        DisplayText: this.newLine.DisplayText || null,
      }))
      .subscribe({
        next: () => {
          this.isAddingLine = false;
          this.notificationService.showSuccess('Created', 'Redeem line created');
          this.closeAddLineModal();
          this.loadLines();
        },
        error: (err: HttpErrorResponse) => {
          this.isAddingLine = false;
          const msg = err.error?.status === 404
            ? "LineCode can't be null"
            : err.error?.message || 'Failed to create line';
          this.notificationService.showError('Create Failed', msg);
        },
      });
  }

  // ─── Edit line modal ───────────────────────────────────────────────────────

  openEditLine(line: RedeemLine): void {
    this.editLine = { ...line };
    this.showEditLineModal = true;
  }

  closeEditLineModal(): void {
    this.showEditLineModal = false;
  }

  submitEditLine(): void {
    if (!this.editLine.LineNo) return;
    if (this.editLine.ExpiryDate! < this.editLine.ActiveDate!) {
      this.notificationService.showError('Validation', 'Expiry date must be ≥ Active date');
      return;
    }

    this.isUpdatingLine = true;
    this.dataService
      .putMethod(
        `api/v1/redeem/lines/${this.redeemCode}/${this.editLine.LineNo}`,
        JSON.stringify({
          LineValue:   this.editLine.LineValue,
          ActiveDate:  this.editLine.ActiveDate,
          ExpiryDate:  this.editLine.ExpiryDate,
          DisplayText: this.editLine.DisplayText,
          LineType:    this.editLine.LineType,
          LineCode:    this.editLine.LineCode,
        }),
      )
      .subscribe({
        next: () => {
          this.isUpdatingLine = false;
          this.notificationService.showSuccess('Updated', 'Redeem line updated');
          this.closeEditLineModal();
          this.loadLines();
        },
        error: (err: HttpErrorResponse) => {
          this.isUpdatingLine = false;
          this.notificationService.showError('Update Failed', err.error?.message || 'Failed to update line');
        },
      });
  }

  // ─── Delete line ──────────────────────────────────────────────────────────

  deleteLine(line: RedeemLine): void {
    this.confirmationService.confirmDelete(`Line #${line.LineNo}`, 'redeem line').then(confirmed => {
      if (!confirmed) return;
      this.dataService
        .deleteMethod(`api/v1/redeem/lines/${this.redeemCode}/${line.LineNo}`)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Deleted', 'Redeem line deleted');
            this.loadLines();
          },
          error: (err: HttpErrorResponse) => {
            this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete line');
          },
        });
    });
  }

  // ─── T&C modal ────────────────────────────────────────────────────────────

  openTCModal(line: RedeemLine): void {
    this.tcLine = line;
    this.tcEditValue = line.Termsandconditions || '';
    this.showTCModal = true;
  }

  closeTCModal(): void {
    this.showTCModal = false;
    this.tcLine = null;
  }

  saveTAndC(): void {
    if (!this.tcLine) return;
    this.isSavingTC = true;
    this.dataService
      .putMethod(
        `api/v1/redeem/term/${this.redeemCode}/${this.tcLine.LineNo}`,
        JSON.stringify({ column: 'Termsandconditions', value: this.tcEditValue }),
      )
      .subscribe({
        next: () => {
          this.isSavingTC = false;
          this.notificationService.showSuccess('Saved', 'Terms & Conditions updated');
          this.closeTCModal();
          this.loadLines();
        },
        error: (err: HttpErrorResponse) => {
          this.isSavingTC = false;
          this.notificationService.showError('Save Failed', err.error?.message || 'Failed to save T&C');
        },
      });
  }

  // ─── Coupon lookup ────────────────────────────────────────────────────────

  openCouponLookup(): void {
    this.showCouponLookup = true;
    if (this.couponDropdownItems.length === 0) {
      this.isCouponLookupLoading = true;
      this.couponLookupConfig = { ...this.couponLookupConfig, loading: true };
      this.dataService.getMethod('api/v1/redeem/dropdown').subscribe({
        next: (res: any) => {
          this.couponDropdownItems = res.data?.coupong || [];
          this.isCouponLookupLoading = false;
          this.couponLookupConfig = { ...this.couponLookupConfig, loading: false };
        },
        error: () => {
          this.isCouponLookupLoading = false;
          this.couponLookupConfig = { ...this.couponLookupConfig, loading: false };
        },
      });
    }
  }

  selectCoupon(coupon: CouponDropdown): void {
    this.newLine.LineCode = coupon.Code;
    this.showCouponLookup = false;
  }

  selectCouponForEdit(coupon: CouponDropdown): void {
    this.editLine.LineCode = coupon.Code;
    this.showCouponLookup = false;
  }

  // ─── Deal lookup ──────────────────────────────────────────────────────────

  openDealLookup(): void {
    this.showDealLookup = true;
    if (this.dealDropdownItems.length === 0) {
      this.isDealLookupLoading = true;
      this.dealLookupConfig = { ...this.dealLookupConfig, loading: true };
      this.dataService.getMethod('api/v1/redeem/dropdown').subscribe({
        next: (res: any) => {
          this.dealDropdownItems = res.data?.deal || [];
          this.isDealLookupLoading = false;
          this.dealLookupConfig = { ...this.dealLookupConfig, loading: false };
        },
        error: () => {
          this.isDealLookupLoading = false;
          this.dealLookupConfig = { ...this.dealLookupConfig, loading: false };
        },
      });
    }
  }

  selectDeal(deal: DealDropdown): void {
    this.newLine.DealCode = deal.DealCode;
    this.newLine.LineCode = deal.CouponCode;
    this.showDealLookup = false;
  }

  selectDealForEdit(deal: DealDropdown): void {
    this.editLine.DealCode = deal.DealCode;
    this.editLine.LineCode = deal.CouponCode;
    this.showDealLookup = false;
  }

  // ─── Image modal ──────────────────────────────────────────────────────────

  openImageModal(line: RedeemLine): void {
    this.imageLine = line;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.imageLine = null;
  }

  uploadImage(event: Event): void {
    if (!this.imageLine) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'png') {
      this.notificationService.showError('Invalid File', 'Only .png files are allowed');
      return;
    }

    this.isUploadingImage = true;
    this.dataService.getBase64(file).then((b64: any) => {
      const base64Data = b64.replace(/^data:image\/[a-z]+;base64,/, '');
      this.dataService
        .postMethod(
          `api/v1/redeem/upload/${this.imageLine!.LineNo}/${this.redeemCode}`,
          JSON.stringify({ column: 'apphomebannerpath', filename: file.name, image: base64Data }),
        )
        .subscribe({
          next: (res: any) => {
            this.isUploadingImage = false;
            if (res.status === 200) {
              this.notificationService.showSuccess('Uploaded', 'Image uploaded successfully');
              this.closeImageModal();
              this.loadLines();
            } else {
              this.notificationService.showError('Upload Failed', 'Error uploading image');
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isUploadingImage = false;
            this.notificationService.showError('Upload Failed', err.message || 'Error uploading image');
          },
        });
    });
  }

  deleteImage(): void {
    if (!this.imageLine?.imagepath) return;
    this.confirmationService.confirmAction('Delete Image', 'Are you sure you want to delete this image?', 'danger')
      .then(confirmed => {
        if (!confirmed) return;
        const match = this.imageLine!.imagepath!.match(/\/([^/]+)$/);
        if (!match) return;
        const base64Name = btoa(match[1]);

        this.isDeletingImage = true;
        this.dataService.deleteMethod(`api/v1/redeem/image/${base64Name}`).subscribe({
          next: (res: any) => {
            this.isDeletingImage = false;
            if (res.status === 200) {
              this.notificationService.showSuccess('Deleted', 'Image deleted');
              this.closeImageModal();
              this.loadLines();
            } else {
              this.notificationService.showError('Delete Failed', 'Error deleting image');
            }
          },
          error: (err: HttpErrorResponse) => {
            this.isDeletingImage = false;
            this.notificationService.showError('Delete Failed', err.error?.message || 'Error deleting image');
          },
        });
      });
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/crafted/retail/redeemlist']);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'Enabled')  return 'success';
    if (status === 'Disabled') return 'danger';
    return 'warning';
  }

  getLineTypeClass(type: string): string {
    if (type === 'COUPON') return 'bg-blue-50 text-blue-700';
    if (type === 'DEAL')   return 'bg-purple-50 text-purple-700';
    return 'bg-gray-100 text-gray-600';
  }

  onPageChange(_page: number): void {}
}