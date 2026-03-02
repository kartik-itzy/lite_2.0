import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CardComponent } from '../../../components/ui/card/card.component';
import {
  TabComponent,
  TabItem,
} from '../../../components/ui/tab/tab.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BreadcrumbItem } from '../../../components/ui/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { DataService } from '../../../data.service';
import { HttpErrorResponse, HttpHeaderResponse } from '@angular/common/http';
import {
  TableComponent,
  TableConfig,
  TableColumn,
} from '../../../components/ui/table/table.component';
import {
  SelectComponent,
  SelectOption,
} from '../../../components/ui/select/select.component';
import { SwitchComponent } from '../../../components/ui/switch/switch.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { ColorInputComponent } from '../../../components/ui/color-input/color-input.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NotificationService } from '../../../shared/services/notification.service';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { Buffer } from 'buffer';
import * as pdfjsLib from 'pdfjs-dist';

// Point worker to the bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';

@Component({
  selector: 'app-customer-details',
  imports: [
    CardComponent,
    TabComponent,
    ButtonComponent,
    CommonModule,
    NgIf,
    TableComponent,
    SelectComponent,
    SwitchComponent,
    InputComponent,
    ColorInputComponent,
    ReactiveFormsModule,
    FormsModule,
    ModalComponent,
    InputComponent,
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css',
})
export class CustomerDetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
  ) {
    this.detailsForm = this.fb.group({
      address: [''],
      city: [''],
      zipCode: [''],
      countrycode: [''],
      state: [''],
      phone: [''],
      website: [''],
      fax: [''],
      adminemail: [''],
      use_cash_card: [''],
      OTPmode: [''],
      SupportEmail: [''],
      SMSSenderName: [''],
    });

    this.basicConfigurationForm = this.fb.group({
      Subdomain: [''],
      LineLIFFID: [''],
      applicationurl: [''],
      Loginmethod: [''],
      childrenDOB: [false],
      ManualMember: [false],
      BrandManualMember: [false],
      Calculate_Level_By: [''],
      DefaultLanguage: [''],
      CardAddMessage: [''],
      privacydoclink: [''],
      pdpadoclink: [''],
    });
  }

  tennantId!: string;
  color = '#543EA3';
  customerDetails: any;
  usersDataSource: any;

  // PDF popup state
  PDFpopupVisible = false;
  uploadType: 'privacyDoc' | 'pdpaDoc' = 'privacyDoc';
  pdfName = '';
  pdfFileData: any = [];
  pdfContent = '';   // privacy doc URL
  pdfContent2 = ''; // pdpa doc URL

  // PDF preview modal state
  pdfPreviewVisible = false;
  pdfPreviewUrl = '';
  pdfIsLoading = false;
  pdfTotalPages = 0;
  pdfCurrentPage = 1;
  private pdfDoc: any = null;

  @ViewChild('pdfCanvas') pdfCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Confirm delete modal state
  confirmDeleteVisible = false;
  pendingDeleteType: 'privacyDoc' | 'pdpaDoc' | null = null;

  // Map from form control name -> API column name (detailsForm)
  private fieldColumnMap: Record<string, string> = {
    address: 'address',
    city: 'city',
    zipCode: 'zipCode',
    countrycode: 'countrycode',
    state: 'state',
    phone: 'phone',
    website: 'website',
    fax: 'fax',
    adminemail: 'adminemail',
    use_cash_card: 'use_cash_card',
    OTPmode: 'OTPmode',
    SupportEmail: 'SupportEmail',
    SMSSenderName: 'SMSSenderName',
  };

  // Map from form control name -> API column name (basicConfigurationForm)
  private appFieldColumnMap: Record<string, string> = {
    Subdomain: 'Subdomain',
    LineLIFFID: 'LineLIFFID',
    applicationurl: 'applicationurl',
    Loginmethod: 'Loginmethod',
    childrenDOB: 'childrenDOB',
    ManualMember: 'ManualMember',
    BrandManualMember: 'BrandManualMember',
    Calculate_Level_By: 'Calculate_Level_By',
    DefaultLanguage: 'DefaultLanguage',
    CardAddMessage: 'CardAddMessage',
  };

  detailsForm!: FormGroup;
  basicConfigurationForm!: FormGroup;

  yesNoOptions: SelectOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];

  otpModeOptions: SelectOption[] = [
    { value: 'SMS', label: 'SMS' },
    { value: 'EMAIL', label: 'EMAIL' },
  ];

  loginMethodOptions: SelectOption[] = [
    { value: 'Email', label: 'Email' },
    { value: 'Line', label: 'Line' },
  ];

  defaultLanguageOptions: SelectOption[] = [
    { value: 'en', label: 'English' },
    { value: 'th', label: 'Thai' },
  ];

  calculateLevelByOptions: SelectOption[] = [
    { value: 'TOPUP', label: 'TOPUP' },
    { value: 'POINT', label: 'POINT' },
  ];

  currentView = 'details';

  tableConfig: TableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No Brands ',
  };

  viewTabs: TabItem[] = [
    { label: 'Details', value: 'details' },
    { label: 'App', value: 'app' },
    { label: 'Settings', value: 'settings' },
    { label: 'Brand', value: 'brand' },
    { label: 'Users', value: 'users' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'usertype', label: 'User Type' },
    { key: 'userstatus', label: 'Status' },
    { key: 'LastModifiedOn', label: 'Last Updated', transform: 'date' },
  ];

  get breadcrumbItems(): BreadcrumbItem[] {
    return [
      { label: 'Customers', route: 'crafted/retail/customers' },
      { label: this.tennantId || 'Tennant Id' },
    ];
  }

  ngOnInit(): void {
    this.tennantId = this.route.snapshot.paramMap.get('id') as string;
    this.getUsersByTennantId();
    this.getCustomerDetails();
  }

  getCustomerDetails() {
    this.dataService
      .getMethod(`api/v1/customers/${this.tennantId}`)
      .subscribe((getData: any) => {
        const customer = getData.data.customer[0];
        this.customerDetails = customer;
        console.log(customer);

        // Store PDF links separately for display & delete
        this.pdfContent = customer.privacydoclink ?? '';
        this.pdfContent2 = customer.pdpadoclink ?? '';

        // Patch detailsForm without emitting so valueChanges doesn't fire on load
        this.detailsForm.patchValue({
          address: customer.address ?? '',
          city: customer.city ?? '',
          zipCode: customer.zipCode ?? '',
          countrycode: customer.countrycode ?? '',
          state: customer.state ?? '',
          phone: customer.phone ?? '',
          website: customer.website ?? '',
          fax: customer.fax ?? '',
          adminemail: customer.adminemail ?? '',
          use_cash_card: customer.use_cash_card ?? '',
          OTPmode: customer.OTPmode ?? '',
          SupportEmail: customer.SupportEmail ?? '',
          SMSSenderName: customer.SMSSenderName ?? '',
        }, { emitEvent: false });

        this.basicConfigurationForm.patchValue({
          Subdomain: customer.Subdomain ?? '',
          LineLIFFID: customer.LineLIFFID ?? '',
          applicationurl: customer.applicationurl ?? '',
          Loginmethod: customer.Loginmethod ?? '',
          childrenDOB: customer.childrenDOB ?? false,
          ManualMember: customer.ManualMember ?? false,
          BrandManualMember: customer.BrandManualMember ?? false,
          Calculate_Level_By: customer.Calculate_Level_By ?? '',
          DefaultLanguage: customer.DefaultLanguage ?? '',
          CardAddMessage: customer.CardAddMessage ?? '',
          privacydoclink: customer.privacydoclink ?? '',
          pdpadoclink: customer.pdpadoclink ?? '',
        }, { emitEvent: false });

        // Subscribe to each control individually after patching
        this.subscribeToFieldChanges();
        this.subscribeToAppFieldChanges();
      });
  }

  // ─── Details form: text inputs save on blur (debounce), selects save on change ───

  private subscribeToFieldChanges(): void {
    // Only subscribe to select controls (immediate save on change)
    const selectControls = ['use_cash_card', 'OTPmode'];
    selectControls.forEach((controlName) => {
      const control = this.detailsForm.get(controlName);
      if (!control) return;
      control.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
        this.saveField(this.fieldColumnMap[controlName], value, 'details');
      });
    });
    // Text inputs are handled via onFieldBlur
  }

  onFieldBlur(controlName: string): void {
    const control = this.detailsForm.get(controlName);
    if (!control) return;
    const column = this.fieldColumnMap[controlName];
    this.saveField(column, control.value, 'details');
  }

  // ─── App (basicConfiguration) form ───

  private subscribeToAppFieldChanges(): void {
    // Select controls — save immediately on change
    const selectControls = ['Loginmethod', 'Calculate_Level_By', 'DefaultLanguage'];
    selectControls.forEach((controlName) => {
      const control = this.basicConfigurationForm.get(controlName);
      if (!control) return;
      control.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
        this.saveField(this.appFieldColumnMap[controlName], value, 'app');
      });
    });

    // Toggle (boolean) controls — save immediately on change
    const toggleControls = ['childrenDOB', 'ManualMember', 'BrandManualMember'];
    toggleControls.forEach((controlName) => {
      const control = this.basicConfigurationForm.get(controlName);
      if (!control) return;
      control.valueChanges.pipe(distinctUntilChanged()).subscribe((value) => {
        this.saveField(this.appFieldColumnMap[controlName], value, 'app');
      });
    });

    // Text inputs are handled via onAppFieldBlur
  }

  onAppFieldBlur(controlName: string): void {
    const control = this.basicConfigurationForm.get(controlName);
    if (!control) return;
    const column = this.appFieldColumnMap[controlName];
    if (column) {
      this.saveField(column, control.value, 'app');
    }
  }

  private saveField(column: string, value: any, formType: string): void {
    const payload = { column, value: value ?? '' };
    this.dataService
      .putMethod(`api/v1/customers/edit/${this.tennantId}`, payload)
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Saved', `${column} updated successfully.`);
        },
        error: (err: any) => {
          console.error(`Failed to update field "${column}":`, err);
          this.notificationService.showError('Save Failed', `Could not update ${column}. Please try again.`);
        },
      });
  }

  // ─── PDF Upload ───

  openPDFUpload(type: 'privacyDoc' | 'pdpaDoc'): void {
    this.uploadType = type;
    this.PDFpopupVisible = true;
  }

  closePDFPopup(): void {
    this.PDFpopupVisible = false;
    this.pdfName = '';
    this.pdfFileData = [];
  }

  PDFprocessFile(pdfInput: any) {
    const files = pdfInput.files;
    const file = files[0];
    this.pdfName = files[0].name;

    const t = file.type.split('/').pop().toLowerCase();
    if (t !== 'pdf') {
      this.notificationService.showError('Invalid File', 'Please select a valid PDF file.');
      return;
    }

    this.dataService.getBase64(pdfInput.files[0]).then((pdfData: any) => {
      const Base64Data = pdfData.replace(/^data:application\/[a-z]+;base64,/, '');
      this.pdfFileData = Base64Data;

      this.dataService
        .postMethod(
          'api/v1/customers/upload',
          JSON.stringify({
            column: this.uploadType === 'privacyDoc' ? 'privacydoclink' : 'pdpadoclink',
            filename: this.pdfName,
            image: this.pdfFileData,
          })
        )
        .subscribe((data: any) => {
          if (data.status === 200) {
            this.notificationService.showSuccess('Uploaded', 'PDF uploaded successfully.');
            this.PDFpopupVisible = false;
            this.pdfFileData = [];
            this.getCustomerDetails();
          } else {
            this.notificationService.showError('Upload Failed', 'Error while uploading PDF file.');
          }
        });
    });
  }

  deletePDF(event: any, docType: 'privacyDoc' | 'pdpaDoc') {
    this.pendingDeleteType = docType;
    this.confirmDeleteVisible = true;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteType) return;

    const docType = this.pendingDeleteType;
    const typeUrl = docType === 'pdpaDoc' ? 'pdpadoclink' : 'privacydoclink';
    const filePath = docType === 'pdpaDoc' ? this.pdfContent2 : this.pdfContent;

    this.confirmDeleteVisible = false;
    this.pendingDeleteType = null;

    const data: any = filePath.match(/\/([^\/]+)$/);
    const base64: string = Buffer.from(data[1], 'utf8').toString('base64');

    this.dataService
      .deleteMethod(`api/v1/customers/images/${typeUrl}/` + base64)
      .subscribe(
        (res: any) => {
          this.notificationService.showSuccess('Deleted', 'PDF file deleted successfully.');
          this.getCustomerDetails();
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', error.error.message);
        }
      );
  }

  cancelDelete(): void {
    this.confirmDeleteVisible = false;
    this.pendingDeleteType = null;
  }

  // ─── PDF Preview ───

  openPDFPreview(docType: 'privacyDoc' | 'pdpaDoc'): void {
    const url = docType === 'pdpaDoc' ? this.pdfContent2 : this.pdfContent;
    if (!url) return;
    this.pdfPreviewUrl = url;
    this.pdfPreviewVisible = true;
    this.pdfIsLoading = true;
    this.pdfTotalPages = 0;
    this.pdfCurrentPage = 1;
    this.pdfDoc = null;

    // Load after modal is rendered
    setTimeout(() => this.loadPDF(url), 50);
  }

  private loadPDF(url: string): void {
    pdfjsLib.getDocument({ url, withCredentials: false }).promise
      .then((doc: any) => {
        this.pdfDoc = doc;
        this.pdfTotalPages = doc.numPages;
        return this.renderPage(1);
      })
      .catch(() => {
        this.pdfIsLoading = false;
        this.notificationService.showError('Preview Failed', 'Could not load the PDF document.');
      });
  }

  private renderPage(pageNum: number): void {
    if (!this.pdfDoc || !this.pdfCanvasRef) return;

    this.pdfDoc.getPage(pageNum).then((page: any) => {
      const canvas = this.pdfCanvasRef.nativeElement;
      const context = canvas.getContext('2d')!;
      const viewport = page.getViewport({ scale: 1.5 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      page.render({ canvasContext: context, viewport }).promise.then(() => {
        this.pdfIsLoading = false;
        this.pdfCurrentPage = pageNum;
      });
    });
  }

  pdfNextPage(): void {
    if (this.pdfCurrentPage < this.pdfTotalPages) {
      this.pdfIsLoading = true;
      this.renderPage(this.pdfCurrentPage + 1);
    }
  }

  pdfPrevPage(): void {
    if (this.pdfCurrentPage > 1) {
      this.pdfIsLoading = true;
      this.renderPage(this.pdfCurrentPage - 1);
    }
  }

  closePDFPreview(): void {
    this.pdfPreviewVisible = false;
    this.pdfPreviewUrl = '';
    this.pdfDoc = null;
    this.pdfIsLoading = false;
    this.pdfTotalPages = 0;
    this.pdfCurrentPage = 1;
  }

  // ─── Misc ───

  getUsersByTennantId() {
    this.dataService
      .getMethod(`api/v1/customers/bytenantid/${this.tennantId}`)
      .subscribe({
        next: (data: any) => {
          this.usersDataSource = data.data;
        },
        error: (error: HttpHeaderResponse) => {
          this.usersDataSource = [];
        },
      });
  }

  onRowClick(event: any) {}

  onViewChange(view: string): void {
    this.currentView = view;
  }

  backToListScreen() {
    this.router.navigate(['/crafted/retail/customers']);
  }
}