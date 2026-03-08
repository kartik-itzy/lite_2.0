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

export interface LoyaltyHeader {
  Code: string;
  Description: string;
  BaseType: string;
  ActiveDate: string;
  ExpiryDate: string;
  PlanStatus: string;
  PointExpiryType: string;
  ExpiryValue: string | null;
  DefaultPoints: string;
  PointsIssued: string;
  PointsUsed: string;
  LineType: string;
  LoyaltyTender: string | null;
  DisplayText: string | null;
}

export interface LoyaltyLine {
  LineNo: number;
  LoyaltyCode: string;
  LineType: string;
  Typecode: string;
  Description: string;
  QtyorAmt: string;
  Points: string;
  PointsIncrements: string;
  BaseType: string;
  ActiveDate: string;
  ExpiryDate: string;
}

export interface LineFormData {
  LineType: string;
  Typecode: string;
  Description: string;
  QtyorAmt: string;
  Points: string;
  BaseType: string;
  ActiveDate: string;
  ExpiryDate: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-loyalty-plan-details',
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
  templateUrl: './loyalty-plan-details.component.html',
  styleUrl: './loyalty-plan-details.component.css',
})
export class LoyaltyPlanDetailsComponent implements OnInit {

  // ─── Route param ──────────────────────────────────────────────────────────
  loyaltyCode = '';

  // ─── Header ───────────────────────────────────────────────────────────────
  header: LoyaltyHeader | null = null;
  isHeaderLoading = false;
  isSavingHeader = false;
  hasHeaderChanges = false;
  editHeader: Partial<LoyaltyHeader> = {};

  // ─── Header dropdown options ──────────────────────────────────────────────
  planStatusOptions: SelectOption[] = [
    { value: 'Enabled',  label: 'Enabled'  },
    { value: 'Disabled', label: 'Disabled' },
  ];
  baseTypeOptions: SelectOption[] = [
    { value: 'Amount',   label: 'Amount'   },
    { value: 'Quantity', label: 'Quantity' },
  ];
  pointExpiryTypeOptions: SelectOption[] = [
    { value: 'ByDays',      label: 'By Days'      },
    { value: 'ByDate',      label: 'By Date'       },
    { value: 'ByPlan',      label: 'By Plan'       },
    { value: 'NeverExpires',label: 'Never Expires' },
  ];

  // ─── Lines table ──────────────────────────────────────────────────────────
  lines: LoyaltyLine[] = [];
  isLinesLoading = false;

  lineColumns: TableColumn[] = [
    { key: 'LineType',    label: 'Line Type',   sortable: true  },
    { key: 'Typecode',    label: 'Type Code',   sortable: true  },
    { key: 'Description', label: 'Description', sortable: true  },
    { key: 'BaseType',    label: 'Base Type',   sortable: true  },
    { key: 'QtyorAmt',    label: 'Qty / Amt',   sortable: true  },
    { key: 'Points',      label: 'Points',      sortable: true  },
    { key: 'ActiveDate',  label: 'Active Date', sortable: true  },
    { key: 'ExpiryDate',  label: 'Expiry Date', sortable: true  },
    { key: 'actions',    label: 'Actions',     sortable: false },
  ];

  linesConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No loyalty plan lines. Click "Add Line" to get started.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'LineType',    label: 'Line Type'   },
    { key: 'Typecode',    label: 'Type Code'   },
    { key: 'Description', label: 'Description' },
    { key: 'BaseType',    label: 'Base Type'   },
    { key: 'QtyorAmt',    label: 'Qty / Amt'   },
    { key: 'Points',      label: 'Points'      },
    { key: 'ActiveDate',  label: 'Active Date' },
    { key: 'ExpiryDate',  label: 'Expiry Date' },
  ];

  // ─── Line form modal ──────────────────────────────────────────────────────
  showLineModal = false;
  isEditMode = false;
  editingLine: LoyaltyLine | null = null;
  isSavingLine = false;

  lineForm: LineFormData = this.emptyLineForm();

  // Dropdown data for line form
  lineTypeOptions: SelectOption[] = [
    { value: 'Item',     label: 'Item'     },
    { value: 'Tender',   label: 'Tender'   },
    { value: 'Category', label: 'Category' },
  ];
  lineBaseTypeOptions: SelectOption[] = [
    { value: 'Amount',   label: 'Amount'   },
    { value: 'Quantity', label: 'Quantity' },
  ];
  typeCodeOptions: SelectOption[] = [];   // loaded based on LineType
  isTypeCodeLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loyaltyCode = this.route.snapshot.paramMap.get('loyaltyCode') as string;
    if (!this.loyaltyCode) {
      this.notificationService.showError('Invalid Route', 'No loyalty code provided');
      this.router.navigate(['/crafted/retail/loyalty']);
      return;
    }
    this.loadHeader();
    this.loadLines();
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  loadHeader(): void {
    this.isHeaderLoading = true;
    this.dataService.getMethod('api/v1/loyalty/all').subscribe({
      next: (res: any) => {
        const found = (res.data || []).find((p: any) => p.Code === this.loyaltyCode);
        this.header = found ?? null;
        this.editHeader = { ...found };
        this.hasHeaderChanges = false;
        this.isHeaderLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isHeaderLoading = false;
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load loyalty plan');
      },
    });
  }

  onHeaderFieldChange(): void {
    this.hasHeaderChanges = true;
  }

  saveHeaderField(field: keyof LoyaltyHeader, value: any): void {
    // Validate date ordering
    if (field === 'ExpiryDate' && this.editHeader.ActiveDate) {
      if (value < this.editHeader.ActiveDate) {
        this.notificationService.showError('Invalid Date', 'Expiry date must be on or after active date');
        return;
      }
    }

    this.dataService.putMethod(`api/v1/loyalty/header/${this.loyaltyCode}`, JSON.stringify({
      column: field,
      value: value,
    })).subscribe({
      next: () => {
        if (this.header) (this.header as any)[field] = value;
        this.notificationService.showSuccess('Updated', `${field} updated successfully`);
        // Reload to sync if expiry type changed (clears ExpiryValue)
        if (field === 'PointExpiryType') this.loadHeader();
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

  onPointExpiryTypeChange(value: string): void {
    if (value === this.header?.PointExpiryType) return;
    this.confirmationService.confirmAction(
      'Change Point Expiry Type',
      `Change point expiry type to <strong>${value}</strong>? This will clear the current expiry value.`,
      'warning'
    ).then(confirmed => {
      if (!confirmed) {
        this.editHeader.PointExpiryType = this.header?.PointExpiryType;
        return;
      }
      this.saveHeaderField('PointExpiryType', value);
    });
  }

  get showExpiryDays(): boolean { return this.header?.PointExpiryType === 'ByDays'; }
  get showExpiryDate(): boolean { return this.header?.PointExpiryType === 'ByDate'; }
  get showExpiryPlan(): boolean {
    return this.header?.PointExpiryType === 'ByPlan' || this.header?.PointExpiryType === 'NeverExpires';
  }

  // ─── Lines ────────────────────────────────────────────────────────────────

  loadLines(): void {
    this.linesConfig = { ...this.linesConfig, loading: true };
    this.dataService.getMethod(`api/v1/loyalty/details/${this.loyaltyCode}`).subscribe({
      next: (res: any) => {
        this.lines = res.data?.LoyaltyPlan || [];
        this.linesConfig = { ...this.linesConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.linesConfig = { ...this.linesConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load lines');
      },
    });
  }

  // ─── Line modal: open/close ───────────────────────────────────────────────

  openAddLine(): void {
    this.isEditMode = false;
    this.editingLine = null;
    this.lineForm = {
      ...this.emptyLineForm(),
      ActiveDate: this.header?.ActiveDate || '',
      ExpiryDate: this.header?.ExpiryDate || '',
    };
    this.typeCodeOptions = [];
    this.showLineModal = true;
  }

  openEditLine(line: LoyaltyLine): void {
    this.isEditMode = true;
    this.editingLine = line;
    this.lineForm = {
      LineType:    line.LineType,
      Typecode:    line.Typecode,
      Description: line.Description,
      QtyorAmt:    line.QtyorAmt,
      Points:      line.Points,
      BaseType:    line.BaseType,
      ActiveDate:  line.ActiveDate,
      ExpiryDate:  line.ExpiryDate,
    };
    this.loadTypeCodeOptions(line.LineType);
    this.showLineModal = true;
  }

  closeLineModal(): void {
    this.showLineModal = false;
    this.editingLine = null;
    this.lineForm = this.emptyLineForm();
  }

  // ─── Line type changed → load type codes ─────────────────────────────────

  onLineTypeChange(lineType: string): void {
    this.lineForm.Typecode = '';
    this.lineForm.Description = '';
    // Tender/Category only support Amount
    if (lineType === 'Tender' || lineType === 'Category') {
      this.lineBaseTypeOptions = [{ value: 'Amount', label: 'Amount' }];
      this.lineForm.BaseType = 'Amount';
    } else {
      this.lineBaseTypeOptions = [
        { value: 'Amount',   label: 'Amount'   },
        { value: 'Quantity', label: 'Quantity' },
      ];
    }
    this.loadTypeCodeOptions(lineType);
  }

  loadTypeCodeOptions(lineType: string): void {
    let endpoint = '';
    if (lineType === 'Tender')   endpoint = 'api/v1/loyalty/tenderName';
    if (lineType === 'Item')     endpoint = 'api/v1/loyalty/itemName';
    if (lineType === 'Category') endpoint = 'api/v1/member/itemcategory';
    if (!endpoint) return;

    this.isTypeCodeLoading = true;
    this.dataService.getMethod(endpoint).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        if (lineType === 'Tender') {
          this.typeCodeOptions = data.map((t: any) => ({ value: t.Name, label: t.Name }));
        } else if (lineType === 'Item') {
          this.typeCodeOptions = data.map((i: any) => ({ value: i.ItemCode, label: `${i.ItemCode} — ${i.Description || ''}` }));
        } else {
          this.typeCodeOptions = data.map((c: any) => ({ value: c.Code, label: `${c.Code} — ${c.Description || ''}` }));
        }
        this.isTypeCodeLoading = false;
      },
      error: () => { this.isTypeCodeLoading = false; },
    });
  }

  onTypeCodeChange(code: string): void {
    // Auto-fill description from selected type code option
    const opt = this.typeCodeOptions.find(o => o.value === code);
    if (opt) {
      const parts = opt.label.split(' — ');
      this.lineForm.Description = parts[1] || parts[0];
    }
  }

  // ─── Save line ────────────────────────────────────────────────────────────

  saveLine(): void {
    if (!this.lineForm.LineType || !this.lineForm.Typecode || !this.lineForm.QtyorAmt || !this.lineForm.Points) {
      this.notificationService.showError('Validation', 'Line Type, Type Code, Qty/Amt and Points are required');
      return;
    }
    if (this.lineForm.ExpiryDate && this.lineForm.ActiveDate && this.lineForm.ExpiryDate < this.lineForm.ActiveDate) {
      this.notificationService.showError('Invalid Date', 'Expiry date must be on or after active date');
      return;
    }

    this.isSavingLine = true;

    if (this.isEditMode && this.editingLine) {
      // Update — send changed column/value pairs sequentially using changedColumn pattern
      const updates = this.getChangedColumns(this.editingLine, this.lineForm);
      if (updates.length === 0) {
        this.isSavingLine = false;
        this.closeLineModal();
        return;
      }

      // Send the first changed column (API is column/value pattern)
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
          `api/v1/loyalty/lines/${this.loyaltyCode}/${this.editingLine!.LineNo}`,
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

    } else {
      // Create
      this.dataService.postMethod('api/v1/loyalty/lines', JSON.stringify({
        LoyaltyCode:  this.loyaltyCode,
        LineType:     this.lineForm.LineType,
        Typecode:     this.lineForm.Typecode,
        QtyorAmt:     this.lineForm.QtyorAmt,
        Points:       this.lineForm.Points,
        BaseType:     this.lineForm.BaseType,
        ActiveDate:   this.lineForm.ActiveDate,
        ExpiryDate:   this.lineForm.ExpiryDate,
        Description:  this.lineForm.Description,
      })).subscribe({
        next: () => {
          this.isSavingLine = false;
          this.notificationService.showSuccess('Created', 'Line added successfully');
          this.closeLineModal();
          this.loadLines();
        },
        error: (err: HttpErrorResponse) => {
          this.isSavingLine = false;
          this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create line');
        },
      });
    }
  }

  deleteLine(line: LoyaltyLine): void {
    this.confirmationService.confirmDelete(`Line ${line.LineNo}`, 'loyalty line').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/loyalty/lines/${this.loyaltyCode}/${line.LineNo}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', 'Line deleted successfully');
          this.loadLines();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete line');
        },
      });
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private emptyLineForm(): LineFormData {
    return { LineType: '', Typecode: '', Description: '', QtyorAmt: '', Points: '', BaseType: 'Amount', ActiveDate: '', ExpiryDate: '' };
  }

  private getChangedColumns(original: LoyaltyLine, updated: LineFormData): { column: string; value: any }[] {
    const fields: (keyof LineFormData)[] = ['LineType','Typecode','Description','QtyorAmt','Points','BaseType','ActiveDate','ExpiryDate'];
    return fields
      .filter(f => String((original as any)[f]) !== String(updated[f]))
      .map(f => ({ column: f, value: updated[f] }));
  }

  getPlanStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'Enabled')  return 'success';
    if (status === 'Disabled') return 'danger';
    return 'warning';
  }

  goBack(): void {
    this.router.navigate(['/crafted/retail/loyalty']);
  }

  onPageChange(_page: number): void {}
}