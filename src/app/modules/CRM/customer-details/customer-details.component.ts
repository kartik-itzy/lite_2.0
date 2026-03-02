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

    // Settings tab: all color fields + promo text fields + feature visibility toggles
    this.settingsForm = this.fb.group({
      // Theme Colors
      appprimarycolor: [''],
      appsecondarycolor: [''],
      apptextcolor: [''],
      appscaffoldcolor: [''],
      // Splash Screen
      loadingScreen_text_color: [''],
      // Footer
      footer_bg_color: [''],
      footer_fg_color: [''],
      // Buttons
      addCard_bg_color: [''],
      addCard_icon_color: [''],
      topup_bg_color: [''],
      topup_icon_color: [''],
      qr_bg_color: [''],
      qr_icon_color: [''],
      // Progress
      progress_text_color: [''],
      progress_bar_color: [''],
      progress_icon_bg: [''],
      // Promo
      promo_text: [''],
      promo_subtext: [''],
      promo_button_text: [''],
      promo_text_color: [''],
      promo_button_text_color: [''],
      promo_button_bg_color: [''],
      // Feature Visibility
      AllowRecharge: [false],
      AllowAddCard: [false],
      childrenEmail: [false],
      childrenPhone: [false],
      ShowHomeCardType: [false],
      ShowHomeButtons: [false],
      ShowHomePoints: [false],
      AllowAddFamilyMem: [false],
      ShowCardOption: [false],
      ShowTutorial: [false],
      ShowGender: [false],
      ShowDOB: [false],
      BalanceExpiry: [false],
      brand: [''],
      ConversionWay:[]
    });
  }

  tennantId!: string;
  customerDetails: any;
  usersDataSource: any;

  // Image values (stored separately, not in form — they are URLs)
  progressIconValue = '';
  promoBannerValue = '';
  loadingScreenImageValue = '';
  imageDataURL: any = []; // apphomebannerpath

  // Hidden file inputs references
  @ViewChild('loadingImageInput') loadingImageInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('progressIconInput') progressIconInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('promoBannerInput') promoBannerInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('homeBannerInput') homeBannerInputRef!: ElementRef<HTMLInputElement>;

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

  // Color fields that need 0xFF conversion before saving
  private colorFields = new Set([
    'appprimarycolor', 'appsecondarycolor', 'apptextcolor', 'appscaffoldcolor',
    'loadingScreen_text_color',
    'footer_bg_color', 'footer_fg_color',
    'addCard_bg_color', 'addCard_icon_color',
    'topup_bg_color', 'topup_icon_color',
    'qr_bg_color', 'qr_icon_color',
    'progress_text_color', 'progress_bar_color', 'progress_icon_bg',
    'promo_text_color', 'promo_button_text_color', 'promo_button_bg_color',
  ]);

  // Feature visibility fields that use Yes/No (not boolean)
  private yesNoVisibilityFields = new Set([
    'AllowRecharge', 'AllowAddCard', 'childrenEmail', 'childrenPhone',
    'ShowHomeCardType', 'ShowHomeButtons', 'ShowHomePoints', 'AllowAddFamilyMem',
    'ShowCardOption', 'ShowTutorial', 'ShowGender', 'ShowDOB', 'BalanceExpiry',
  ]);

  detailsForm!: FormGroup;
  basicConfigurationForm!: FormGroup;
  settingsForm!: FormGroup;


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

  conversionOptions: SelectOption [] = [
    {value:'Manual', label:'Manual'},
    {value:'Auto', label:'Auto'},
  ]

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

        // Store image URLs
        this.progressIconValue = customer.progress_icon ?? '';
        this.promoBannerValue = customer.promo_banner ?? '';
        this.loadingScreenImageValue = customer.loadingScreen_image ?? '';
        this.imageDataURL = customer.apphomebannerpath ?? [];

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
          childrenDOB: customer.childrenDOB === 'Yes',
          ManualMember: customer.ManualMember === 'Yes',
          BrandManualMember: customer.BrandManualMember === 'Yes',
          Calculate_Level_By: customer.Calculate_Level_By ?? '',
          DefaultLanguage: customer.DefaultLanguage ?? '',
          CardAddMessage: customer.CardAddMessage ?? '',
          privacydoclink: customer.privacydoclink ?? '',
          pdpadoclink: customer.pdpadoclink ?? '',
        }, { emitEvent: false });

        // Helper: convert "0xFFrrggbb" -> "#rrggbb"
        const toHex = (v: string) => v ? v.replace('0xFF', '#') : '';

        this.settingsForm.patchValue({
          // Theme Colors
          appprimarycolor: toHex(customer.appprimarycolor),
          appsecondarycolor: toHex(customer.appsecondarycolor),
          apptextcolor: toHex(customer.apptextcolor),
          appscaffoldcolor: toHex(customer.appscaffoldcolor),
          // Splash Screen
          loadingScreen_text_color: toHex(customer.loadingScreen_text_color),
          // Footer
          footer_bg_color: toHex(customer.footer_bg_color),
          footer_fg_color: toHex(customer.footer_fg_color),
          // Buttons
          addCard_bg_color: toHex(customer.addCard_bg_color),
          addCard_icon_color: toHex(customer.addCard_icon_color),
          topup_bg_color: toHex(customer.topup_bg_color),
          topup_icon_color: toHex(customer.topup_icon_color),
          qr_bg_color: toHex(customer.qr_bg_color),
          qr_icon_color: toHex(customer.qr_icon_color),
          // Progress
          progress_text_color: toHex(customer.progress_text_color),
          progress_bar_color: toHex(customer.progress_bar_color),
          progress_icon_bg: toHex(customer.progress_icon_bg),
          // Promo
          promo_text: customer.promo_text ?? '',
          promo_subtext: customer.promo_subtext ?? '',
          promo_button_text: customer.promo_button_text ?? '',
          promo_text_color: toHex(customer.promo_text_color),
          promo_button_text_color: toHex(customer.promo_button_text_color),
          promo_button_bg_color: toHex(customer.promo_button_bg_color),
          // Feature Visibility (stored as Yes/No in API)
          AllowRecharge: customer.AllowRecharge === 'Yes',
          AllowAddCard: customer.AllowAddCard === 'Yes',
          childrenEmail: customer.childrenEmail === 'Yes',
          childrenPhone: customer.childrenPhone === 'Yes',
          ShowHomeCardType: customer.ShowHomeCardType === 'Yes',
          ShowHomeButtons: customer.ShowHomeButtons === 'Yes',
          ShowHomePoints: customer.ShowHomePoints === 'Yes',
          AllowAddFamilyMem: customer.AllowAddFamilyMem === 'Yes',
          ShowCardOption: customer.ShowCardOption === 'Yes',
          ShowTutorial: customer.ShowTutorial === 'Yes',
          ShowGender: customer.ShowGender === 'Yes',
          ShowDOB: customer.ShowDOB === 'Yes',
          BalanceExpiry: customer.BalanceExpiry === 'Yes',
          brand: customer.brand === 'Yes',
          ConversionWay: customer.ConversionWay,
        }, { emitEvent: false });

        // Apply initial CSS variables from loaded data
        this.updateCSSVariables();

        // Subscribe to each control individually after patching
        this.subscribeToFieldChanges();
        this.subscribeToAppFieldChanges();
        this.subscribeToSettingsChanges();
      });
  }

  // ─── CSS Variable Update ───

  updateCSSVariables() {
    const f = this.settingsForm.value;
    const root = document.documentElement;

    root.style.setProperty('--appprimarycolor', f.appprimarycolor);
    root.style.setProperty('--appsecondarycolor', f.appsecondarycolor);
    root.style.setProperty('--apptextcolor', f.apptextcolor);
    root.style.setProperty('--appscaffoldcolor', f.appscaffoldcolor);
    root.style.setProperty('--loadingScreen_text_color', f.loadingScreen_text_color);
    root.style.setProperty('--footer_bg_color', f.footer_bg_color);
    root.style.setProperty('--footer_fg_color', f.footer_fg_color);
    root.style.setProperty('--addCard_bg_color', f.addCard_bg_color);
    root.style.setProperty('--addCard_icon_color', f.addCard_icon_color);
    root.style.setProperty('--topup_bg_color', f.topup_bg_color);
    root.style.setProperty('--topup_icon_color', f.topup_icon_color);
    root.style.setProperty('--qr_bg_color', f.qr_bg_color);
    root.style.setProperty('--qr_icon_color', f.qr_icon_color);
    root.style.setProperty('--progress_text_color', f.progress_text_color);
    root.style.setProperty('--progress_bar_color', f.progress_bar_color);
    root.style.setProperty('--progress_icon_bg', f.progress_icon_bg);
    root.style.setProperty('--promo_text_color', f.promo_text_color);
    root.style.setProperty('--promo_button_text_color', f.promo_button_text_color);
    root.style.setProperty('--promo_button_bg_color', f.promo_button_bg_color);
  }

  // ─── Settings form subscriptions ───

  private subscribeToSettingsChanges(): void {
    // Subscribe to each color field
    this.colorFields.forEach((fieldName) => {
      const control = this.settingsForm.get(fieldName);
      if (!control) return;
      control.valueChanges.pipe(distinctUntilChanged()).subscribe((newColor: string) => {
        if (!newColor) return;
        // Update CSS variable immediately
        document.documentElement.style.setProperty(`--${fieldName}`, newColor);
        // Save to backend (convert # -> 0xFF)
        const backendValue = newColor.replace('#', '0xFF');
        this.saveSettingsField(fieldName, backendValue);
      });
    });

    // Subscribe to promo text fields — save on blur via onSettingsFieldBlur
    // Subscribe to feature visibility toggles
    this.yesNoVisibilityFields.forEach((fieldName) => {
      const control = this.settingsForm.get(fieldName);
      if (!control) return;
      control.valueChanges.pipe(distinctUntilChanged()).subscribe((boolVal: boolean) => {
        const apiValue = boolVal ? 'Yes' : 'No';
        this.saveSettingsField(fieldName, apiValue);
      });
    });
  }

  onSettingsFieldBlur(fieldName: string): void {
    const control = this.settingsForm.get(fieldName);
    if (!control) return;
    this.saveSettingsField(fieldName, control.value);
  }

  private saveSettingsField(column: string, value: any): void {
    this.dataService
      .putMethod(`api/v1/customers/edit/${this.tennantId}`, JSON.stringify({ column, value }))
      .subscribe({
        next: () => { /* silent success */ },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Save Failed', `Could not update ${column}.`);
        },
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

  // ─── Image Upload ───

  triggerImageUpload(columnName: string): void {
    if (columnName === 'loadingScreen_image') {
      this.loadingImageInputRef?.nativeElement.click();
    } else if (columnName === 'progress_icon') {
      this.progressIconInputRef?.nativeElement.click();
    } else if (columnName === 'promo_banner') {
      this.promoBannerInputRef?.nativeElement.click();
    } else if (columnName === 'apphomebannerpath') {
      this.homeBannerInputRef?.nativeElement.click();
    }
  }

  async onImageFileSelected(event: Event, columnName: string): Promise<void> {
    const input = event.target as HTMLInputElement;
    await this.processImageFile(input, columnName);
  }

  cropImageToAspectRatio(file: File, aspectRatio: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx: any = canvas.getContext('2d');
          const width = img.width;
          const height = img.height;
          const currentAspectRatio = width / height;
          let sourceX = 0, sourceY = 0, sourceWidth = width, sourceHeight = height;
          if (currentAspectRatio > aspectRatio) {
            sourceWidth = height * aspectRatio;
            sourceX = (width - sourceWidth) / 2;
          } else if (currentAspectRatio < aspectRatio) {
            sourceHeight = width / aspectRatio;
            sourceY = (height - sourceHeight) / 2;
          }
          canvas.width = sourceWidth;
          canvas.height = sourceHeight;
          ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject('Error loading image');
        img.src = e.target.result;
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsDataURL(file);
    });
  }

  async processImageFile(imageInput: any, columnName: string): Promise<void> {
    let currentValue: string | null = null;
    if (columnName === 'progress_icon') {
      currentValue = this.progressIconValue;
    } else if (columnName === 'promo_banner') {
      currentValue = this.promoBannerValue;
    } else if (columnName === 'loadingScreen_image') {
      currentValue = this.loadingScreenImageValue;
    }

    if (currentValue && currentValue.length > 0) {
      this.notificationService.showError('Error', 'Please delete the existing image first.');
      return;
    }

    const files = imageInput.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const imageName = file.name;
    const fileType = file.type.split('/').pop()?.toLowerCase();

    if (!['png', 'jpg', 'jpeg'].includes(fileType || '')) {
      this.notificationService.showError('Invalid File', 'Please select a valid image file (PNG/JPG).');
      return;
    }
    if (file.size > 1024 * 5000) {
      const fileSize = (Number(file.size / 1000) / 1024).toFixed(2);
      this.notificationService.showError('File Too Large', `Max upload size is 5MB. ${file.name} Size: ${fileSize}MB`);
      return;
    }

    try {
      const { width, height } = this.getImageDimensions(columnName);
      const aspectRatio = width / height;
      const croppedBase64 = await this.cropImageToAspectRatio(file, aspectRatio);
      const Base64Data = croppedBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      const payload = { column: columnName, filename: imageName, image: Base64Data };

      this.dataService.postMethod('api/v1/customers/upload', JSON.stringify(payload))
        .subscribe((data: any) => {
          if (data.status === 200) {
            this.notificationService.showSuccess('Uploaded', 'Image uploaded successfully.');
            // Fetch updated S3 URL from DB
            this.dataService.getMethod(`api/v1/customers/${this.tennantId}`).subscribe((getData: any) => {
              const customer = getData.data.customer[0];
              if (columnName === 'progress_icon') this.progressIconValue = customer.progress_icon;
              if (columnName === 'promo_banner') this.promoBannerValue = customer.promo_banner;
              if (columnName === 'loadingScreen_image') this.loadingScreenImageValue = customer.loadingScreen_image;
              if (columnName === 'apphomebannerpath') this.imageDataURL = customer.apphomebannerpath;
            });
          } else {
            this.notificationService.showError('Upload Failed', 'Error while uploading image.');
          }
        });
    } catch (error) {
      this.notificationService.showError('Error', 'Error processing image.');
      console.error(error);
    }
  }

  private getImageDimensions(columnName: string): { width: number; height: number } {
    switch (columnName) {
      case 'promo_banner': return { width: 1200, height: 600 };
      case 'progress_icon': return { width: 100, height: 100 };
      case 'loadingScreen_image': return { width: 1320, height: 2868 };
      default: return { width: 1, height: 1 };
    }
  }

  deleteImage(columnName: string): void {
    let imageUrl: any = '';
    let apiColumn = '';

    switch (columnName) {
      case 'progress_icon':
        imageUrl = this.progressIconValue;
        apiColumn = 'progress_icon';
        this.progressIconValue = '';
        break;
      case 'promo_banner':
        imageUrl = this.promoBannerValue;
        apiColumn = 'promo_banner';
        this.promoBannerValue = '';
        break;
      case 'loadingScreen_image':
        imageUrl = this.loadingScreenImageValue;
        apiColumn = 'loadingScreen_image';
        this.loadingScreenImageValue = '';
        break;
      case 'apphomebannerpath':
        imageUrl = this.imageDataURL;
        apiColumn = 'apphomebannerpath';
        this.imageDataURL = [];
        break;
      default:
        return;
    }

    if (!imageUrl) {
      this.notificationService.showError('No Image', 'No image found to delete.');
      return;
    }

    const match = imageUrl.match(/\/([^\/]+)$/);
    if (!match) {
      this.notificationService.showError('Error', 'Invalid image path.');
      return;
    }

    const base64ImageName = Buffer.from(match[1], 'utf8').toString('base64');

    this.dataService
      .deleteMethod(`api/v1/customers/images/${apiColumn}/${base64ImageName}`)
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            this.notificationService.showSuccess('Deleted', 'Image deleted successfully.');
            this.getCustomerDetails();
          } else {
            this.notificationService.showError('Error', 'Error deleting image.');
          }
        },
        (error: HttpErrorResponse) => {
          this.notificationService.showError('Error', error.error?.message || 'Delete failed.');
        }
      );
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