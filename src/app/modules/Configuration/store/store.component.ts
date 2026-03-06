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
import { SwitchComponent } from '../../../components/ui/switch/switch.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Store {
  StoreID: string;
  Name: string;
  Brand: string;
  StoreType?: string;
  Address?: string;
  Address2?: string;
  City?: string;
  PostCode?: string;
  CountryCode?: string;
  StoreManagerName?: string;
  longitude?: string;
  latitude?: string;
  googlemapurl?: string;
  terminalID?: string;
  DefaultPriceGroup?: string;
  StoreGroup?: string;
}

export interface StoreTender {
  ID?: number;
  StoreID?: string;
  TenderCode: string;
  TenderType: string;
}

export interface StoreUser {
  ID?: number;
  StoreID?: string;
  Email?: string;
  Name?: string;
  allow_topup?: boolean;
  allow_applycoupon?: boolean;
  allow_payment?: boolean;
  allow_returncoupon?: boolean;
  cancel_topup?: boolean;
  cancel_payment?: boolean;
  manager?: boolean;
}

@Component({
  selector: 'app-store',
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
    SwitchComponent,
  ],
  templateUrl: './store.component.html',
  styleUrl: './store.component.css',
})
export class StoreComponent implements OnInit {
  private fb = inject(FormBuilder);

  // ─── State ─────────────────────────────────────────────────────────────────
  currentView: string = 'details';
  selectedStore: Store | null = null;

  isStoreLoading = false;
  isTenderLoading = false;
  isUserLoading = false;

  // Store list (left panel)
  storeList: Store[] = [];

  // Right-panel tab data
  tenderList: StoreTender[] = [];
  userList: StoreUser[] = [];
  selectedUser: StoreUser | null = null;

  // Dropdown sources
  brandOptions: SelectOption[] = [];
  tenderCodeOptions: SelectOption[] = [];
  tenderTypeOptions: SelectOption[] = [];
  allUsersOptions: SelectOption[] = [];
  countryOptions: SelectOption[] = [];

  // Modals
  isStoreModalOpen = false;
  isStoreEditMode = false;
  isSavingStore = false;
  originalStoreValue: any;

  isTenderModalOpen = false;
  isTenderEditMode = false;
  isSavingTender = false;

  isUserModalOpen = false;
  isSavingUser = false;

  isUserPermModalOpen = false;
  isSavingUserPerm = false;

  // ─── Tab ───────────────────────────────────────────────────────────────────
  viewTabs: TabItem[] = [
    { label: 'Store Details', value: 'details' },
    { label: 'Store Tender', value: 'tender' },
    { label: 'Store User', value: 'user' },
  ];

  // ─── Store list table ───────────────────────────────────────────────────────
  storeListColumns: TableColumn[] = [
    { key: 'StoreID', label: 'Store ID' },
    { key: 'Name', label: 'Name' },
    { key: 'Brand', label: 'Brand' },
    { key: 'actions', label: 'Actions', align: 'center' },
  ];

  storeListConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No stores found',
  };

  // ─── Tender table ──────────────────────────────────────────────────────────
  tenderColumns: TableColumn[] = [
    { key: 'TenderCode', label: 'Tender Code' },
    { key: 'TenderType', label: 'Tender Type' },
    { key: 'actions', label: 'Actions', align: 'center' },
  ];

  tenderConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No tenders found for this store',
  };

  // ─── User table ─────────────────────────────────────────────────────────────
  userColumns: TableColumn[] = [
    { key: 'Email', label: 'Email' },
    { key: 'Name', label: 'Name' },
    { key: 'actions', label: 'Actions', align: 'center' },
  ];

  userConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No users assigned to this store',
  };

  // ─── Forms ─────────────────────────────────────────────────────────────────
  storeForm!: FormGroup;
  storeCreateForm!: FormGroup;
  tenderForm!: FormGroup;
  userForm!: FormGroup;
  userPermForm!: FormGroup;

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initForms();
    this.loadDropdowns();
    this.loadStores();
  }

  private initForms(): void {
    // Store details (edit selected store inline)
    this.storeForm = this.fb.group({
      StoreID: [{ value: '', disabled: true }],
      Name: [''],
      StoreManagerName: [''],
      Address: [''],
      Address2: [''],
      City: [''],
      PostCode: [''],
      CountryCode: [''],
      longitude: [''],
      latitude: [''],
      googlemapurl: [''],
      terminalID: [''],
      DefaultPriceGroup: [''],
      StoreGroup: [''],
      Brand: [''],
    });

    // Create new store modal
    this.storeCreateForm = this.fb.group({
      StoreID: [''],
      Name: [''],
      Brand: [''],
    });

    // Tender modal
    this.tenderForm = this.fb.group({
      TenderCode: [''],
      TenderType: [''],
    });

    // Add user modal
    this.userForm = this.fb.group({
      Email: [''],
    });

    // User permissions panel
    this.userPermForm = this.fb.group({
      allow_topup: [false],
      allow_applycoupon: [false],
      allow_payment: [false],
      allow_returncoupon: [false],
      cancel_topup: [false],
      cancel_payment: [false],
      manager: [false],
    });
  }

  // ─── Data loading ───────────────────────────────────────────────────────────

  loadDropdowns(): void {
    forkJoin({
      brands: this.dataService.getMethod('api/v1/member/getAllBrands'),
      dropdown: this.dataService.getMethod('api/v1/stores/dropdown'),
      users: this.dataService.getMethod('api/v1/customers/byid'),
    }).subscribe({
      next: (results: any) => {
        this.brandOptions = (results.brands.data || []).map((b: any) => ({
          value: b.brand_id,
          label: b.name || b.brand_id,
        }));

        this.tenderTypeOptions = (results.dropdown.data?.tendertype || []).map((t: any) => ({
          value: t.Code,
          label: t.Code,
        }));

        this.tenderCodeOptions = (results.dropdown.data?.tendercode || []).map((t: any) => ({
          value: t.Code,
          label: t.Code,
        }));

        this.allUsersOptions = (results.users.data || []).map((u: any) => ({
          value: u.email,
          label: `${u.name} (${u.email})`,
        }));
      },
      error: (error: HttpErrorResponse) => {
        this.notificationService.showError(
          'Error',
          error.error?.message || 'Failed to load dropdown options'
        );
      },
    });
  }

  loadStores(): void {
    this.isStoreLoading = true;
    this.dataService.getMethod('api/v1/stores/all').subscribe({
      next: (data: any) => {
        this.storeList = data.data || [];
        this.isStoreLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isStoreLoading = false;
        this.notificationService.showError(
          'Load Failed',
          error.error?.message || 'Failed to load stores'
        );
      },
    });
  }

  loadStoreTenders(): void {
    if (!this.selectedStore) return;
    this.isTenderLoading = true;
    this.dataService.getMethod(`api/v1/stores/storebytender/${this.selectedStore.StoreID}`).subscribe({
      next: (data: any) => {
        this.tenderList = data.data || [];
        this.isTenderLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isTenderLoading = false;
        this.notificationService.showError(
          'Load Failed',
          error.error?.message || 'Failed to load tenders'
        );
      },
    });
  }

  loadStoreUsers(): void {
    if (!this.selectedStore) return;
    this.isUserLoading = true;
    this.dataService.getMethod(`api/v1/stores/storebyusers/${this.selectedStore.StoreID}`).subscribe({
      next: (data: any) => {
        const raw = data.data || [];
        this.userList = raw.map((u: any) => ({
          ...u,
          allow_topup: u.allow_topup === 'Yes',
          allow_applycoupon: u.allow_applycoupon === 'Yes',
          allow_payment: u.allow_payment === 'Yes',
          allow_returncoupon: u.allow_returncoupon === 'Yes',
          cancel_topup: u.cancel_topup === 'Yes',
          cancel_payment: u.cancel_payment === 'Yes',
          manager: u.manager === 'Yes',
        }));
        this.isUserLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isUserLoading = false;
        this.notificationService.showError(
          'Load Failed',
          error.error?.message || 'Failed to load users'
        );
      },
    });
  }

  // ─── Tab ───────────────────────────────────────────────────────────────────

  onViewChange(view: string): void {
    if (!this.selectedStore && view !== 'details') {
      this.notificationService.showError('No Store Selected', 'Please select a store first');
      return;
    }
    this.currentView = view;
    if (view === 'tender') this.loadStoreTenders();
    if (view === 'user') this.loadStoreUsers();
  }

  // ─── Store selection ────────────────────────────────────────────────────────

  onSelectStore(row: any): void {
    this.selectedStore = row;
    this.originalStoreValue = { ...row };
    this.storeForm.patchValue({
      StoreID: row.StoreID,
      Name: row.Name,
      StoreManagerName: row.StoreManagerName || '',
      Address: row.Address || '',
      Address2: row.Address2 || '',
      City: row.City || '',
      PostCode: row.PostCode || '',
      CountryCode: row.CountryCode || '',
      longitude: row.longitude || '',
      latitude: row.latitude || '',
      googlemapurl: row.googlemapurl || '',
      terminalID: row.terminalID || '',
      DefaultPriceGroup: row.DefaultPriceGroup || '',
      StoreGroup: row.StoreGroup || '',
      Brand: row.Brand || '',
    });
    // Reset to details tab when a new store is selected
    this.currentView = 'details';
    this.selectedUser = null;
  }

  // ─── Store Details save ─────────────────────────────────────────────────────

  saveStoreDetails(): void {
    const formData = this.storeForm.getRawValue();
    const changedColumn = Object.keys(formData).find(
      key => key !== 'StoreID' && formData[key] !== (this.originalStoreValue as any)[key]
    );

    if (!changedColumn) {
      this.notificationService.showError('No Changes', 'No field was modified');
      return;
    }

    this.dataService
      .putMethod(
        `api/v1/stores/${this.selectedStore!.StoreID}`,
        JSON.stringify({ column: changedColumn, value: formData[changedColumn] })
      )
      .subscribe(
        (response: any) => {
          this.notificationService.showSuccess('Updated', response.message || 'Store updated successfully');
          this.originalStoreValue = { ...this.originalStoreValue, [changedColumn]: formData[changedColumn] };
          this.loadStores();
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError('Error', error.error?.message || 'Error updating store');
        }
      );
  }

  // ─── Store create/delete ────────────────────────────────────────────────────

  openCreateStoreModal(): void {
    this.storeCreateForm.reset({ StoreID: '', Name: '', Brand: '' });
    this.isStoreModalOpen = true;
  }

  closeStoreModal(): void {
    this.isStoreModalOpen = false;
    this.storeCreateForm.reset();
  }

  saveNewStore(): void {
    if (this.isSavingStore) return;
    if (this.storeCreateForm.invalid) {
      this.storeCreateForm.markAllAsTouched();
      return;
    }
    this.isSavingStore = true;
    const v = this.storeCreateForm.value;

    this.dataService
      .postMethod('api/v1/stores/New', JSON.stringify({ StoreID: v.StoreID, Name: v.Name, Brand: v.Brand }))
      .subscribe(
        (response: any) => {
          this.notificationService.showSuccess('Created', response.message || 'Store created successfully');
          this.isSavingStore = false;
          this.closeStoreModal();
          this.loadStores();
        },
        (error: HttpErrorResponse) => {
          this.isSavingStore = false;
          this.notificationService.showError('Error', error.error?.message || 'Error creating store');
        }
      );
  }

  onDeleteStore(row: any): void {
    this.confirmationService.confirmDelete(row.StoreID, row.Name).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/stores/${row.StoreID}`).subscribe(
        (response: any) => {
          this.notificationService.showSuccess('Deleted', response.message || 'Store deleted successfully');
          if (this.selectedStore?.StoreID === row.StoreID) {
            this.selectedStore = null;
            this.storeForm.reset();
          }
          this.loadStores();
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', error.error?.message || 'Error deleting store');
        }
      );
    });
  }

  // ─── Tender CRUD ────────────────────────────────────────────────────────────

  openCreateTenderModal(): void {
    this.isTenderEditMode = false;
    this.tenderForm.reset({ TenderCode: '', TenderType: '' });
    this.isTenderModalOpen = true;
  }

  closeTenderModal(): void {
    this.isTenderModalOpen = false;
    this.tenderForm.reset();
  }

  saveTender(): void {
    if (this.isSavingTender) return;
    const v = this.tenderForm.value;

    const isDuplicate = this.tenderList.some(
      t => t.TenderCode === v.TenderCode && t.TenderType === v.TenderType
    );
    if (isDuplicate) {
      this.notificationService.showError('Duplicate', 'This tender combination already exists');
      return;
    }

    this.isSavingTender = true;
    this.dataService
      .postMethod(
        'api/v1/stores/storebytender',
        JSON.stringify({ StoreID: this.selectedStore!.StoreID, TenderCode: v.TenderCode, TenderType: v.TenderType })
      )
      .subscribe(
        (response: any) => {
          this.notificationService.showSuccess('Created', response.message || 'Tender added successfully');
          this.isSavingTender = false;
          this.closeTenderModal();
          this.loadStoreTenders();
        },
        (error: HttpErrorResponse) => {
          this.isSavingTender = false;
          this.notificationService.showError('Error', error.error?.message || 'Error adding tender');
        }
      );
  }

  onDeleteTender(row: any): void {
    this.confirmationService
      .confirmDelete(row.TenderCode, `${row.TenderCode} / ${row.TenderType}`)
      .then((confirmed: boolean) => {
        if (!confirmed) return;
        this.dataService
          .deleteMethod(
            `api/v1/stores/storebytender/${row.StoreID}/${row.TenderCode}/${row.ID}`
          )
          .subscribe(
            (response: any) => {
              this.notificationService.showSuccess('Deleted', response.message || 'Tender deleted successfully');
              this.loadStoreTenders();
            },
            (error: HttpErrorResponse) => {
              this.notificationService.showError('Delete Failed', error.error?.message || 'Error deleting tender');
            }
          );
      });
  }

  // ─── User CRUD ──────────────────────────────────────────────────────────────

  openAddUserModal(): void {
    this.userForm.reset({ Email: '' });
    this.isUserModalOpen = true;
  }

  closeUserModal(): void {
    this.isUserModalOpen = false;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.isSavingUser) return;
    const email = this.userForm.value.Email;

    const isDuplicate = this.userList.some(
      (u:any) => u.Email.toLowerCase() === email.toLowerCase()
    );
    if (isDuplicate) {
      this.notificationService.showError('Duplicate', 'This user has already been added to the store');
      return;
    }

    this.isSavingUser = true;
    this.dataService
      .postMethod(
        'api/v1/stores/storebyusers',
        JSON.stringify({ StoreID: this.selectedStore!.StoreID, Email: email, Name: '' })
      )
      .subscribe(
        (response: any) => {
          this.notificationService.showSuccess('Added', response.message || 'User added successfully');
          this.isSavingUser = false;
          this.closeUserModal();
          this.loadStoreUsers();
        },
        (error: HttpErrorResponse) => {
          this.isSavingUser = false;
          this.notificationService.showError('Error', error.error?.message || 'Error adding user');
        }
      );
  }

  onDeleteUser(row: any): void {
    this.confirmationService.confirmDelete(row.Email, row.Name || row.Email).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.dataService
        .deleteMethod(`api/v1/stores/storebyusers/${row.StoreID}/${row.ID}`)
        .subscribe(
          (response: any) => {
            this.notificationService.showSuccess('Deleted', response.message || 'User removed successfully');
            if (this.selectedUser?.Email === row.Email) this.selectedUser = null;
            this.loadStoreUsers();
          },
          (error: HttpErrorResponse) => {
            this.notificationService.showError('Delete Failed', error.error?.message || 'Error removing user');
          }
        );
    });
  }

  // ─── User permissions ───────────────────────────────────────────────────────

  onSelectUser(row: any): void {
    this.selectedUser = row;
    this.userPermForm.patchValue({
      allow_topup: row.allow_topup ?? false,
      allow_applycoupon: row.allow_applycoupon ?? false,
      allow_payment: row.allow_payment ?? false,
      allow_returncoupon: row.allow_returncoupon ?? false,
      cancel_topup: row.cancel_topup ?? false,
      cancel_payment: row.cancel_payment ?? false,
      manager: row.manager ?? false,
    });
  }

  saveUserPermission(field: string): void {
    if (!this.selectedUser) return;
    const value = this.userPermForm.get(field)?.value ? 'Yes' : 'No';

    this.dataService
      .putMethod(
        `api/v1/stores/storebyusersenum/${this.selectedUser.StoreID}/${this.selectedUser.Email}`,
        JSON.stringify({ column: field, value })
      )
      .subscribe(
        (response: any) => {
          this.notificationService.showSuccess('Updated', response.message || 'Permission updated');
          this.loadStoreUsers();
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError('Error', error.error?.message || 'Error updating permission');
        }
      );
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  onPageChange(page: number): void {}

  get hasStoreSelected(): boolean {
    return !!this.selectedStore;
  }
}