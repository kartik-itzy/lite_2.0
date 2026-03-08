import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface MemberDetail {
  MemberShipID: string;
  FirstName: string;
  LastName: string;
  email: string;
  RefPhoneNo: string;
  DOB: string | null;
  Address: string | null;
  City: string | null;
  ZipCode: string | null;
  MemberType: string | null;
  MembershipDate: string | null;
  SourceStore: string | null;
  CurrentStatus: string;
  Gender: string | null;
  PointsCollected: number;
  PointsSpent: number;
  TotalTopupAmount: number;
  maxnumberofcards: number | null;
  LoyaltyPlan: string | null;
  RedeemPlan: string | null;
  CustomerCode: string | null;
  TopupRedeemCode: string | null;
  CardType: string | null;
}

export interface CardHistoryRow {
  DATE: string;
  DEALNO: string;
  CARDNO: string;
  DealingType: string;
  REQCLASS: string;
  TransactionAmount: number;
  brand_id: string;
  Points: number;
  BALANCETOTAL: number;
  BALANCEPOINT: number;
  SHOPNAME: string;
  TERMID: string;
}

export interface MemberHistoryRow {
  'to Date': string;
  Time: string;
  DEALNO: string;
  CARDNO: string;
  DealingType: string;
  REQCLASS: string;
  TransactionAmount: number;
  Points: number;
  BALANCETOTAL: number;
  BALANCEPOINT: number;
  SHOPNAME: string;
  TERMID: string;
}

export interface CouponRow {
  CouponType: string;
  brand_id: string;
  Code: string;
  CouponCode: string;
  StartingDate: string;
  EndingDate: string;
  CouponUsed: string;
  ValueFormula: string | null;
}

export interface FamilyRow {
  familymemberID: string;
  FirstName: string;
  LastName: string;
  DOB: string;
  parentid: string;
  relationship: string;
  MembershipDate: string;
  TimeWhenRegister: string;
  RefPhoneNo: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-members-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    TableCellDirective,
    SelectComponent,
    InputComponent,
    ExportExcelComponent,
    ModalComponent,
  ],
  templateUrl: './members-details.component.html',
  styleUrl: './members-details.component.css',
})
export class MembersDetailsComponent implements OnInit {

  // ─── Route param ──────────────────────────────────────────────────────────
  membershipId = '';

  // ─── Active tab ───────────────────────────────────────────────────────────
  activeTab: 'details' | 'cardByCard' | 'cardByMember' | 'coupons' | 'family' = 'details';

  // ─── Member detail form ───────────────────────────────────────────────────
  memberDetails: Partial<MemberDetail> = {};
  originMemberDetails: Partial<MemberDetail> = {};
  isDetailsLoading = false;
  isSaving = false;
  hasUnsavedChanges = false;
  showUnsavedModal = false;

  // Dropdown options
  genderOptions: SelectOption[] = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];
  statusOptions: SelectOption[] = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
  ];
  memberTypeOptions: SelectOption[] = [
    { value: 'Person', label: 'Person' },
    { value: 'Company', label: 'Company' },
  ];
  redeemPlanOptions: SelectOption[] = [];
  loyaltyPlanOptions: SelectOption[] = [];
  storeOptions: SelectOption[] = [];

  // ─── Card history by card ─────────────────────────────────────────────────
  cardOptions: SelectOption[] = [];
  selectedCardNumber = '';
  cardHistoryRows: CardHistoryRow[] = [];
  cardHistoryLoading = false;

  cardHistoryColumns: TableColumn[] = [
    { key: 'DATE',              label: 'Date',    transform:'date'           },
    { key: 'DEALNO',            label: 'Deal No',            },
    // { key: 'CARDNO',            label: 'Card No',            },
    { key: 'DealingType',       label: 'Dealing Type',       },
    { key: 'REQCLASS',          label: 'Req Class',        sortable: false },
    { key: 'TransactionAmount', label: 'Txn Amount',         },
    // { key: 'brand_id',          label: 'Sub Brand',          },
    { key: 'Points',            label: 'Points',             },
    { key: 'BALANCETOTAL',      label: 'Balance Total',      },
    { key: 'BALANCEPOINT',      label: 'Balance Point',      },
    { key: 'SHOPNAME',          label: 'Shop Name',          },
    { key: 'TERMID',            label: 'Term ID',            },
  ];
  cardHistoryConfig: TableConfig = {
    selectable: false, pagination: true, pageSize: 10, searchable: true,
    loading: false, emptyMessage: 'Select a card to view history.',
  };

  cardHistoryExportColumns: ExportColumn[] = this.cardHistoryColumns.map(c => ({ key: c.key, label: c.label }));

  // ─── Card history by member ───────────────────────────────────────────────
  memberHistoryRows: MemberHistoryRow[] = [];
  memberHistoryLoading = false;

  memberHistoryColumns: TableColumn[] = [
    { key: 'to Date',           label: 'To Date',    transform:'date'        },
    { key: 'Time',              label: 'Time',               },
    { key: 'DEALNO',            label: 'Deal No',            },
    { key: 'CARDNO',            label: 'Card No',            },
    { key: 'DealingType',       label: 'Dealing Type',       },
    { key: 'REQCLASS',          label: 'Req Class',        sortable: false },
    { key: 'TransactionAmount', label: 'Txn Amount',         },
    { key: 'Points',            label: 'Points',             },
    { key: 'BALANCETOTAL',      label: 'Balance Total',      },
    { key: 'BALANCEPOINT',      label: 'Balance Point',      },
    { key: 'SHOPNAME',          label: 'Shop Name',          },
    { key: 'TERMID',            label: 'Term ID',            },
  ];
  memberHistoryConfig: TableConfig = {
    selectable: false, pagination: true, pageSize: 10, searchable: true,
    loading: false, emptyMessage: 'No history found.',
  };

  memberHistoryExportColumns: ExportColumn[] = this.memberHistoryColumns.map(c => ({ key: c.key, label: c.label }));

  // ─── Coupons ──────────────────────────────────────────────────────────────
  couponRows: CouponRow[] = [];
  couponLoading = false;
  availableCouponOptions: SelectOption[] = [];
  selectedCouponCode = '';
  isAddingCoupon = false;

  couponColumns: TableColumn[] = [
    { key: 'CouponType',   label: 'Type',           },
    { key: 'brand_id',     label: 'Brand',          },
    { key: 'Code',         label: 'Plan Code',      },
    { key: 'CouponCode',   label: 'Coupon Code',    },
    { key: 'StartingDate', label: 'Start Date',     },
    { key: 'EndingDate',   label: 'End Date',       },
    { key: 'CouponUsed',   label: 'Used',         sortable: false },
  ];
  couponConfig: TableConfig = {
    selectable: false, pagination: true, pageSize: 10, searchable: true,
    loading: false, emptyMessage: 'No coupons found.',
  };
  couponExportColumns: ExportColumn[] = this.couponColumns.map(c => ({ key: c.key, label: c.label }));

  // ─── Family ───────────────────────────────────────────────────────────────
  familyRows: FamilyRow[] = [];
  familyLoading = false;

  familyColumns: TableColumn[] = [
    { key: 'familymemberID',  label: 'Member ID',        },
    { key: 'FirstName',       label: 'First Name',       },
    { key: 'LastName',        label: 'Last Name',        },
    { key: 'DOB',             label: 'DOB',              },
    { key: 'parentid',        label: 'Parent ID',        },
    { key: 'relationship',    label: 'Relationship',     },
    { key: 'MembershipDate',  label: 'Membership Date',  },
    { key: 'TimeWhenRegister',label: 'Register Time',    },
    { key: 'RefPhoneNo',      label: 'Phone',            },
  ];
  familyConfig: TableConfig = {
    selectable: false, pagination: true, pageSize: 10, searchable: true,
    loading: false, emptyMessage: 'No family members found.',
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
    this.membershipId = this.route.snapshot.paramMap.get('membershipId') as string;
    if (!this.membershipId) {
      this.notificationService.showError('Invalid Route', 'No membership ID provided');
      this.router.navigate(['/crafted/retail/memberslist']);
      return;
    }
    this.loadMemberDetails();
    this.loadDropdowns();
  }

  // ─── Load member details ──────────────────────────────────────────────────

  loadMemberDetails(): void {
    this.isDetailsLoading = true;
    this.dataService.getMethod(`api/v1/member/details/${this.membershipId}`).subscribe({
      next: (res: any) => {
        this.memberDetails = { ...(res.data?.[0] ?? {}) };
        this.originMemberDetails = { ...(res.data?.[0] ?? {}) };
        this.isDetailsLoading = false;
        this.hasUnsavedChanges = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isDetailsLoading = false;
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load member details');
      },
    });
  }

  // ─── Load shared dropdowns ────────────────────────────────────────────────

  loadDropdowns(): void {
    this.dataService.getMethod('api/v1/member/dropdown').subscribe({
      next: (res: any) => {
        this.redeemPlanOptions  = (res.data?.redeemplan  || []).map((p: any) => ({ value: p.Code, label: p.Code }));
        this.loyaltyPlanOptions = (res.data?.loyaltyplan || []).map((p: any) => ({ value: p.Code, label: p.Code }));
      },
      error: () => {},
    });

    this.dataService.getMethod('api/v1/member/transactions/storelists').subscribe({
      next: (res: any) => {
        this.storeOptions = (res.data || []).map((s: any) => ({ value: s.StoreID, label: s.StoreID }));
      },
      error: () => {},
    });

    this.dataService.getMethod(`api/v1/member/transactions/cards/${this.membershipId}`).subscribe({
      next: (res: any) => {
        this.cardOptions = (res.data || []).map((c: any) => ({
          value: c.CardNumber,
          label: c.CardNumber,
        }));
      },
      error: () => {},
    });

    this.dataService.getMethod('api/v1/coupon/getomembers').subscribe({
      next: (res: any) => {
        this.availableCouponOptions = (res.data || []).map((c: any) => ({
          value: c.Code,
          label: c.Description ? `${c.Code} — ${c.Description}` : c.Code,
        }));
      },
      error: () => {},
    });
  }

  // ─── Tab switching ────────────────────────────────────────────────────────

  setTab(tab: any): void {
    this.activeTab = tab;
    if (tab === 'cardByMember' && this.memberHistoryRows.length === 0) this.loadMemberHistory();
    if (tab === 'coupons'      && this.couponRows.length === 0)        this.loadCoupons();
    if (tab === 'family'       && this.familyRows.length === 0)        this.loadFamily();
  }

  // ─── Save member details ──────────────────────────────────────────────────

  onFieldChange(): void {
    this.hasUnsavedChanges = true;
  }

  onSave(): void {
    const d = this.memberDetails;
    if (!d.Gender || !d.RefPhoneNo || !d.email || !d.FirstName) {
      this.notificationService.showError('Validation', 'First Name, Phone, Email and Gender are required');
      return;
    }

    this.isSaving = true;
    this.dataService.putMethod(
      `/api/v1/member/updateMemberfromBackoffice/${this.memberDetails.MemberShipID}`,
      JSON.stringify({
        customercode:    d.CustomerCode,
        loyaltyplan:     d.LoyaltyPlan,
        redeemplan:      d.RedeemPlan,
        refphoneno:      d.RefPhoneNo,
        firstname:       d.FirstName,
        lastname:        d.LastName,
        email:           d.email,
        gender:          d.Gender,
        dob:             d.DOB || null,
        address:         d.Address,
        city:            d.City,
        zipcode:         d.ZipCode,
        maxnumberofcards:d.maxnumberofcards,
        topupredeemcode: d.TopupRedeemCode,
      })
    ).subscribe({
      next: () => {
        this.originMemberDetails = { ...this.memberDetails };
        this.hasUnsavedChanges = false;
        this.isSaving = false;
        this.notificationService.showSuccess('Saved', 'Member details updated successfully');
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving = false;
        this.notificationService.showError('Save Failed', err.error?.message || 'Failed to save member');
      },
    });
  }

  // ─── Back navigation ──────────────────────────────────────────────────────

  goBack(): void {
    if (this.hasUnsavedChanges) {
      this.showUnsavedModal = true;
    } else {
      this.router.navigate(['/crafted/retail/memberslist']);
    }
  }

  discardAndGoBack(): void {
    this.showUnsavedModal = false;
    this.router.navigate(['/crafted/retail/memberslist']);
  }

  saveAndGoBack(): void {
    this.showUnsavedModal = false;
    this.onSave();
  }

  // ─── Card history by card ─────────────────────────────────────────────────

  onCardSelected(cardNumber: string): void {
    this.selectedCardNumber = cardNumber;
    if (!cardNumber) return;
    this.cardHistoryConfig = { ...this.cardHistoryConfig, loading: true };
    this.dataService.getMethod(`api/v1/member/transactions/historybycardno/${cardNumber}`).subscribe({
      next: (res: any) => {
        this.cardHistoryRows   = res.data || [];
        this.cardHistoryConfig = { ...this.cardHistoryConfig, loading: false };
      },
      error: () => {
        this.cardHistoryConfig = { ...this.cardHistoryConfig, loading: false };
      },
    });
  }

  // ─── Card history by member ───────────────────────────────────────────────

  loadMemberHistory(): void {
    this.memberHistoryConfig = { ...this.memberHistoryConfig, loading: true };
    this.dataService.getMethod(`api/v1/member/transactions/historybymemberid/${this.membershipId}`).subscribe({
      next: (res: any) => {
        this.memberHistoryRows   = res.data || [];
        this.memberHistoryConfig = { ...this.memberHistoryConfig, loading: false };
      },
      error: () => {
        this.memberHistoryConfig = { ...this.memberHistoryConfig, loading: false };
      },
    });
  }

  // ─── Coupons ──────────────────────────────────────────────────────────────

  loadCoupons(): void {
    this.couponConfig = { ...this.couponConfig, loading: true };
    forkJoin([
      this.dataService.getMethod(`api/v1/coupon/membercoupon/${this.membershipId}`),
      this.dataService.getMethod(`api/v1/coupon/brandmembercoupon/${this.membershipId}`),
    ]).subscribe({
      next: ([normal, brand]: [any, any]) => {
        const normalData = (normal?.data || []).map((c: any) => ({ ...c, CouponType: 'Normal', brand_id: '' }));
        const brandData  = (brand?.data  || []).map((c: any) => ({ ...c, CouponType: 'Brand'  }));
        this.couponRows  = [...brandData, ...normalData];
        this.couponConfig = { ...this.couponConfig, loading: false };
      },
      error: () => {
        this.couponConfig = { ...this.couponConfig, loading: false };
      },
    });
  }

  onAddCoupon(): void {
    if (!this.selectedCouponCode) {
      this.notificationService.showError('Validation', 'Please select a coupon to add');
      return;
    }

    this.confirmationService.confirmAction(
      'Add Coupon',
      `Add coupon ${this.selectedCouponCode} to this member?`,
      'primary'
    ).then(confirmed => {
      if (!confirmed) return;
      this.isAddingCoupon = true;
      this.dataService.postMethod('api/v1/coupon/sendtomembers', JSON.stringify({
        MemberID: this.membershipId,
        CouponCode: this.selectedCouponCode,
      })).subscribe({
        next: () => {
          this.isAddingCoupon = false;
          this.notificationService.showSuccess('Added', 'Coupon added successfully');
          this.selectedCouponCode = '';
          this.loadCoupons();
        },
        error: (err: HttpErrorResponse) => {
          this.isAddingCoupon = false;
          this.notificationService.showError('Failed', err.error?.message || 'Failed to add coupon');
        },
      });
    });
  }

  // ─── Family ───────────────────────────────────────────────────────────────

  loadFamily(): void {
    this.familyConfig = { ...this.familyConfig, loading: true };
    this.dataService.getMethod(`api/v1/member/memberfamily/${this.membershipId}`).subscribe({
      next: (res: any) => {
        this.familyRows   = res.data || [];
        this.familyConfig = { ...this.familyConfig, loading: false };
      },
      error: () => {
        this.familyConfig = { ...this.familyConfig, loading: false };
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' {
    if (status === 'Active')   return 'success';
    if (status === 'Inactive') return 'danger';
    return 'warning';
  }

  getCouponUsedVariant(val: string): 'danger' | 'success' {
    return val === 'Yes' || val === '1' || val === 'true' ? 'danger' : 'success';
  }

  onPageChange(_page: number): void {}
}