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

export interface TopupHeader {
  Code: string;
  tenant_id: string;
  Description: string;
  ActiveDate: string;
  ExpirayDate: string;
  PlanStatus: string;
  fortier: string;
  DisplayText: string | null;
}

export interface TopupLine {
  LineNo: number;
  Code: string;
  tenant_id: string;
  Description: string | null;
  Minimun_Amount: number | string;
  Maximun_Amount: number | string;
  Limit_Per_Member: number | string;
  CouponCode: string;
  CouponExpiryDay: string;
  ActiveDate: string;
  ExpiryDate: string;
  imagepath: string | null;
  imagepathData: string | null;
  Termsandconditions: string | null;
  DisplayText: string | null;
  Activate: string;
}

export interface LineFormData {
  Minimun_Amount: string;
  Maximun_Amount: string;
  Limit_Per_Member: string;
  CouponCode: string;
  CouponExpiryDay: string;
  ActiveDate: string;
  ExpiryDate: string;
  Activate: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-topup-promotion-details',
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
  templateUrl: './topup-promotion-details.component.html',
  styleUrl: './topup-promotion-details.component.css',
})
export class TopupPromotionDetailsComponent implements OnInit {

  // ─── Route param ──────────────────────────────────────────────────────────
  topupCode = '';

  // ─── Header ───────────────────────────────────────────────────────────────
  header: TopupHeader | null = null;
  isHeaderLoading = false;
  editHeader: Partial<TopupHeader> = {};

  planStatusOptions: SelectOption[] = [
    { value: 'Enabled',  label: 'Enabled'  },
    { value: 'Disabled', label: 'Disabled' },
  ];

  // ─── Lines ────────────────────────────────────────────────────────────────
  lines: TopupLine[] = [];

  lineColumns: TableColumn[] = [
    { key: 'Minimun_Amount',   label: 'Min Amount',       sortable: true  },
    { key: 'Maximun_Amount',   label: 'Max Amount',       sortable: true  },
    { key: 'Limit_Per_Member', label: 'Limit / Member',   sortable: true  },
    { key: 'CouponCode',       label: 'Coupon Code',      sortable: true  },
    { key: 'CouponExpiryDay',  label: 'Coupon Expiry',    sortable: true  },
    { key: 'ActiveDate',       label: 'Active Date',      sortable: true  },
    { key: 'ExpiryDate',       label: 'Expiry Date',      sortable: true  },
    { key: 'Activate',         label: 'Activate',         sortable: true  },
    { key: 'imagepath',        label: 'Image',            sortable: false },
    { key: 'actions',          label: 'Actions',          sortable: false },
  ];

  linesConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: false,
    loading: false,
    emptyMessage: 'No lines found. Click "Add Line" to get started.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'Minimun_Amount',   label: 'Min Amount'     },
    { key: 'Maximun_Amount',   label: 'Max Amount'     },
    { key: 'Limit_Per_Member', label: 'Limit / Member' },
    { key: 'CouponCode',       label: 'Coupon Code'    },
    { key: 'CouponExpiryDay',  label: 'Coupon Expiry'  },
    { key: 'ActiveDate',       label: 'Active Date'    },
    { key: 'ExpiryDate',       label: 'Expiry Date'    },
    { key: 'Activate',         label: 'Activate'       },
  ];

  // ─── Line form modal ──────────────────────────────────────────────────────
  showLineModal = false;
  isEditMode = false;
  editingLine: TopupLine | null = null;
  isSavingLine = false;

  lineForm: LineFormData = this.emptyLineForm();

  activateOptions: SelectOption[] = [
    { value: 'OPEN',  label: 'OPEN'  },
    { value: 'CLOSE', label: 'CLOSE' },
  ];

  couponExpiryOptions: SelectOption[] = [
    { value: 'FROM COUPON',  label: 'From Coupon'  },
    { value: 'NEVER EXPIRE', label: 'Never Expire' },
    { value: 'IN DAYS',      label: 'In Days'      },
  ];

  // "NO LIMIT or number" fields — radio-style
  maxAmountMode: 'NO LIMIT' | 'NUMBER' = 'NO LIMIT';
  limitPerMemberMode: 'NO LIMIT' | 'NUMBER' = 'NO LIMIT';
  couponExpiryDays = '';   // only used when CouponExpiryDay === 'IN DAYS'

  // ─── Image modal ──────────────────────────────────────────────────────────
  showImageModal = false;
  imageModalLine: TopupLine | null = null;
  isUploadingImage = false;
  isDeletingImage = false;

  // ─── T&C modal ────────────────────────────────────────────────────────────
  showTCModal = false;
  tcModalLine: TopupLine | null = null;
  tcText = '';
  isSavingTC = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.topupCode = this.route.snapshot.paramMap.get('topupCode') as string;
    if (!this.topupCode) {
      this.notificationService.showError('Invalid Route', 'No top-up code provided');
      this.router.navigate(['/crafted/retail/topup_promotion']);
      return;
    }
    this.loadHeader();
    this.loadLines();
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  loadHeader(): void {
    this.isHeaderLoading = true;
    this.dataService.getMethod('api/v1/redeem/topup/all').subscribe({
      next: (res: any) => {
        const found = (res.data || []).find((t: any) => t.Code === this.topupCode);
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

  saveHeaderField(field: keyof TopupHeader, value: any): void {
    if (field === 'ExpirayDate' && this.editHeader.ActiveDate) {
      if (value < this.editHeader.ActiveDate) {
        this.notificationService.showError('Invalid Date', 'Expiry date must be on or after active date');
        return;
      }
    }
    this.dataService.putMethod(`api/v1/redeem/topup/header/${this.topupCode}`, JSON.stringify({
      column: field,
      value: value,
    })).subscribe({
      next: () => {
        if (this.header) (this.header as any)[field] = value;
        this.notificationService.showSuccess('Updated', `${field} updated`);
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError('Update Failed', err.error?.message || `Failed to update ${field}`);
      },
    });
  }

  onPlanStatusChange(value: string): void {
    if (value === this.header?.PlanStatus) return;
    this.confirmationService.confirmAction(
      'Change Status',
      `Change plan status to <strong>${value}</strong>?`,
      'warning'
    ).then(confirmed => {
      if (!confirmed) {
        this.editHeader.PlanStatus = this.header?.PlanStatus;
        return;
      }
      this.saveHeaderField('PlanStatus', value);
    });
  }

  // ─── Lines ────────────────────────────────────────────────────────────────

  loadLines(): void {
    this.linesConfig = { ...this.linesConfig, loading: true };
    this.dataService.getMethod(`api/v1/redeem/topup/details/${this.topupCode}`).subscribe({
      next: (res: any) => {
        this.lines = res.data || [];
        this.linesConfig = { ...this.linesConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.linesConfig = { ...this.linesConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load lines');
      },
    });
  }

  // ─── Add line ─────────────────────────────────────────────────────────────

  addLine(): void {
    this.confirmationService.confirmAction('Add Line', 'Create a new top-up promotion line?', 'primary').then(confirmed => {
      if (!confirmed) return;
      this.dataService.postMethod('api/v1/redeem/topup/lines', JSON.stringify({
        Code: this.topupCode,
      })).subscribe({
        next: () => {
          this.notificationService.showSuccess('Created', 'Line created');
          this.loadLines();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create line');
        },
      });
    });
  }

  // ─── Edit line modal ──────────────────────────────────────────────────────

  openEditLine(line: TopupLine): void {
    this.isEditMode = true;
    this.editingLine = line;

    // Detect "NO LIMIT" vs numeric modes
    this.maxAmountMode       = (line.Maximun_Amount   === 'NO LIMIT') ? 'NO LIMIT' : 'NUMBER';
    this.limitPerMemberMode  = (line.Limit_Per_Member === 'NO LIMIT') ? 'NO LIMIT' : 'NUMBER';

    // CouponExpiryDay: if not FROM COUPON / NEVER EXPIRE, it's an IN DAYS number
    const knownExpiry = ['FROM COUPON', 'NEVER EXPIRE', 'IN DAYS'];
    const expiry = knownExpiry.includes(line.CouponExpiryDay) ? line.CouponExpiryDay : 'IN DAYS';
    this.couponExpiryDays = knownExpiry.includes(line.CouponExpiryDay) ? '' : line.CouponExpiryDay;

    this.lineForm = {
      Minimun_Amount:   String(line.Minimun_Amount),
      Maximun_Amount:   this.maxAmountMode === 'NO LIMIT' ? '' : String(line.Maximun_Amount),
      Limit_Per_Member: this.limitPerMemberMode === 'NO LIMIT' ? '' : String(line.Limit_Per_Member),
      CouponCode:       line.CouponCode || '',
      CouponExpiryDay:  expiry,
      ActiveDate:       line.ActiveDate || '',
      ExpiryDate:       line.ExpiryDate || '',
      Activate:         line.Activate || 'CLOSE',
    };
    this.showLineModal = true;
  }

  closeLineModal(): void {
    this.showLineModal = false;
    this.editingLine = null;
    this.lineForm = this.emptyLineForm();
    this.maxAmountMode = 'NO LIMIT';
    this.limitPerMemberMode = 'NO LIMIT';
    this.couponExpiryDays = '';
  }

  saveLine(): void {
    if (!this.editingLine) return;

    // Validate
    const minAmt = parseFloat(this.lineForm.Minimun_Amount);
    if (isNaN(minAmt) || minAmt <= 0) {
      this.notificationService.showError('Validation', 'Minimum amount must be greater than zero');
      return;
    }
    if (this.maxAmountMode === 'NUMBER') {
      const maxAmt = parseFloat(this.lineForm.Maximun_Amount);
      if (isNaN(maxAmt) || maxAmt < minAmt) {
        this.notificationService.showError('Validation', 'Maximum amount must be greater than or equal to minimum amount');
        return;
      }
    }
    if (this.lineForm.ExpiryDate && this.lineForm.ActiveDate && this.lineForm.ExpiryDate < this.lineForm.ActiveDate) {
      this.notificationService.showError('Invalid Date', 'Expiry date must be on or after active date');
      return;
    }

    // Build final values
    const finalMax   = this.maxAmountMode === 'NO LIMIT' ? 'NO LIMIT' : this.lineForm.Maximun_Amount;
    const finalLimit = this.limitPerMemberMode === 'NO LIMIT' ? 'NO LIMIT' : this.lineForm.Limit_Per_Member;
    const finalExpiry = this.lineForm.CouponExpiryDay === 'IN DAYS' ? this.couponExpiryDays : this.lineForm.CouponExpiryDay;

    const original = this.editingLine;
    const updates: { column: string; value: any }[] = [];

    if (String(original.Minimun_Amount)   !== this.lineForm.Minimun_Amount)  updates.push({ column: 'Minimun_Amount',   value: this.lineForm.Minimun_Amount });
    if (String(original.Maximun_Amount)   !== finalMax)                       updates.push({ column: 'Maximun_Amount',   value: finalMax });
    if (String(original.Limit_Per_Member) !== finalLimit)                     updates.push({ column: 'Limit_Per_Member', value: finalLimit });
    if (original.CouponCode               !== this.lineForm.CouponCode)       updates.push({ column: 'CouponCode',       value: this.lineForm.CouponCode });
    if (original.CouponExpiryDay          !== finalExpiry)                    updates.push({ column: 'CouponExpiryDay',  value: finalExpiry });
    if (original.ActiveDate               !== this.lineForm.ActiveDate)       updates.push({ column: 'ActiveDate',       value: this.lineForm.ActiveDate });
    if (original.ExpiryDate               !== this.lineForm.ExpiryDate)       updates.push({ column: 'ExpiryDate',       value: this.lineForm.ExpiryDate });
    if (original.Activate                 !== this.lineForm.Activate)         updates.push({ column: 'Activate',         value: this.lineForm.Activate });

    if (updates.length === 0) {
      this.closeLineModal();
      return;
    }

    this.isSavingLine = true;
    const sendNext = (idx: number) => {
      if (idx >= updates.length) {
        this.isSavingLine = false;
        this.notificationService.showSuccess('Updated', 'Line updated successfully');
        this.closeLineModal();
        this.loadLines();
        return;
      }
      const { column, value } = updates[idx];
      this.dataService.putMethod(
        `api/v1/redeem/topup/lines/${this.topupCode}/${original.LineNo}`,
        JSON.stringify({ column, value })
      ).subscribe({
        next: () => sendNext(idx + 1),
        error: (err: HttpErrorResponse) => {
          this.isSavingLine = false;
          this.notificationService.showError('Update Failed', err.error?.message || 'Failed to update line');
        },
      });
    };
    sendNext(0);
  }

  deleteLine(line: TopupLine): void {
    this.confirmationService.confirmDelete(`Line ${line.LineNo}`, 'top-up line').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/redeem/topup/lines/${this.topupCode}/${line.LineNo}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', 'Line deleted');
          this.loadLines();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete line');
        },
      });
    });
  }

  // ─── Image modal ──────────────────────────────────────────────────────────

  openImageModal(line: TopupLine): void {
    this.imageModalLine = line;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.imageModalLine = null;
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.imageModalLine) return;

    const file = input.files[0];
    const ext = file.type.split('/').pop()?.toLowerCase();
    if (!['jpeg', 'jpg', 'png'].includes(ext || '')) {
      this.notificationService.showError('Invalid File', 'Please select a JPEG or PNG image');
      return;
    }
    if (this.imageModalLine.imagepath) {
      this.notificationService.showError('Image Exists', 'Please delete the existing image first');
      return;
    }

    this.isUploadingImage = true;
    this.dataService.getBase64(file).then((base64: any) => {
      const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
      this.dataService.postMethod(
        `api/v1/redeem/topup/upload/${this.imageModalLine!.LineNo}/${this.topupCode}`,
        JSON.stringify({ filename: file.name, image: base64Data })
      ).subscribe({
        next: () => {
          this.isUploadingImage = false;
          this.notificationService.showSuccess('Uploaded', 'Image uploaded successfully');
          this.closeImageModal();
          this.loadLines();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingImage = false;
          this.notificationService.showError('Upload Failed', err.error?.message || 'Failed to upload image');
        },
      });
    });
  }

  deleteImage(): void {
    if (!this.imageModalLine?.imagepath) return;
    const match = this.imageModalLine.imagepath.match(/\/([^/]+)$/);
    if (!match) return;

    const base64Name = btoa(match[1]);
    this.isDeletingImage = true;
    this.dataService.deleteMethod(`api/v1/redeem/topup/image/${base64Name}`).subscribe({
      next: () => {
        this.isDeletingImage = false;
        this.notificationService.showSuccess('Deleted', 'Image deleted');
        this.closeImageModal();
        this.loadLines();
      },
      error: (err: HttpErrorResponse) => {
        this.isDeletingImage = false;
        this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete image');
      },
    });
  }

  // ─── T&C modal ────────────────────────────────────────────────────────────

  openTCModal(line: TopupLine): void {
    this.tcModalLine = line;
    this.tcText = line.Termsandconditions || '';
    this.showTCModal = true;
  }

  closeTCModal(): void {
    this.showTCModal = false;
    this.tcModalLine = null;
    this.tcText = '';
  }

  saveTC(): void {
    if (!this.tcModalLine || !this.tcText.trim()) return;
    this.isSavingTC = true;
    this.dataService.putMethod(
      `api/v1/redeem/topup/term/${this.topupCode}/${this.tcModalLine.LineNo}`,
      JSON.stringify({ column: 'Termsandconditions', value: this.tcText })
    ).subscribe({
      next: () => {
        this.isSavingTC = false;
        this.notificationService.showSuccess('Saved', 'Terms & conditions saved');
        this.closeTCModal();
        this.loadLines();
      },
      error: (err: HttpErrorResponse) => {
        this.isSavingTC = false;
        this.notificationService.showError('Save Failed', err.error?.message || 'Failed to save T&C');
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private emptyLineForm(): LineFormData {
    return {
      Minimun_Amount:   '1',
      Maximun_Amount:   '',
      Limit_Per_Member: '',
      CouponCode:       '',
      CouponExpiryDay:  'NEVER EXPIRE',
      ActiveDate:       '',
      ExpiryDate:       '',
      Activate:         'CLOSE',
    };
  }

  getPlanStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'Enabled')  return 'success';
    if (status === 'Disabled') return 'danger';
    return 'warning';
  }

  getActivateBadgeVariant(activate: string): 'success' | 'danger' {
    return activate === 'OPEN' ? 'success' : 'danger';
  }

  goBack(): void {
    this.router.navigate(['/crafted/retail/topup_promotion']);
  }

  onPageChange(_page: number): void {}
}