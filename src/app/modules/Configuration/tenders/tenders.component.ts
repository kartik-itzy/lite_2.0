import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

export interface TenderMaster {
  Code: string;
  Name: string;
  TenderType?: string;
  PromptforNo?: string | null;
  PromptText?: string | null;
  CardCode?: string | null;
  LastModifiedOn?: string;
}

export interface TenderCard {
  Code: string;
  Name: string;
  TenderType: string;
  CardImagePath?: string | null;
  LastModifiedOn?: string;
}

@Component({
  selector: 'app-tenders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    TableComponent,
    TableCellDirective,
    ModalComponent,
    InputComponent,
    SelectComponent,
    ExportExcelComponent,
  ],
  templateUrl: './tenders.component.html',
  styleUrl: './tenders.component.css',
})
export class TendersComponent implements OnInit {
  private fb = inject(FormBuilder);

  // ─── State ─────────────────────────────────────────────────────────────────
  isMasterLoading = false;
  isCardLoading = false;

  isMasterModalOpen = false;
  isMasterEditMode = false;
  isSavingMaster = false;
  originalMasterValue: any;
  selectedMaster: TenderMaster | null = null;

  isCardModalOpen = false;
  isCardEditMode = false;
  isSavingCard = false;
  originalCardValue: any;
  selectedCard: TenderCard | null = null;

  // ─── Data ──────────────────────────────────────────────────────────────────
  tenderMasterData: TenderMaster[] = [];
  tenderCardData: TenderCard[] = [];
  tenderTypeOptions: SelectOption[] = [];

  // ─── Tables ────────────────────────────────────────────────────────────────
  masterColumns: TableColumn[] = [
    { key: 'Code', label: 'Code',  },
    { key: 'Name', label: 'Name',  },
    { key: 'TenderType', label: 'Tender Type',  },
    { key: 'actions', label: 'Actions', align: 'center' },
  ];

  masterConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 8,
    searchable: true,
    loading: false,
    emptyMessage: 'No tender master records found',
  };

  masterExportColumns: ExportColumn[] = [
    { key: 'Code', label: 'Code' },
    { key: 'Name', label: 'Name' },
    { key: 'TenderType', label: 'Tender Type' },
    { key: 'LastModifiedOn', label: 'Last Modified On' },
  ];

  cardColumns: TableColumn[] = [
    { key: 'Code', label: 'Code',  },
    { key: 'Name', label: 'Name',  },
    { key: 'TenderType', label: 'Tender Type',  },
    { key: 'actions', label: 'Actions', align: 'center' },
  ];

  cardConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 8,
    searchable: true,
    loading: false,
    emptyMessage: 'Select a tender master row to view its cards',
  };

  cardExportColumns: ExportColumn[] = [
    { key: 'Code', label: 'Code' },
    { key: 'Name', label: 'Name' },
    { key: 'TenderType', label: 'Tender Type' },
    { key: 'LastModifiedOn', label: 'Last Modified On' },
  ];

  // ─── Forms ─────────────────────────────────────────────────────────────────
  masterForm!: FormGroup;
  cardForm!: FormGroup;

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.masterForm = this.fb.group({
      Code: ['', Validators.required],
      Name: ['', Validators.required],
    });

    this.cardForm = this.fb.group({
      Code: ['', Validators.required],
      Name: ['', Validators.required],
      TenderType: ['', Validators.required],
    });

    this.loadTenderTypes();
    this.loadTenderMaster();
  }

  // ─── Data loading ───────────────────────────────────────────────────────────

  loadTenderTypes(): void {
    this.dataService.getMethod('api/v1/stores/tendertype').subscribe({
      next: (data: any) => {
        this.tenderTypeOptions = (data.data || []).map((t: any) => ({
          value: t.Code,
          label: t.Code,
        }));
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showError(
          'Error',
          error.error?.message || 'Failed to load tender types'
        );
      },
    });
  }

  loadTenderMaster(): void {
    this.isMasterLoading = true;
    this.dataService.getMethod('api/v1/stores/tendermaster').subscribe({
      next: (data: any) => {
        this.tenderMasterData = data.data || [];
        this.isMasterLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isMasterLoading = false;
        this.notificationService.showError(
          'Load Failed',
          error.error?.message || 'Failed to load tender master'
        );
      },
    });
  }

  loadTenderCards(tenderType: string): void {
    this.isCardLoading = true;
    this.dataService.getMethod('api/v1/stores/tendercards').subscribe({
      next: (data: any) => {
        const all: TenderCard[] = data.data || [];
        this.tenderCardData = all.filter(c => c.TenderType === tenderType);
        this.isCardLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isCardLoading = false;
        this.notificationService.showError(
          'Load Failed',
          error.error?.message || 'Failed to load tender cards'
        );
      },
    });
  }

  // ─── Master row select ──────────────────────────────────────────────────────

  onSelectMaster(row: any): void {
    this.selectedMaster = row;
    this.loadTenderCards(row.TenderType);
  }

  // ─── Tender Master CRUD ─────────────────────────────────────────────────────

  openCreateMasterModal(): void {
    this.isMasterEditMode = false;
    this.selectedMaster = null;
    this.masterForm.reset({ Code: '', Name: '' });
    this.masterForm.get('Code')?.enable();
    this.isMasterModalOpen = true;
  }

  openEditMasterModal(row: any): void {
    this.isMasterEditMode = true;
    this.selectedMaster = row;
    this.originalMasterValue = { ...row };
    this.masterForm.patchValue({ Code: row.Code, Name: row.Name });
    this.masterForm.get('Code')?.disable(); // Code is read-only on edit
    this.isMasterModalOpen = true;
  }

  closeMasterModal(): void {
    this.isMasterModalOpen = false;
    this.masterForm.reset();
    this.masterForm.get('Code')?.enable();
  }

  saveMaster(): void {
    if (this.isSavingMaster) return;
    if (this.masterForm.invalid) {
      this.masterForm.markAllAsTouched();
      return;
    }

    this.isSavingMaster = true;
    const formData = this.masterForm.getRawValue();

    if (this.isMasterEditMode) {
      const changedColumn = Object.keys(formData).find(
        key => formData[key] !== this.originalMasterValue[key]
      );

      if (!changedColumn) {
        this.isSavingMaster = false;
        this.notificationService.showError('No Changes', 'No field was modified');
        return;
      }

      this.dataService
        .putMethod(
          `api/v1/stores/tendermaster/${this.selectedMaster!.Code}`,
          JSON.stringify({ column: changedColumn, value: formData[changedColumn] })
        )
        .subscribe(
          (response: any) => {
            this.notificationService.showSuccess('Updated', response.message || 'Tender master updated');
            this.isSavingMaster = false;
            this.closeMasterModal();
            this.loadTenderMaster();
          },
          (error: HttpErrorResponse) => {
            this.isSavingMaster = false;
            this.notificationService.showError('Error', error.error?.message || 'Error updating tender master');
          }
        );
    } else {
      this.dataService
        .postMethod(
          'api/v1/stores/tendermaster',
          JSON.stringify({ Code: formData.Code, Name: formData.Name })
        )
        .subscribe(
          (response: any) => {
            this.notificationService.showSuccess('Created', response.message || 'Tender master created');
            this.isSavingMaster = false;
            this.closeMasterModal();
            this.loadTenderMaster();
            this.loadTenderTypes(); // refresh types after new master
          },
          (error: HttpErrorResponse) => {
            this.isSavingMaster = false;
            this.notificationService.showError('Error', error.error?.message || 'Error creating tender master');
          }
        );
    }
  }

  onDeleteMaster(row: any): void {
    this.confirmationService.confirmDelete(row.Code, row.Name).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/stores/tendermaster/${row.Code}`).subscribe(
        (response: any) => {
          this.notificationService.showSuccess('Deleted', response.message || 'Tender master deleted');
          if (this.selectedMaster?.Code === row.Code) {
            this.selectedMaster = null;
            this.tenderCardData = [];
          }
          this.loadTenderMaster();
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', error.error?.message || 'Error deleting tender master');
        }
      );
    });
  }

  // ─── Tender Card CRUD ───────────────────────────────────────────────────────

  openCreateCardModal(): void {
    this.isCardEditMode = false;
    this.selectedCard = null;
    this.cardForm.reset({
      Code: '',
      Name: '',
      TenderType: this.selectedMaster?.TenderType || '',
    });
    this.cardForm.get('Code')?.enable();
    this.isCardModalOpen = true;
  }

  openEditCardModal(row: any): void {
    this.isCardEditMode = true;
    this.selectedCard = row;
    this.originalCardValue = { ...row };
    this.cardForm.patchValue({ Code: row.Code, Name: row.Name, TenderType: row.TenderType });
    this.cardForm.get('Code')?.disable(); // Code is read-only on edit
    this.isCardModalOpen = true;
  }

  closeCardModal(): void {
    this.isCardModalOpen = false;
    this.cardForm.reset();
    this.cardForm.get('Code')?.enable();
  }

  saveCard(): void {
    if (this.isSavingCard) return;
    if (this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    this.isSavingCard = true;
    const formData = this.cardForm.getRawValue();

    if (this.isCardEditMode) {
      const changedColumn = Object.keys(formData).find(
        key => formData[key] !== this.originalCardValue[key]
      );

      if (!changedColumn) {
        this.isSavingCard = false;
        this.notificationService.showError('No Changes', 'No field was modified');
        return;
      }

      this.dataService
        .putMethod(
          `api/v1/stores/tendercards/${this.selectedCard!.Code}`,
          JSON.stringify({ column: changedColumn, value: formData[changedColumn] })
        )
        .subscribe(
          (response: any) => {
            this.notificationService.showSuccess('Updated', response.message || 'Tender card updated');
            this.isSavingCard = false;
            this.closeCardModal();
            this.loadTenderCards(this.selectedMaster!.TenderType!);
          },
          (error: HttpErrorResponse) => {
            this.isSavingCard = false;
            this.notificationService.showError('Error', error.error?.message || 'Error updating tender card');
          }
        );
    } else {
      this.dataService
        .postMethod(
          'api/v1/stores/tendercards',
          JSON.stringify({
            Code: formData.Code,
            Name: formData.Name,
            TenderType: formData.TenderType,
          })
        )
        .subscribe(
          (response: any) => {
            this.notificationService.showSuccess('Created', response.message || 'Tender card created');
            this.isSavingCard = false;
            this.closeCardModal();
            this.loadTenderCards(this.selectedMaster!.TenderType!);
          },
          (error: HttpErrorResponse) => {
            this.isSavingCard = false;
            this.notificationService.showError('Error', error.error?.message || 'Error creating tender card');
          }
        );
    }
  }

  onDeleteCard(row: any): void {
    this.confirmationService.confirmDelete(row.Code, row.Name).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/stores/tendercards/${row.Code}`).subscribe(
        (response: any) => {
          this.notificationService.showSuccess('Deleted', response.message || 'Tender card deleted');
          this.loadTenderCards(this.selectedMaster!.TenderType!);
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', error.error?.message || 'Error deleting tender card');
        }
      );
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  onPageChange(page: number): void {}
}