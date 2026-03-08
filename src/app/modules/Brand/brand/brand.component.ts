import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { CardComponent } from '../../../components/ui/card/card.component';

export interface Brand {
  brand_id: string;
  name: string;
  description: string;
  status: string;
  pointsratio: number | null;
  imagepath: string | null;
}

// ─── Route context config ─────────────────────────────────────────────────────
// Drives the header and row-click destination based on the current route path.

interface RouteContext {
  title: string;
  subtitle: string;
  detailsPath: string;   // base path for navigate([detailsPath, brand_id])
  showCreate: boolean;   // only show "Create Brand" on the main brands screen
}

const ROUTE_CONTEXT_MAP: Record<string, RouteContext> = {
  'Brand': {
    title: 'Brands',
    subtitle: 'Manage brands — click a row to view details',
    detailsPath: '/crafted/retail/Brand-details',
    showCreate: true,
  },
  'points-reset-by-brand': {
    title: 'Points Reset by Brand',
    subtitle: 'Select a brand to configure accumulated points reset',
    detailsPath: '/crafted/retail/points-reset-by-brand',
    showCreate: false,
  },
  'pointsexpirysetupbybrand': {
    title: 'Points Expiry Setup by Brand',
    subtitle: 'Select a brand to configure points expiry settings',
    detailsPath: '/crafted/retail/pointsexpirysetupbybrand',
    showCreate: false,
  },
};

const DEFAULT_CONTEXT: RouteContext = {
  title: 'Brands',
  subtitle: 'Select a brand',
  detailsPath: '/crafted/retail/Brand-details',
  showCreate: false,
};

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableComponent, TableCellDirective,
    ButtonComponent, BadgeComponent,
    ModalComponent, InputComponent,
    LoadingComponent,CardComponent
  ],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {

  private fb = inject(FormBuilder);

  // ─── Route context (resolved in ngOnInit) ─────────────────────────────────
  ctx: RouteContext = DEFAULT_CONTEXT;

  // ─── State ────────────────────────────────────────────────────────────────
  brands: Brand[] = [];
  isLoading = false;
  isModalOpen = false;
  isSubmitting = false;

  // ─── Form ─────────────────────────────────────────────────────────────────
  brandForm!: FormGroup;

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'imagepath',   label: 'Logo',         sortable: false, align: 'left' },
    { key: 'brand_id',    label: 'Code',         sortable: true  },
    { key: 'name',        label: 'Brand',        sortable: true  },
    { key: 'description', label: 'Description',  sortable: true  },
    { key: 'status',      label: 'Status',       sortable: true  },
    { key: 'pointsratio', label: 'Points Ratio', sortable: true  },
    { key: 'actions',     label: 'Actions',      sortable: false },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No brands found.',
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
    this.resolveRouteContext();
    this.buildForm();
    this.loadBrands();
  }

  // ─── Resolve context from current URL ────────────────────────────────────
  // Matches the first URL segment after the last '/' to the context map.

  private resolveRouteContext(): void {
    const urlSegments = this.route.snapshot.url;
    // Take the last segment value e.g. 'Brand', 'points-reset-by-brand'
    const segment = urlSegments.length > 0
      ? urlSegments[urlSegments.length - 1].path
      : '';

    this.ctx = ROUTE_CONTEXT_MAP[segment] ?? DEFAULT_CONTEXT;

    // Hide the actions (delete) column on non-brand-management screens
    if (!this.ctx.showCreate) {
      this.tableColumns = this.tableColumns.filter(c => c.key !== 'actions');
    }
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.brandForm = this.fb.group({
      brand_id: ['', Validators.required],
      name:     ['', Validators.required],
    });
  }

  get f() { return this.brandForm.controls; }

  fieldInvalid(field: string): boolean {
    const c = this.brandForm.get(field);
    return !!(c?.invalid && c?.touched);
  }

  // ─── Load brands ──────────────────────────────────────────────────────────

  loadBrands(): void {
    this.isLoading = true;
    this.tableConfig = { ...this.tableConfig, loading: true };

    this.dataService.getMethod('api/v1/member/getAllBrands').subscribe({
      next: (res: any) => {
        this.brands = res?.data || [];
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.brands = [];
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load brands');
      },
    });
  }

  // ─── Row click → navigate based on route context ─────────────────────────

  onRowClick(brand: any): void {
    this.router.navigate([this.ctx.detailsPath, brand.brand_id]);
  }

  // ─── Add brand modal (only shown in Brand context) ────────────────────────

  openAddBrandModal(): void {
    this.brandForm.reset();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.brandForm.reset();
  }

  addBrand(): void {
    this.brandForm.markAllAsTouched();
    if (this.brandForm.invalid) return;

    this.isSubmitting = true;
    const { brand_id, name } = this.brandForm.value;

    this.dataService.postMethod('api/v1/member/createBrand', JSON.stringify({ brand_id, name })).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.notificationService.showSuccess('Created', res.message || 'Brand created successfully');
        this.closeModal();
        this.router.navigate(['/crafted/retail/Brand-details', brand_id]);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create brand');
      },
    });
  }

  // ─── Delete brand (only on Brand management screen) ──────────────────────

  onDeleteBrand(brand: Brand, event: MouseEvent): void {
    event.stopPropagation();
    this.confirmationService.confirmDelete(brand.name, 'brand').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/member/deleteBrand/${brand.brand_id}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', `Brand "${brand.name}" deleted`);
          this.loadBrands();
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete brand');
        },
      });
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getStatusVariant(status: string): 'success' | 'danger' | 'secondary' {
    if (status === 'Enable')  return 'success';
    if (status === 'Disable') return 'danger';
    return 'secondary';
  }
}