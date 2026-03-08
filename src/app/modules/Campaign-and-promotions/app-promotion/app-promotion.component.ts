import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { CardComponent } from '../../../components/ui/card/card.component';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AppPromotion {
  EntryNo: number;
  displaysequence: number;
  imagepath: string | null;
  displaytext: string;
  description: string;
  startdate: string;
  enddate: string;
  adurl: string;
}

// ─── Custom validator: enddate >= startdate ───────────────────────────────────

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startdate')?.value;
  const end   = group.get('enddate')?.value;
  if (start && end && end < start) {
    return { dateRange: 'Ending date must be greater than or equal to Starting date' };
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-app-promotion',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    ButtonComponent, BadgeComponent,CardComponent,
    TableComponent, TableCellDirective,
    InputComponent, ModalComponent, LoadingComponent,
  ],
  templateUrl: './app-promotion.component.html',
  styleUrl: './app-promotion.component.css',
})
export class AppPromotionComponent implements OnInit {

  // ─── Table ────────────────────────────────────────────────────────────────
  promotions: AppPromotion[] = [];
  isLoading = false;

  tableColumns: TableColumn[] = [
    { key: 'displaysequence', label: 'Seq No',       sortable: true  },
    { key: 'imagepath',       label: 'Image',        sortable: false },
    { key: 'displaytext',     label: 'Display Text', sortable: true  },
    { key: 'description',     label: 'Description',  sortable: true  },
    { key: 'startdate',       label: 'Start Date',   sortable: true  },
    { key: 'enddate',         label: 'End Date',     sortable: true  },
    { key: 'adurl',           label: 'Ad URL',       sortable: false },
    { key: 'actions',         label: 'Actions',      sortable: false },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No app promotions found.',
  };

  // ─── Add / Edit modal ─────────────────────────────────────────────────────
  showFormModal = false;
  isEditMode = false;
  isSaving = false;
  editingEntryNo: number | null = null;
  form!: FormGroup;

  // ─── Image modal ──────────────────────────────────────────────────────────
  showImageModal = false;
  imageModalPromo: AppPromotion | null = null;
  isUploadingImage = false;
  isDeletingImage = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();
    this.loadPromotions();
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  buildForm(): void {
    this.form = this.fb.group({
      displaysequence: [null],
      displaytext:     ['', Validators.required],
      description:     [''],
      startdate:       ['', Validators.required],
      enddate:         ['', Validators.required],
      adurl:           [''],
    }, { validators: dateRangeValidator });
  }

  // Convenience getters for template
  get f() { return this.form.controls; }
  get dateRangeError(): string | null {
    return this.form.errors?.['dateRange'] ?? null;
  }

  // ─── Load ─────────────────────────────────────────────────────────────────

  loadPromotions(): void {
    this.isLoading = true;
    this.tableConfig = { ...this.tableConfig, loading: true };
    this.dataService.getMethod('api/v1/member/apppromotion').subscribe({
      next: (res: any) => {
        this.promotions = res.data || res || [];
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load promotions');
      },
    });
  }

  // ─── Open Add modal ───────────────────────────────────────────────────────

  openAddModal(): void {
    this.isEditMode = false;
    this.editingEntryNo = null;
    this.form.reset();
    this.showFormModal = true;
  }

  // ─── Open Edit modal ──────────────────────────────────────────────────────

  onRowClick(promo: any): void {
    this.isEditMode = true;
    this.editingEntryNo = promo.EntryNo;
    this.form.patchValue({
      displaysequence: promo.displaysequence,
      displaytext:     promo.displaytext,
      description:     promo.description,
      startdate:       promo.startdate?.substring(0, 10) ?? '',
      enddate:         promo.enddate?.substring(0, 10) ?? '',
      adurl:           promo.adurl,
    });
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.form.reset();
    this.editingEntryNo = null;
  }

  // ─── Save (create or update) ──────────────────────────────────────────────

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;
    this.isSaving = true;

    if (this.isEditMode && this.editingEntryNo !== null) {
      this.updatePromotion(this.editingEntryNo, v);
    } else {
      this.createPromotion(v);
    }
  }

  private createPromotion(v: any): void {
    this.dataService.postMethod('api/v1/member/apppromotion/create', JSON.stringify({
      displaytext:     v.displaytext,
      description:     v.description,
      startdate:       v.startdate,
      enddate:         v.enddate,
      adurl:           v.adurl,
    })).subscribe({
      next: () => {
        this.isSaving = false;
        this.notificationService.showSuccess('Created', 'App promotion created');
        this.closeFormModal();
        this.loadPromotions();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create');
      },
    });
  }

  private updatePromotion(entryNo: number, v: any): void {
    // Find original to diff changed columns only
    const original = this.promotions.find(p => p.EntryNo === entryNo);
    const fields: { column: string; value: any }[] = [];

    const fieldMap: { key: keyof typeof v; apiKey: string }[] = [
      { key: 'displaysequence', apiKey: 'displaysequence' },
      { key: 'displaytext',     apiKey: 'displaytext'     },
      { key: 'description',     apiKey: 'description'     },
      { key: 'startdate',       apiKey: 'startdate'       },
      { key: 'enddate',         apiKey: 'enddate'         },
      { key: 'adurl',           apiKey: 'adurl'           },
    ];

    for (const { key, apiKey } of fieldMap) {
      const orig = (original as any)?.[key]?.toString().substring(0, 10) ?? '';
      const curr = v[key]?.toString() ?? '';
      if (orig !== curr) fields.push({ column: apiKey, value: v[key] });
    }

    if (!fields.length) { this.isSaving = false; this.closeFormModal(); return; }

    const sendNext = (idx: number) => {
      if (idx >= fields.length) {
        this.isSaving = false;
        this.notificationService.showSuccess('Updated', 'App promotion updated');
        this.closeFormModal();
        this.loadPromotions();
        return;
      }
      const { column, value } = fields[idx];
      this.dataService.putMethod(`api/v1/member/apppromotion/${entryNo}`, JSON.stringify({ column, value })).subscribe({
        next: () => sendNext(idx + 1),
        error: (err: HttpErrorResponse) => {
          this.isSaving = false;
          this.notificationService.showError('Update Failed', err.error?.message || 'Failed to update');
        },
      });
    };
    sendNext(0);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  onDelete(promo: AppPromotion, event: Event): void {
    event.stopPropagation();
    this.confirmationService.confirmDelete(promo.displaytext || `Entry ${promo.EntryNo}`, 'app promotion').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/member/apppromotion/${promo.EntryNo}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', 'App promotion deleted');
          this.loadPromotions();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete');
        },
      });
    });
  }

  // ─── Image ────────────────────────────────────────────────────────────────

  openImageModal(promo: AppPromotion, event: Event): void {
    event.stopPropagation();
    if (promo.imagepath) {
      this.notificationService.showError('Image Exists', 'Delete existing image before uploading a new one');
      return;
    }
    this.imageModalPromo = promo;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.imageModalPromo = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.imageModalPromo) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.notificationService.showError('Invalid File', 'Please select a valid image file');
      return;
    }
    this.isUploadingImage = true;
    this.dataService.getBase64(file).then((base64: any) => {
      const data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
      this.dataService.postMethod(
        `api/v1/member/apppromotion/uploadimage/${this.imageModalPromo!.EntryNo}`,
        JSON.stringify({ column: 'imagepath', filename: file.name, image: data })
      ).subscribe({
        next: () => {
          this.isUploadingImage = false;
          this.notificationService.showSuccess('Uploaded', 'Image uploaded');
          this.closeImageModal();
          this.loadPromotions();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingImage = false;
          this.notificationService.showError('Upload Failed', err.error?.message || 'Upload failed');
        },
      });
    });
  }

  deleteImage(promo: AppPromotion, event: Event): void {
    event.stopPropagation();
    if (!promo.imagepath) return;
    this.confirmationService.confirmAction('Delete Image', `Delete image for <strong>${promo.displaytext}</strong>?`, 'danger').then(confirmed => {
      if (!confirmed) return;
      const match = promo.imagepath!.match(/\/([^/]+)$/);
      if (!match) return;
      const base64Name = btoa(match[1]);
      this.isDeletingImage = true;
      this.dataService.deleteMethod(`api/v1/member/apppromotion/image/${base64Name}`).subscribe({
        next: () => {
          this.isDeletingImage = false;
          this.notificationService.showSuccess('Deleted', 'Image deleted');
          this.loadPromotions();
        },
        error: (err: HttpErrorResponse) => {
          this.isDeletingImage = false;
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete image');
        },
      });
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  fieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }
}