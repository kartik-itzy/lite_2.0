import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import {
  TabComponent,
  TabItem,
} from '../../../components/ui/tab/tab.component';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../data.service';
import { HttpErrorResponse, HttpHeaderResponse } from '@angular/common/http';
import { PageHeaderComponent } from '../../../components/ui/page-header/page-header.component';
import { BreadcrumbItem } from '../../../components/ui/breadcrumb/breadcrumb.component';
import { CardComponent } from '../../../components/ui/card/card.component';
import { NgSwitch, NgSwitchCase, NgIf, CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import {
  SelectComponent,
  SelectOption,
} from '../../../components/ui/select/select.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

interface Transaction {
  ReceiptNo: string;
  CardNo: string;
  TopupAmount: string;
  StoreNo: string | null;
  Points: string;
  PointValue: string;
  PointDate: string;
  PointTime: string;
  TransactionType: string;
  MemberName: string;
}

interface AnalyticsSummary {
  totalTransactions: number;
  totalTopupAmount: number;
  totalPoints: number;
  totalPointValue: number;
}

@Component({
  selector: 'app-brand-details',
  imports: [
    TabComponent,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    InputComponent,
    BadgeComponent,
    NgSwitch,
    NgSwitchCase,
    FormsModule,
    ReactiveFormsModule,
    SelectComponent,
    NgIf,
    CommonModule,
    TableComponent,
    TableCellDirective,
    ModalComponent,
    LoadingComponent,
  ],
  templateUrl: './brand-details.component.html',
  styleUrl: './brand-details.component.css',
})
export class BrandDetailsComponent implements OnInit {
  pointsratio: any;
  cellTemplates: any;
  detailsImageBase64: string = '';
  detailsImageName: string = '';
  isLoadingMemberLevel: boolean = false;
  isEditMode: boolean = false;
  selectedMemberLevel: any = null;
  isSavingMemberLevel: boolean = false;
  originalFormValue: any;

  constructor(
    private route: ActivatedRoute,
    private dataServices: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  private fb = inject(FormBuilder);
  brandId!: string;
  fromDate: any = new Date();
  toDate: any = new Date();
  minDate: any = new Date(2020, 0, 1);
  maxDate: any = new Date();
  transactionsLoaded: boolean = false;
  analytics: AnalyticsSummary = {
    totalTransactions: 0,
    totalTopupAmount: 0,
    totalPoints: 0,
    totalPointValue: 0,
  };
  transactionDataSource: Transaction[] = [];
  memberLevelByBrandDataSource = [];
  currentPage = 1;
  isModalOpen = false;
  topupCodeDatasource: SelectOption[] = [];
  loyaltyDatasource: SelectOption[] = [];
  redeemDatasource: SelectOption[] = [];

  // Tab properties
  currentView = 'details';
  viewTabs: TabItem[] = [
    { label: 'Brand Details', value: 'details' },
    { label: 'Transaction History', value: 'transaction' },
    { label: 'Member Level By Brand', value: 'memberLevel' },
  ];

  currentStatusOptions: SelectOption[] = [
    { label: 'Enable', value: 'Enable' },
    { label: 'Disable', value: 'Disable' },
  ];

  showPointsOptions: SelectOption[] = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No Brands ',
  };

  tableColumns: TableColumn[] = [
    { key: 'CardNo', label: 'Card No' },
    { key: 'MemberName', label: 'Member Name' },
    { key: 'PointDate', label: 'Date' },
    { key: 'PointTime', label: 'Time' },
    { key: 'PointValue', label: 'Value' },
    { key: 'Points', label: 'Points' },
  ];

  tableColumnsForBrand: TableColumn[] = [
    { key: 'memberlevelCode', label: 'Level' },
    { key: 'Description', label: 'Description' },
    { key: 'MinPoints', label: 'Min Points' },
    { key: 'MaxPoints', label: 'Max Points' },
    { key: 'LoyaltyCode', label: 'Loyalty Code' },
    { key: 'RedeemCode', label: 'Redeem Code' },
    { key: 'TopupCode', label: 'Topup Code' },
    { key: 'imagepath', label: 'Image', align:'center' },
    { key: 'actions', label: 'Actions', align: 'center' },
  ];

  brandDetailsForm!: FormGroup;
  memberLevelDetailsForm!: FormGroup;

  private toSelectOptions(list: { Code: string }[] = []): SelectOption[] {
    return list.map((item) => ({
      value: item.Code,
      label: item.Code,
    }));
  }

  ngOnInit(): void {
    this.brandId = this.route.snapshot.paramMap.get('id') as string;
    this.loadBrandDetails(this.brandId);
    this.brandDetailsForm = this.fb.group({
      brand: [''],
      description: [''],
      showPoint: [''],
      currentStatus: ['Enable'],
      backgroundColor: [''],
      conversionFactor: [''],
      imagePath: [''],
    });

    this.memberLevelDetailsForm = this.fb.group({
      Description: [''],
      LoyaltyCode: [''],
      MaxPoints: [''],
      MinPoints: [''],
      NextLevelLabel: [''],
      RedeemCode: [''],
      TopupCode: [''],
      brand_id: [this.brandId],
      memberlevelCode: [''],
      imagepath: [''],
    });

    this.dataServices
      .getMethod(
        `api/v1/member/BrandMemberdefaults/dropdrowlist/${this.brandId}`
      )
      .subscribe((data: any) => {
        this.topupCodeDatasource = this.toSelectOptions(data.data.topup_plan);
        this.loyaltyDatasource = this.toSelectOptions(data.data.loyaltyplan);
        this.redeemDatasource = this.toSelectOptions(data.data.redeemplan);
      });

    const today = new Date();
    const oneEightyDaysAgo = new Date(
      today.getTime() - 180 * 24 * 60 * 60 * 1000
    );
    this.toDate = today;
    this.fromDate = oneEightyDaysAgo;
    this.loadTransactions();
    this.loadBrandMemberLevel(this.brandId);
  }

  get breadcrumbItems(): BreadcrumbItem[] {
    return [
      { label: 'Brand', route: 'crafted/retail/Brand' },
      { label: this.brandId || 'Brand Id' },
    ];
  }

  onRowClick(event: any) {}

  loadBrandDetails(brandId: string): void {
    this.dataServices.getMethod(`api/v1/member/getBrand/${brandId}`).subscribe({
      next: (data: any) => {
        if (data.data.pointsratio) {
          data.data.pointsratio = 1 / data.data.pointsratio;
        }

        this.pointsratio = data.data.pointsratio;

        this.brandDetailsForm.setValue({
          brand: data.data.name,
          description: data.data.description,
          showPoint: data.data.showpoint,
          currentStatus: data.data.status,
          backgroundColor: data.data.backgroundcolor,
          conversionFactor: this.pointsratio,
          imagePath: data.data.imagepath,
        });
      },
      error: (error: HttpHeaderResponse) => {},
    });
  }

  onDetailsImageSelected(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    
    // Validate file type
    const fileType = file.type.split('/').pop()?.toLowerCase();
    if (fileType !== 'jpeg' && fileType !== 'jpg' && fileType !== 'png') {
      this.notificationService.showError(
        'Invalid File',
        'Please select a valid image file (jpg, jpeg, or png)'
      );
      event.target.value = '';
      return;
    }

    // Validate file size (1MB = 1024000 bytes)
    if (file.size > 1024000) {
      this.notificationService.showError(
        'File Too Large',
        'Maximum upload size is 1 MB only'
      );
      event.target.value = '';
      return;
    }

    // Convert to base64 and store temporarily
    this.dataServices
      .getBase64(file)
      .then((base64imageData: any) => {
        const Base64Data = base64imageData.replace(
          /^data:image\/[a-z]+;base64,/,
          ''
        );
        this.detailsImageBase64 = Base64Data;
        this.detailsImageName = file.name;
        
        // Update form control to show preview
        this.memberLevelDetailsForm.patchValue({
          imagepath: base64imageData
        });
        
        this.notificationService.showSuccess(
          'Image Selected',
          'Image selected. It will be uploaded when you save.'
        );
        event.target.value = '';
      })
      .catch((error) => {
        this.notificationService.showError(
          'Error',
          'Error reading image file'
        );
        event.target.value = '';
      });
  }

  uploadDetailsImageToServer(memberlevelCode: number) {
    if (!this.detailsImageBase64 || !this.detailsImageName) {
      // No image to upload, just reload the list
      this.loadBrandMemberLevel(this.brandId);
      return;
    }

    this.dataServices
      .putMethod(
        `api/v1/member/BrandMemberLevel/upload/${this.brandId}/${memberlevelCode}`,
        JSON.stringify({
          column: 'imagepath',
          filename: this.detailsImageName,
          image: this.detailsImageBase64,
        })
      )
      .subscribe(
        (data: any) => {
          this.notificationService.showSuccess(
            'Success',
            data.message || 'Image uploaded successfully'
          );
          
          // Clear temporary storage
          this.detailsImageBase64 = '';
          this.detailsImageName = '';
          
          // Refresh the member level list
          this.loadBrandMemberLevel(this.brandId);
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError(
            'Upload Failed',
            error.error?.message || 'Error uploading image'
          );
          
          // Still reload the list to show updated data
          this.loadBrandMemberLevel(this.brandId);
        }
      );
  }

  deleteDetailsImage() {
    this.memberLevelDetailsForm.patchValue({
      imagepath: ''
    });
    this.detailsImageBase64 = '';
    this.detailsImageName = '';
    this.notificationService.showSuccess('Image Removed', 'Image removed from form');
  }

  getImageSource(imagepath: string): string {
    if (!imagepath) {
      return '';
    }

    // If it's already a complete URL, return as is
    if (imagepath.startsWith('http://') || imagepath.startsWith('https://')) {
      return imagepath;
    }

    // If it has base64 prefix, return as is
    if (imagepath.startsWith('data:image/')) {
      return imagepath;
    }

    // Otherwise treat it as base64 data without prefix
    return 'data:image/png;base64,' + imagepath;
  }

  loadBrandMemberLevel(brandId: string): void {
    this.isLoadingMemberLevel = true;
    this.dataServices
      .getMethod('api/v1/loyalty/brandmemberlevels/details/' + brandId)
      .subscribe({
        next: (getdata: any) => {
          this.memberLevelByBrandDataSource = getdata.data;
          this.isLoadingMemberLevel = false;
        },
        error: (error: HttpErrorResponse) => {
          this.isLoadingMemberLevel = false;
          this.notificationService.showError(
            'Load Failed',
            error.error?.message || 'Error loading member levels'
          );
        },
      });
  }

  saveBrandDetails() {
    const savedRatio = 1 / this.pointsratio;
    this.dataServices
      .putMethod(
        `api/v1/member/updateBrand/${this.brandId}`,
        JSON.stringify({
          name: this.brandDetailsForm.value.brand,
          description: this.brandDetailsForm.value.description,
          showpoint: this.brandDetailsForm.value.showPoint,
          status: this.brandDetailsForm.value.currentStatus,
          backgroundcolor: this.brandDetailsForm.value.backgroundColor,
          pointsratio: savedRatio,
        })
      )
      .subscribe(
        (updateData: any) => {
          this.notificationService.showSuccess('Updated', updateData.message);
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError(
            'Error',
            error.error?.message || 'Error updating brand'
          );
        }
      );
  }

  openEditMemberLevel(data: any) {
  this.isEditMode = true;

  this.memberLevelDetailsForm.patchValue(data);

  // Store original values for comparison
  this.originalFormValue = {
    ...this.memberLevelDetailsForm.value
  };

  this.isModalOpen = true;
}


saveMemberLevel() {
  if (this.isSavingMemberLevel) {
    return;
  }

  if (this.memberLevelDetailsForm.invalid) {
    this.memberLevelDetailsForm.markAllAsTouched();
    return;
  }

  const formData = this.memberLevelDetailsForm.value;
  this.isSavingMemberLevel = true;

  let request$;

  if (this.isEditMode) {
    const changedColumn = Object.keys(formData).find(
      key => formData[key] !== this.originalFormValue[key]
    );

    if (!changedColumn) {
      this.isSavingMemberLevel = false;
      this.notificationService.showError('No Changes', 'No field was modified');
      return;
    }

    const updatePayload = {
      column: changedColumn,
      value: formData[changedColumn]
    };

    request$ = this.dataServices.putMethod(
      `api/v1/loyalty/brandmemberlevels/${formData.memberlevelCode}/${this.brandId}`,
      JSON.stringify(updatePayload)
    );
  }

  /* =========================
     CREATE → Full payload
     ========================= */
  else {
    const createPayload = {
      brand_id: this.brandId,
      memberlevelCode: Number(formData.memberlevelCode),
      Description: formData.Description,
      MinPoints: Number(formData.MinPoints),
      MaxPoints: Number(formData.MaxPoints),
      NextLevelLabel: formData.NextLevelLabel || '',
      LoyaltyCode: formData.LoyaltyCode || '',
      RedeemCode: formData.RedeemCode || '',
      TopupCode: formData.TopupCode || ''
    };

    request$ = this.dataServices.postMethod(
      'api/v1/loyalty/brandmemberlevels',
      JSON.stringify(createPayload)
    );
  }

  request$.subscribe(
    (response: any) => {
      this.notificationService.showSuccess(
        this.isEditMode ? 'Updated' : 'Created',
        response.message ||
          `Member level ${this.isEditMode ? 'updated' : 'created'} successfully`
      );

      if (!this.isEditMode) {
        this.uploadDetailsImageToServer(formData.memberlevelCode);
      }

      this.isSavingMemberLevel = false;
      this.closeModal();
      this.resetForm();
    },
    (error: HttpErrorResponse) => {
      this.isSavingMemberLevel = false;
      this.notificationService.showError(
        'Error',
        error.error?.message ||
          `Error ${this.isEditMode ? 'updating' : 'creating'} member level`
      );
    }
  );
}



  onViewChange(view: string): void {
    this.currentView = view;
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadTransactions(): void {
    const fromDateStr = this.formatDateForAPI(this.fromDate);
    const toDateStr = this.formatDateForAPI(this.toDate);
    const apiUrl = `api/v1/member/BrandLeadgerTransactions/${fromDateStr}/${toDateStr}/${this.brandId}`;

    this.dataServices.getMethod(apiUrl).subscribe({
      next: (getData: any) => {
        if (getData && getData.data) {
          this.transactionDataSource = getData.data;
          this.calculateAnalytics();
        }
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
      },
    });
  }

  calculateAnalytics(): void {
    this.analytics.totalTransactions = this.transactionDataSource.length;
    this.analytics.totalTopupAmount = this.transactionDataSource.reduce(
      (sum, txn) => sum + parseFloat(txn.TopupAmount || '0'),
      0
    );
    this.analytics.totalPoints = this.transactionDataSource.reduce(
      (sum, txn) => sum + parseFloat(txn.Points || '0'),
      0
    );
    this.analytics.totalPointValue = this.transactionDataSource.reduce(
      (sum, txn) => sum + parseFloat(txn.PointValue || '0'),
      0
    );
  }

  createNewBrand() {}

  createNewLevel() {
    this.isEditMode = false;
    this.selectedMemberLevel = null;
    this.resetForm();
    this.openModal();
  }

  resetForm() {
    this.memberLevelDetailsForm.reset({
      brand_id: this.brandId,
      Description: '',
      LoyaltyCode: '',
      MaxPoints: '',
      MinPoints: '',
      NextLevelLabel: '',
      RedeemCode: '',
      TopupCode: '',
      memberlevelCode: '',
      imagepath: '',
    });
    this.detailsImageBase64 = '';
    this.detailsImageName = '';
  }

  onFromDateChanged(e: any): void {
    if (e.value) {
      this.fromDate = e.value;
      this.validateAndLoadTransactions();
    }
  }

  onToDateChanged(e: any): void {
    if (e.value) {
      this.toDate = e.value;
      this.validateAndLoadTransactions();
    }
  }

  validateAndLoadTransactions(): void {
    if (this.fromDate && this.toDate) {
      if (this.fromDate > this.toDate) {
        return;
      }
      this.loadTransactions();
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onEdit(row: any) {
    this.isEditMode = true;
    this.selectedMemberLevel = row;
    
    // Clear any previous image data
    this.detailsImageBase64 = '';
    this.detailsImageName = '';
    
    // Populate form with row data
    this.memberLevelDetailsForm.patchValue({
      brand_id: row.brand_id,
      memberlevelCode: row.memberlevelCode,
      Description: row.Description,
      MinPoints: row.MinPoints,
      MaxPoints: row.MaxPoints,
      NextLevelLabel: row.NextLevelLabel,
      LoyaltyCode: row.LoyaltyCode,
      RedeemCode: row.RedeemCode,
      TopupCode: row.TopupCode,
      imagepath: row.imagepath,
    });
    
    this.openModal();
  }

  onDelete(row: any) {
    // console.log(row.brand_id)
  const title =row.brand_id;
  const message = `${row.memberlevelCode} - ${row.Description}`;

  this.confirmationService
    .confirmDelete(title, message)
    .then((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.dataServices
        .deleteMethod(
          `api/v1/loyalty/brandmemberlevels/${row.memberlevelCode}/${this.brandId}`
        )
        .subscribe(
          (response: any) => {
            this.notificationService.showSuccess(
              'Deleted',
              response.message || 'Member level deleted successfully'
            );

            this.loadBrandMemberLevel(this.brandId);
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


  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/no-image.png';
  }

  onBrandImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/no-image.png';
  }

  getBrandImageSource(imagepath: string): string {
    if (!imagepath) {
      return '';
    }

    if (imagepath.startsWith('http://') || imagepath.startsWith('https://')) {
      return imagepath;
    }

    if (imagepath.startsWith('data:image/')) {
      return imagepath;
    }

    return 'data:image/png;base64,' + imagepath;
  }

  onRowClick2(row: any) {
    // Handle row click if needed
  }
}