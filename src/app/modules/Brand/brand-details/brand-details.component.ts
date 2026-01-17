import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import {
  TabComponent,
  TabItem,
} from '../../../components/ui/tab/tab.component';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../data.service';
import { HttpHeaderResponse } from '@angular/common/http';
import { PageHeaderComponent } from '../../../components/ui/page-header/page-header.component';
import { BreadcrumbItem } from '../../../components/ui/breadcrumb/breadcrumb.component';
import { CardComponent } from '../../../components/ui/card/card.component';
import { NgSwitch, NgSwitchCase, NgIf } from '@angular/common';
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
    TableComponent,
    TableCellDirective
  ],
  templateUrl: './brand-details.component.html',
  styleUrl: './brand-details.component.css',
})
export class BrandDetailsComponent implements OnInit {
  pointsratio: any;
  cellTemplates: any;
  constructor(
    private route: ActivatedRoute,
    private dataServices: DataService,
    private notificationService: NotificationService
  ) { }

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
    // showInfo: false
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
    { key: 'memberlevelCode', label: 'level' },
    { key: 'Description', label: 'Description' },
    { key: 'MinPoints', label: 'Min Points' },
    { key: 'MaxPoints', label: 'Max Points' },
    { key: 'LoyaltyCode', label: 'Loyalty Code' },
    { key: 'RedeemCode', label: 'Redeem Code' },
    { key: 'TopupCode', label: 'Topup Code' },
    { key: 'imagepath', label: 'Image', align: 'center', width: '120px' },
    { key: 'actions', label: 'Actions',align:'center'}
  ];

  brandDetailsForm!: FormGroup;

//   getCellTemplate(columnKey: string): TemplateRef<any> | null {
//   if (!this.cellTemplates) {
//     console.log('No cell templates found');
//     return null;
//   }
  
//   console.log('Looking for template:', columnKey);
//   console.log('Available templates:', this.cellTemplates.map((t:any) => t.columnKey));
  
//   const template = this.cellTemplates.find((t:any) => t.columnKey === columnKey);
//   console.log('Found template:', template ? 'YES' : 'NO');
//   return template ? template.template : null;
// }

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

  onRowClick(event: any) { }

  loadBrandDetails(brandId: string): void {
    this.dataServices.getMethod(`api/v1/member/getBrand/${brandId}`).subscribe({
      next: (data: any) => {
        // this.ItemDetails = data.data;

        // Convert DB value (0.5) → UI value (2)
        if (data.data.pointsratio) {
          data.data.pointsratio = 1 / data.data.pointsratio;
        }

        this.pointsratio = data.data.pointsratio;
        // this.brandDataSource = data?.data || [];
        // this.isLoading = false;
        this.brandDetailsForm.setValue({
          brand: data.data.name,
          description: data.data.description,
          showPoint: data.data.showpoint,
          currentStatus: data.data.status,
          backgroundColor: data.data.backgroundcolor,
          conversionFactor: this.pointsratio,
          imagePath: data.data.imagepath,
        });
        // console.log(this.brandDetailsForm.value);
      },
      error: (error: HttpHeaderResponse) => { },
    });
  }

  loadBrandMemberLevel(brandId: string): void {
    this.dataServices
      .getMethod('api/v1/loyalty/brandmemberlevels/details/' + brandId)
      .subscribe((getdata: any) => {

        console.log(getdata.data)
        this.memberLevelByBrandDataSource = getdata.data;

      })

  }

  saveBrandDetails() {
    const savedRatio = 1 / this.pointsratio;
    // convert 2 → 0.5

    console.log(this.brandDetailsForm.value);

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
        (error: any) => {
          this.notificationService.showError('Error', error.message);
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

    // const thisComponent = this;

    this.dataServices.getMethod(apiUrl).subscribe({
      next: (getData: any) => {
        if (getData && getData.data) {
          this.transactionDataSource = getData.data;
          this.calculateAnalytics();
          // this.toastr.success('Transactions loaded successfully', 'Success');
        }
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
        // thisComponent.toastr.error('Failed to load transactions', 'Error');
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

  createNewBrand() {

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
        // this.toastr.warning('From date cannot be greater than To date', 'Invalid Range');
        return;
      }
      this.loadTransactions();
    }
  }

  onPageChange(page: number) {
    // console.log('here', page);
    this.currentPage = page; // TableComponent will re-render
  }

  onEdit(row: any) {
  console.log('Edit clicked', row);
  // open popup / route / dx-popup
}

onDelete(row: any) {
  console.log('Delete clicked', row);
  // confirmation popup
}
onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'assets/images/no-image.png';
}

onRowClick2(row: any) {
  console.log('Row clicked', row);
}

}


