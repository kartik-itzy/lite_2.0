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
import { SwitchComponent } from '../../../components/ui/switch/switch.component';
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

export interface DealHeader {
  DealCode: string;
  tenant_id: string;
  Description: string;
  StartingDate: string;
  EndingDate: string;
  Active: string;           // 'Yes' | 'No'
  DealType: string;         // 'FIXEDITEM' | 'ITEMLIST'
  DealPrice: number | null;
  MaximumQty: number | null;
  CouponCode: string | null;
  VATProdPostGroup: string | null;
  DealUseCoupon: string;    // 'Yes' | 'No'
}

export interface DealLine {
  LineNo: number;
  DealCode: string;
  ItemCode: string;
  BaseUOM: string;
  Description: string;
  ItemMandatory: string;    // 'Yes' | 'No'
  Quantity: number;
  Price: number;
}

export interface ItemLookup {
  ItemCode: string;
  Description: string;
  BaseUOM: string;
  UnitPrice: number;
}

export interface CouponDropdown {
  Code: string;
  Description: string;
}

export interface VatGroupDropdown {
  Code: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-basic-deals-details',
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
    SwitchComponent,
    ExportExcelComponent,
    ModalComponent,
  ],
  templateUrl: './basic-deals-details.component.html',
  styleUrl: './basic-deals-details.component.css',
})
export class BasicDealsDetailsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // ─── Route param ──────────────────────────────────────────────────────────
  dealCode = '';

  // ─── Header ───────────────────────────────────────────────────────────────
  header: DealHeader | null = null;
  isHeaderLoading = false;
  isSaving = false;

  // Editable fields
  editDescription     = '';
  editStartingDate    = '';
  editEndingDate      = '';
  editCouponCode      = '';
  editMaximumQty: number | null = null;
  editDealPrice: number | null  = null;
  editActive          = '';
  editDealType        = '';
  editVatGroup        = '';
  editDealUseCoupon   = false;   // bound to app-switch

  // Dropdown sources
  couponOptions:   SelectOption[] = [];
  vatGroupOptions: SelectOption[] = [];

  readonly activeOptions: SelectOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No',  label: 'No'  },
  ];

  readonly dealTypeOptions: SelectOption[] = [
    { value: 'FIXEDITEM', label: 'Fixed Item' },
    { value: 'ITEMLIST',  label: 'Item List'  },
  ];

  readonly mandatoryOptions: SelectOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No',  label: 'No'  },
  ];

  // ─── Deal lines table ─────────────────────────────────────────────────────
  lines: DealLine[] = [];
  isLinesLoading = false;

  linesColumns: TableColumn[] = [
    { key: 'ItemCode',      label: 'Item Code',   sortable: true  },
    { key: 'Description',   label: 'Description', sortable: true  },
    { key: 'BaseUOM',       label: 'Base UOM',    sortable: true  },
    { key: 'ItemMandatory', label: 'Mandatory',   sortable: true  },
    { key: 'Quantity',      label: 'Quantity',    sortable: true  },
    { key: 'Price',         label: 'Price',       sortable: true  },
    { key: 'actions',       label: 'Actions',     sortable: false },
  ];

  linesConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No deal lines found.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'ItemCode',      label: 'Item Code'   },
    { key: 'Description',   label: 'Description' },
    { key: 'BaseUOM',       label: 'Base UOM'    },
    { key: 'ItemMandatory', label: 'Mandatory'   },
    { key: 'Quantity',      label: 'Quantity'    },
    { key: 'Price',         label: 'Price'       },
  ];

  // ─── Add / Edit line modal ────────────────────────────────────────────────
  showLineModal  = false;
  isLineEditing  = false;
  isSavingLine   = false;
  lineModalTitle = 'Add Deal Line';

  lineForm: Partial<DealLine> = {};

  readonly lineModalConfig: ModalConfig = {
    title: 'Add Deal Line',
    size: 'md',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  // ─── Item lookup modal ────────────────────────────────────────────────────
  showItemLookup       = false;
  itemLookupItems: ItemLookup[] = [];
  isItemLookupLoading  = false;

  readonly itemLookupModalConfig: ModalConfig = {
    title: 'Item Lookup',
    size: 'xl',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  itemLookupColumns: TableColumn[] = [
    { key: 'ItemCode',    label: 'Item Code',   sortable: true },
    { key: 'Description', label: 'Description', sortable: true },
    { key: 'BaseUOM',     label: 'Base UOM',    sortable: true },
    { key: 'UnitPrice',   label: 'Unit Price',  sortable: true },
    { key: 'select',      label: '',            sortable: false},
  ];

  itemLookupConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No items found.',
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
      this.dealCode = params['dealCode'] || '';
      if (this.dealCode) {
        this.loadDropdowns();
        this.loadHeader();
        this.loadLines();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Dropdowns ────────────────────────────────────────────────────────────

  loadDropdowns(): void {
    this.dataService.getMethod('api/v1/deal/dropdown').subscribe({
      next: (res: any) => {
        const coupon:   CouponDropdown[]   = res.data?.coupon   || [];
        const vatgroup: VatGroupDropdown[] = res.data?.vatgroup || [];

        this.couponOptions = [
          { value: '', label: '— None —' },
          ...coupon.map(c => ({ value: c.Code, label: `${c.Code} — ${c.Description}` })),
        ];
        this.vatGroupOptions = vatgroup.map(v => ({ value: v.Code, label: v.Code }));
      },
      error: () => {},
    });
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  loadHeader(): void {
    this.isHeaderLoading = true;
    this.dataService.getMethod('api/v1/deal/all').subscribe({
      next: (res: any) => {
        const list: DealHeader[] = res.data || res || [];
        this.header = list.find(d => d.DealCode === this.dealCode) || null;
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
    this.editDescription   = this.header.Description      || '';
    this.editStartingDate  = this.header.StartingDate     || '';
    this.editEndingDate    = this.header.EndingDate       || '';
    this.editCouponCode    = this.header.CouponCode       || '';
    this.editMaximumQty    = this.header.MaximumQty       ?? null;
    this.editDealPrice     = this.header.DealPrice        ?? null;
    this.editActive        = this.header.Active           || 'Yes';
    this.editDealType      = this.header.DealType         || '';
    this.editVatGroup      = this.header.VATProdPostGroup || '';
    this.editDealUseCoupon = this.header.DealUseCoupon === 'Yes';
  }

  /** Generic PATCH for plain text/number fields (blur) */
  updateHeaderField(column: string, value: any): void {
    if (!this.header) return;

    if (column === 'EndingDate' && value < this.editStartingDate) {
      this.notificationService.showError('Validation', 'Ending date must be ≥ Starting date');
      this.editEndingDate = this.header.EndingDate || '';
      return;
    }

    this.isSaving = true;
    this.dataService
      .putMethod(`api/v1/deal/header/${this.dealCode}`, JSON.stringify({ column, value }))
      .subscribe({
        next: () => { this.isSaving = false; this.loadHeader(); },
        error: (err: HttpErrorResponse) => {
          this.isSaving = false;
          this.notificationService.showError('Update Failed', err.error?.message || `Failed to update ${column}`);
          this.syncEditFields();
        },
      });
  }

  /** DealUseCoupon switch toggle → save 'Yes'/'No' */
  onDealUseCouponChange(checked: boolean): void {
    this.editDealUseCoupon = checked;
    const value = checked ? 'Yes' : 'No';
    // If switching off, also clear CouponCode
    if (!checked) {
      this.editCouponCode = '';
      this.updateHeaderFieldSilent('CouponCode', null);
    }
    this.updateHeaderField('DealUseCoupon', value);
  }

  private updateHeaderFieldSilent(column: string, value: any): void {
    this.dataService
      .putMethod(`api/v1/deal/header/${this.dealCode}`, JSON.stringify({ column, value }))
      .subscribe({ next: () => {}, error: () => {} });
  }

  /** Active / DealType / CouponCode selects — confirm for Active only */
  onSelectChanged(column: string, newValue: string): void {
    if (!this.header) return;

    if (column === 'Active') {
      const oldValue = this.header.Active;
      if (newValue === oldValue) return;
      this.confirmationService.confirmAction(
        'Change Active Status',
        `Are you sure you want to change Active to "${newValue}"?`,
        'warning',
      ).then(confirmed => {
        if (confirmed) {
          this.updateHeaderField(column, newValue);
        } else {
          this.editActive = oldValue;
        }
      });
    } else {
      this.updateHeaderField(column, newValue || null);
    }
  }

  // ─── Lines ────────────────────────────────────────────────────────────────

  loadLines(): void {
    this.isLinesLoading = true;
    this.linesConfig = { ...this.linesConfig, loading: true };

    this.dataService.getMethod(`api/v1/deal/details/${this.dealCode}`).subscribe({
      next: (res: any) => {
        this.lines = res.data?.deal || [];
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

  // ─── Add / Edit line modal ────────────────────────────────────────────────

  openAddLineModal(): void {
    this.isLineEditing  = false;
    this.lineModalTitle = 'Add Deal Line';
    this.lineForm = {
      ItemCode:      '',
      BaseUOM:       '',
      Description:   '',
      ItemMandatory: 'No',
      Quantity:      1,
      Price:         0,
    };
    this.showLineModal = true;
  }

  openEditLineModal(line: DealLine): void {
    this.isLineEditing  = true;
    this.lineModalTitle = 'Edit Deal Line';
    this.lineForm = { ...line };
    this.showLineModal = true;
  }

  closeLineModal(): void {
    this.showLineModal = false;
  }

  submitLine(): void {
    if (!this.lineForm.ItemCode?.trim()) {
      this.notificationService.showError('Validation', 'Item code is required');
      return;
    }

    this.isSavingLine = true;

    if (this.isLineEditing && this.lineForm.LineNo) {
      // UPDATE
      this.dataService
        .putMethod(
          `api/v1/deal/line/${this.dealCode}/${this.lineForm.LineNo}`,
          JSON.stringify({
            ItemCode:      this.lineForm.ItemCode,
            BaseUOM:       this.lineForm.BaseUOM,
            Description:   this.lineForm.Description,
            Quantity:      this.lineForm.Quantity,
            Price:         this.lineForm.Price,
            ItemMandatory: this.lineForm.ItemMandatory,
          }),
        )
        .subscribe({
          next: () => {
            this.isSavingLine = false;
            this.notificationService.showSuccess('Updated', 'Deal line updated');
            this.closeLineModal();
            this.loadLines();
          },
          error: (err: HttpErrorResponse) => {
            this.isSavingLine = false;
            this.notificationService.showError('Update Failed', err.error?.message || 'Failed to update line');
          },
        });
    } else {
      // INSERT
      this.dataService
        .postMethod('api/v1/deal/lines', JSON.stringify({
          DealCode:      this.dealCode,
          ItemCode:      this.lineForm.ItemCode,
          BaseUOM:       this.lineForm.BaseUOM,
          Description:   this.lineForm.Description,
          Quantity:      this.lineForm.Quantity,
          Price:         this.lineForm.Price,
          ItemMandatory: this.lineForm.ItemMandatory,
        }))
        .subscribe({
          next: () => {
            this.isSavingLine = false;
            this.notificationService.showSuccess('Created', 'Deal line created');
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

  // ─── Delete line ──────────────────────────────────────────────────────────

  deleteLine(line: DealLine): void {
    this.confirmationService.confirmDelete(`Line #${line.LineNo}`, 'deal line').then(confirmed => {
      if (!confirmed) return;
      this.dataService
        .deleteMethod(`api/v1/deal/lines/${this.dealCode}/${line.LineNo}`)
        .subscribe({
          next: () => {
            this.notificationService.showSuccess('Deleted', 'Deal line deleted');
            this.loadLines();
          },
          error: (err: HttpErrorResponse) => {
            this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete line');
          },
        });
    });
  }

  // ─── Item lookup ──────────────────────────────────────────────────────────

  openItemLookup(): void {
    this.showItemLookup = true;
    if (this.itemLookupItems.length === 0) {
      this.isItemLookupLoading = true;
      this.itemLookupConfig = { ...this.itemLookupConfig, loading: true };
      this.dataService.getMethod('api/v1/deal/item').subscribe({
        next: (res: any) => {
          this.itemLookupItems = res.data || res || [];
          this.isItemLookupLoading = false;
          this.itemLookupConfig = { ...this.itemLookupConfig, loading: false };
        },
        error: () => {
          this.isItemLookupLoading = false;
          this.itemLookupConfig = { ...this.itemLookupConfig, loading: false };
        },
      });
    }
  }

  selectItem(item: ItemLookup): void {
    this.lineForm.ItemCode    = item.ItemCode;
    this.lineForm.BaseUOM     = item.BaseUOM;
    this.lineForm.Description = item.Description;
    this.lineForm.Price       = item.UnitPrice;
    this.lineForm.Quantity    = this.lineForm.Quantity || 1;
    this.lineForm.ItemMandatory = this.lineForm.ItemMandatory || 'No';
    this.showItemLookup = false;
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  goBack(): void {
    this.router.navigate(['/crafted/retail/basicdeals']);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getActiveVariant(active: string): 'success' | 'danger' | 'warning' {
    if (active === 'Yes') return 'success';
    if (active === 'No')  return 'danger';
    return 'warning';
  }

  onPageChange(_page: number): void {}
}