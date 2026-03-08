import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { MultiselectComponent, MultiSelectOption } from '../../../components/ui/multi-select/multi-select.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface MemberDetails {
  MemberShipID: string;
  FirstName: string;
  LastName: string;
  email?: string;
  RefPhoneNo?: string;
  CurrentStatus?: string;
  CardType?: string;
}

export interface MemberLevel {
  memberlevelCode: number;
  Description: string;
}

export interface CouponPlan {
  Code: string;
  Description: string;
  CouponType: string;
}

export interface MemberCoupon {
  Code: string;
  CouponCode: string;
  StartingDate: string;
  EndingDate: string;
  ValueFormula: string;
  CouponUsed: string;
  UseDate: string;
}

export interface GridMember {
  MemberShipID: string;
  FirstName: string;
  LastName: string;
  manualMemberLevelCode: number | null;
  couponsList: any[];
  totalCouponCount?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-manual-member-level',
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
    ExportExcelComponent,
    ModalComponent,
    MultiselectComponent,
  ],
  templateUrl: './manual-member-level.component.html',
  styleUrl: './manual-member-level.component.css',
})
export class ManualMemberLevelComponent implements OnInit {

  // ─── Route param ──────────────────────────────────────────────────────────
  membershipId = '';

  // ─── Member details ───────────────────────────────────────────────────────
  memberDetails: MemberDetails | null = null;
  isMemberLoading = false;

  // ─── Form ─────────────────────────────────────────────────────────────────
  selectedMemberLevelCode: string | null = null;
  selectedCouponPlans: string[] = [];
  isGenerating = false;

  // ─── Dropdowns ────────────────────────────────────────────────────────────
  memberLevelOptions: SelectOption[] = [];
  couponPlanOptions: MultiSelectOption[] = [];
  memberLevelDataSource: MemberLevel[] = [];

  // ─── Members grid ─────────────────────────────────────────────────────────
  gridRows: GridMember[] = [];

  gridColumns: TableColumn[] = [
    { key: 'FirstName',           label: 'First Name',   sortable: true },
    { key: 'LastName',            label: 'Last Name',    sortable: true },
    { key: 'manualMemberLevelCode', label: 'Level',      sortable: true },
    { key: 'couponsList',         label: 'Coupons',      sortable: false },
  ];

  gridConfig: TableConfig = {
    selectable: false,
    pagination: false,
    searchable: false,
    loading: false,
    emptyMessage: 'No member data loaded.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'FirstName',             label: 'First Name'   },
    { key: 'LastName',              label: 'Last Name'    },
    { key: 'manualMemberLevelCode', label: 'Level'        },
  ];

  // ─── Coupon detail modal ──────────────────────────────────────────────────
  showCouponModal = false;
  selectedMemberCoupons: MemberCoupon[] = [];

  couponModalColumns: TableColumn[] = [
    { key: 'Code',         label: 'Plan Code',  sortable: true },
    { key: 'CouponCode',   label: 'Coupon Code', sortable: true },
    { key: 'StartingDate', label: 'Start Date',  sortable: true },
    { key: 'EndingDate',   label: 'End Date',    sortable: true },
    { key: 'ValueFormula', label: 'Value',       sortable: false },
    { key: 'CouponUsed',   label: 'Used',        sortable: false },
    { key: 'UseDate',      label: 'Use Date',    sortable: true },
  ];

  couponModalConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No coupons found.',
  };

  // ─── Manual members list (for exists check) ───────────────────────────────
  private manualMembersList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.membershipId = this.route.snapshot.paramMap.get('membershipId') as string;

    if (!this.membershipId) {
      this.notificationService.showError('Invalid Route', 'No membership ID provided');
      this.router.navigate(['/crafted/retail/memberslistmanual']);
      return;
    }

    // Await member levels so labels resolve when grid renders
    this.loadDropdowns().then(() => this.loadMemberData());
  }

  // ─── Load dropdowns ────────────────────────────────────────────────────────

  async loadDropdowns(): Promise<void> {
    // Load member levels first and await — grid label resolution depends on this
    await this.dataService.getMethod('api/v1/loyalty/memberlevels/details').toPromise().then((res: any) => {
      this.memberLevelDataSource = res?.data || [];
      this.memberLevelOptions = this.memberLevelDataSource.map(l => ({
        value: String(l.memberlevelCode),
        label: l.Description,
      }));
    }).catch((err: HttpErrorResponse) => {
      this.notificationService.showError('Load Failed', err?.error?.message || 'Failed to load member levels');
    });

    this.dataService.getMethod('api/v1/coupon/all').subscribe({
      next: (res: any) => {
        const specials = (res.data || []).filter((c: CouponPlan) =>
          c.CouponType?.toUpperCase() === 'SPECIAL'
        );
        this.couponPlanOptions = specials.map((c: CouponPlan) => ({
          value: c.Code,
          label: c.Description ? `${c.Code} — ${c.Description}` : c.Code,
        }));
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load coupon plans');
      },
    });

    this.dataService.getMethod('api/v1/member/manualmember/getallmanualmembers').subscribe({
      next: (res: any) => { this.manualMembersList = res.data || []; },
      error: () => { this.manualMembersList = []; },
    });
  }

  // ─── Load member + manual level + coupons ─────────────────────────────────

  loadMemberData(): void {
    this.isMemberLoading = true;
    this.gridConfig = { ...this.gridConfig, loading: true };

    this.dataService.getMethod(`api/v1/member/details/${this.membershipId}`).subscribe({
      next: async (res: any) => {
        this.memberDetails = res.data?.[0] ?? null;

        if (!this.memberDetails) {
          this.notificationService.showError('Not Found', 'Member details not found');
          this.isMemberLoading = false;
          this.gridConfig = { ...this.gridConfig, loading: false };
          return;
        }

        const manualData = await this.fetchManualMemberData(this.membershipId);

        if (manualData?.memberlevelcode != null) {
          this.selectedMemberLevelCode = String(manualData.memberlevelcode);
        }

        // Coupons count comes from the JSON string stored in the manual member record
        // e.g. coupons: "[\"coupon3\", \"coupon2\"]"
        const couponsList = this.parseCouponsField(manualData?.coupons);

        this.gridRows = [{
          MemberShipID:          this.memberDetails!.MemberShipID,
          FirstName:             this.memberDetails!.FirstName,
          LastName:              this.memberDetails!.LastName,
          manualMemberLevelCode: manualData?.memberlevelcode ?? null,
          couponsList:           couponsList,
        }];

        this.isMemberLoading = false;
        this.gridConfig = { ...this.gridConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isMemberLoading = false;
        this.gridConfig = { ...this.gridConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load member details');
      },
    });
  }

  // ─── Generate / Save ──────────────────────────────────────────────────────

  async onGenerateCoupons(): Promise<void> {
    if (!this.memberDetails?.MemberShipID) {
      this.notificationService.showError('Not Ready', 'Member details not loaded yet');
      return;
    }
    if (!this.selectedMemberLevelCode) {
      this.notificationService.showError('Validation', 'Please select a member level');
      return;
    }

    this.isGenerating = true;

    try {
      await this.saveOrUpdateManualMember(
        this.memberDetails.MemberShipID,
        this.selectedMemberLevelCode,
        this.memberDetails.FirstName || '',
        this.memberDetails.LastName  || '',
      );

      if (this.selectedCouponPlans.length > 0) {
        await this.generateCouponsForMember(this.memberDetails.MemberShipID, this.selectedCouponPlans);
      }

      // Refresh grid with latest manual member data
      const manualData = await this.fetchManualMemberData(this.memberDetails.MemberShipID);
      const couponsList = this.parseCouponsField(manualData?.coupons);

      this.gridRows = [{
        MemberShipID:          this.memberDetails.MemberShipID,
        FirstName:             this.memberDetails.FirstName,
        LastName:              this.memberDetails.LastName,
        manualMemberLevelCode: manualData?.memberlevelcode ?? null,
        couponsList:           couponsList,
      }];

      this.selectedCouponPlans = [];
      this.notificationService.showSuccess('Done', 'Operation completed successfully');
    } catch {
      this.notificationService.showError('Failed', 'Failed to complete the operation');
    } finally {
      this.isGenerating = false;
    }
  }

  // ─── Save / Update manual member ─────────────────────────────────────────

  private async saveOrUpdateManualMember(
    membershipId: string,
    memberLevelCode: string,
    firstName: string,
    lastName: string,
  ): Promise<void> {
    // Refresh exists list
    await this.dataService.getMethod('api/v1/member/manualmember/getallmanualmembers')
      .toPromise()
      .then((res: any) => { this.manualMembersList = res?.data || []; })
      .catch(() => {});

    const exists = this.manualMembersList.some(m => m.membership_id === membershipId);
    // API stores memberlevelcode as integer
    const levelCodeNum = parseInt(memberLevelCode, 10);

    if (exists) {
      await this.dataService
        .putMethod(`api/v1/member/manualmember/update/${membershipId}`, JSON.stringify({
          memberlevelcode: levelCodeNum,
          first_name: firstName,
          last_name: lastName,
        }))
        .toPromise();
      this.notificationService.showSuccess('Updated', 'Member level updated');
    } else {
      await this.dataService
        .postMethod('api/v1/member/manualmember/create', JSON.stringify({
          membership_id: membershipId,
          memberlevelcode: levelCodeNum,
          first_name: firstName,
          last_name: lastName,
        }))
        .toPromise();
      this.notificationService.showSuccess('Created', 'Manual member added');
    }
  }

  // ─── Generate coupons ─────────────────────────────────────────────────────

  private async generateCouponsForMember(membershipId: string, planCodes: string[]): Promise<void> {
    let success = 0;
    let fail = 0;

    for (const planCode of planCodes) {
      try {
        await this.dataService
          .postMethod('api/v1/coupon/sendtomembers', JSON.stringify({
            MemberID: membershipId,
            CouponCode: planCode,
          }))
          .toPromise();
        success++;
      } catch {
        fail++;
      }
    }

    if (success > 0) this.notificationService.showSuccess('Coupons', `${success} coupon(s) generated`);
    if (fail > 0)    this.notificationService.showError('Coupons',   `${fail} coupon(s) failed`);
  }

  // ─── Promise helpers ──────────────────────────────────────────────────────

  private fetchManualMemberData(membershipId: string): Promise<any> {
    return this.dataService
      .getMethod(`api/v1/member/manualmember/getmanualmember/${membershipId}`)
      .toPromise()
      .then((res: any) => res?.data ?? null)
      .catch(() => null);
  }

  private fetchMemberCoupons(membershipId: string): Promise<MemberCoupon[]> {
    return this.dataService
      .getMethod(`api/v1/coupon/membercoupon/${membershipId}`)
      .toPromise()
      .then((res: any) => res?.data || [])
      .catch(() => []);
  }

  // ─── Coupon detail modal ──────────────────────────────────────────────────

  openCouponModal(membershipId: string): void {
    this.couponModalConfig = { ...this.couponModalConfig, loading: true };
    this.showCouponModal = true;

    this.dataService.getMethod(`api/v1/coupon/membercoupon/${membershipId}`).subscribe({
      next: (res: any) => {
        this.selectedMemberCoupons = res?.data || [];
        this.couponModalConfig = { ...this.couponModalConfig, loading: false };

        // Update the live count on the grid row
        const row = this.gridRows.find(r => r.MemberShipID === membershipId);
        if (row) row.totalCouponCount = this.selectedMemberCoupons.length;
      },
      error: (err: HttpErrorResponse) => {
        this.couponModalConfig = { ...this.couponModalConfig, loading: false };
        this.showCouponModal = false;
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load coupons');
      },
    });
  }

  closeCouponModal(): void {
    this.showCouponModal = false;
    this.selectedMemberCoupons = [];
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * The API stores coupons as a JSON string e.g. "[\"coupon3\", \"coupon2\"]"
   * Parse it into an array for getCouponCount()
   */
  parseCouponsField(raw: string | null | undefined): any[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  getMemberLevelLabel(code: number | null): string {
    if (code == null) return '—';
    const level = this.memberLevelDataSource.find(l => l.memberlevelCode === code);
    return level?.Description ?? String(code);
  }

  getCouponCount(coupons: any): number {
    return Array.isArray(coupons) ? coupons.length : 0;
  }

  goBack(): void {
    this.router.navigate(['/crafted/retail/memberslistmanual']);
  }

  onPageChange(_page: number): void {}
}