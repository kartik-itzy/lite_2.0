import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { TabComponent, TabItem } from '../../../components/ui/tab/tab.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { ModalComponent, ModalConfig } from '../../../components/ui/modal/modal.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

export interface MemberLevel {
  LineNo?: number;
  tenant_id?: string;
  memberlevelCode?: number;
  Description: string;
  MinPoints: number;
  MaxPoints: number;
  NextLevelLabel: string;
  CardType: string;
  LoyaltyCode: string;
  RedeemCode: string;
  TopupCode: string;
  Upgrade?: string;
  LastModifiedOn?: string;
}

@Component({
  selector: 'app-member-level',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    TabComponent,
    TableComponent,
    TableCellDirective,
    ModalComponent,
    InputComponent,
    SelectComponent,
    ExportExcelComponent,
  ],
  templateUrl: './member-level.component.html',
  styleUrl: './member-level.component.css',
})
export class MemberLevelComponent implements OnInit {
  private fb = inject(FormBuilder);

  currentView: string = 'upgrade';
  isLoading = false;
  isModalOpen = false;
  isEditMode = false;
  isSaving = false;
  originalFormValue: any;
  selectedRow: MemberLevel | null = null;

  viewTabs: TabItem[] = [
    { label: 'Upgrade', value: 'upgrade' },
    { label: 'Non-Upgrade', value: 'nonUpgrade' },
  ];

  // Table data
  upgradeData: MemberLevel[] = [];
  nonUpgradeData: MemberLevel[] = [];

  // Raw dropdown sources
  cardTypeOptions: string[] = [];
  loyaltyPlanOptions: { Code: string }[] = [];
  redeemPlanOptions: string[] = [];
  topupOptions: { Code: string; Description: string }[] = [];

  // Mapped SelectOption arrays for app-select
  get cardTypeSelectOptions(): SelectOption[] {
    return this.cardTypeOptions.map(v => ({ value: v, label: v }));
  }
  get loyaltySelectOptions(): SelectOption[] {
    return this.loyaltyPlanOptions.map(o => ({ value: o.Code, label: o.Code }));
  }
  get redeemSelectOptions(): SelectOption[] {
    return this.redeemPlanOptions.map(v => ({ value: v, label: v }));
  }
  get topupSelectOptions(): SelectOption[] {
    return this.topupOptions.map(o => ({ value: o.Code, label: `${o.Code} – ${o.Description}` }));
  }

  // Table columns
  tableColumns: TableColumn[] = [
    { key: 'memberlevelCode', label: 'Member Level Code' },
    { key: 'Description', label: 'Description' },
    { key: 'MinPoints', label: 'Min Points' },
    { key: 'MaxPoints', label: 'Max Points' },
    { key: 'CardType', label: 'Card Type' },
    { key: 'NextLevelLabel', label: 'Next Level Label' },
    { key: 'LoyaltyCode', label: 'Loyalty Code' },
    { key: 'RedeemCode', label: 'Redeem Code' },
    { key: 'TopupCode', label: 'Top-up Code' },
    { key: 'actions', label: 'Actions', align: 'center' },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No member levels found',
  };

  exportColumns: ExportColumn[] = [
    { key: 'memberlevelCode', label: 'Member Level Code' },
    { key: 'Description', label: 'Description' },
    { key: 'MinPoints', label: 'Min Points' },
    { key: 'MaxPoints', label: 'Max Points' },
    { key: 'CardType', label: 'Card Type' },
    { key: 'NextLevelLabel', label: 'Next Level Label' },
    { key: 'LoyaltyCode', label: 'Loyalty Code' },
    { key: 'RedeemCode', label: 'Redeem Code' },
    { key: 'TopupCode', label: 'Top-up Code' },
    { key: 'LastModifiedOn', label: 'Last Modified On' },
  ];

  modalConfig: ModalConfig = {
    title: 'Create New Level',
    size: 'xl',
    showCloseButton: true,
    closeOnBackdropClick: true,
  };

  form!: FormGroup;

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      Description: [''],
      MinPoints: [''],
      MaxPoints: [''],
      NextLevelLabel: [''],
      CardType: [''],
      LoyaltyCode: [''],
      RedeemCode: [''],
      TopupCode: [''],
    });

    this.loadDropdowns();
    this.loadTableData();
  }

  // ─── Data loading ────────────────────────────────────────────────────────────

  loadDropdowns(): void {
    forkJoin({
      cardTypes: this.dataService.getMethod('api/v1/loyalty/memberlevels/cardtype/Yes'),
      dropdowns: this.dataService.getMethod('api/v1/member/memberdefaults/dropdrowlist'),
      redeemCodes: this.dataService.getMethod('api/v1/loyalty/memberlevels/redeem'),
      topupCodes: this.dataService.getMethod('api/v1/loyalty/memberlevels/topup'),
    }).subscribe({
      next: (results: any) => {
        this.cardTypeOptions = results.cardTypes.data || [];
        this.loyaltyPlanOptions = results.dropdowns.data?.loyaltyplan || [];
        this.redeemPlanOptions = results.redeemCodes.data || [];
        this.topupOptions = results.topupCodes.data || [];
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showError(
          'Error',
          error.error?.message || 'Failed to load dropdown options'
        );
      },
    });
  }

  loadTableData(): void {
    this.isLoading = true;
    forkJoin({
      upgrade: this.dataService.getMethod('api/v1/loyalty/memberlevels/details'),
      nonUpgrade: this.dataService.getMethod('api/v1/loyalty/memberlevels/details/nonupgrade'),
    }).subscribe({
      next: (results: any) => {
        this.upgradeData = results.upgrade.data || [];
        this.nonUpgradeData = results.nonUpgrade.data || [];
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.notificationService.showError(
          'Load Failed',
          error.error?.message || 'Failed to load member level data'
        );
      },
    });
  }

  // ─── Computed ────────────────────────────────────────────────────────────────

  get currentTableData(): MemberLevel[] {
    return this.currentView === 'upgrade' ? this.upgradeData : this.nonUpgradeData;
  }

  // ─── Tab / pagination ────────────────────────────────────────────────────────

  onViewChange(view: string): void {
    this.currentView = view;
  }

  onPageChange(page: number): void {}

  // ─── Modal ───────────────────────────────────────────────────────────────────

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedRow = null;
    this.resetForm();
    this.modalConfig = { ...this.modalConfig, title: 'Create New Level' };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form.reset({
      Description: '',
      MinPoints: '',
      MaxPoints: '',
      NextLevelLabel: '',
      CardType: '',
      LoyaltyCode: '',
      RedeemCode: '',
      TopupCode: '',
    });
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  onEdit(row: MemberLevel): void {
    this.isEditMode = true;
    this.selectedRow = row;

    this.form.patchValue({
      Description: row.Description,
      MinPoints: row.MinPoints,
      MaxPoints: row.MaxPoints,
      NextLevelLabel: row.NextLevelLabel,
      CardType: row.CardType,
      LoyaltyCode: row.LoyaltyCode,
      RedeemCode: row.RedeemCode,
      TopupCode: row.TopupCode,
    });

    this.originalFormValue = { ...this.form.value };
    this.modalConfig = { ...this.modalConfig, title: 'Edit Member Level' };
    this.isModalOpen = true;
  }

  onDelete(row: MemberLevel): void {
    const title = row.Description;
    const message = `${row.memberlevelCode} - ${row.Description}`;

    this.confirmationService.confirmDelete(title, message).then((confirmed: boolean) => {
      if (!confirmed) return;

      this.dataService
        .deleteMethod(`api/v1/loyalty/memberlevels/details/${row.LineNo}`)
        .subscribe(
          (response: any) => {
            this.notificationService.showSuccess(
              'Deleted',
              response.message || 'Member level deleted successfully'
            );
            this.loadTableData();
          },
          (error: HttpErrorResponse) => {
            this.notificationService.showError(
              'Delete Failed',
              error.error?.message || 'Error deleting member level'
            );
          }
        );
    });
  }

  saveMemberLevel(): void {
    if (this.isSaving) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;
    this.isSaving = true;

    let request$;

    if (this.isEditMode) {
      const changedColumn = Object.keys(formData).find(
        key => formData[key] !== this.originalFormValue[key]
      );

      if (!changedColumn) {
        this.isSaving = false;
        this.notificationService.showError('No Changes', 'No field was modified');
        return;
      }

      const updatePayload = {
        column: changedColumn,
        value: formData[changedColumn],
      };

      request$ = this.dataService.putMethod(
        `api/v1/loyalty/memberlevels/details/${this.selectedRow?.LineNo}`,
        JSON.stringify(updatePayload)
      );
    } else {
      const upgradeFlag = this.currentView === 'upgrade' ? 'Yes' : 'No';

      const createPayload = {
        Description: formData.Description,
        MinPoints: Number(formData.MinPoints),
        MaxPoints: Number(formData.MaxPoints),
        NextLevelLabel: formData.NextLevelLabel || '',
        CardType: formData.CardType || '',
        LoyaltyCode: formData.LoyaltyCode || '',
        RedeemCode: formData.RedeemCode || '',
        TopupCode: formData.TopupCode || '',
        Upgrade: upgradeFlag,
      };

      request$ = this.dataService.postMethod(
        'api/v1/loyalty/memberlevels/details',
        JSON.stringify(createPayload)
      );
    }

    request$.subscribe(
      (response: any) => {
        this.notificationService.showSuccess(
          this.isEditMode ? 'Updated' : 'Created',
          response.message || `Member level ${this.isEditMode ? 'updated' : 'created'} successfully`
        );
        this.isSaving = false;
        this.closeModal();
        this.loadTableData();
      },
      (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.notificationService.showError(
          'Error',
          error.error?.message || `Error ${this.isEditMode ? 'updating' : 'creating'} member level`
        );
      }
    );
  }
}