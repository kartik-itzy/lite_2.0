import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent } from '../../../components/ui/select/select.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { PaginationComponent, PaginationConfig } from '../../../components/ui/pagination/pagination.component';
// import { MultiselectComponent } from '../../../components/ui/multiselect/multiselect.component';
import { SelectOption } from '../../../components/ui/select/select.component';
import { MultiselectComponent,MultiSelectOption } from '../../../components/ui/multi-select/multi-select.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
// import { MultiSelectOption } from '../../../components/ui/multiselect/multiselect.component';
// MultiselectComponent

@Component({
  selector: 'app-rfm-target-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    ModalComponent,
    PaginationComponent,
    MultiselectComponent,
    BadgeComponent
  ],
  templateUrl: './rfm-target-config.component.html',
  styleUrl: './rfm-target-config.component.css'
})
export class RfmTargetConfigComponent implements OnInit {

  // State 
  showTargetDialog = false;
  showDeleteConfirm = false;
  deletingGroup: any = null;
  editingGroupId: string | null = null;
  isEditMode = false;
  isDefaultTarget = false;
  isLoading = false;

  allTargetGroups: any[] = [];
  paginatedGroups: any[] = [];
  availableCategories: any[][] = [];

  searchTerm = '';
  currentPage = 1;
  pageSize = 12;
  targetLimit: any;
  brandAvailable = false;
  brandLevelOptionsMap: { [brandId: string]: SelectOption[] } = {};
  levelOptions: SelectOption[] = [];
  brandOptions: SelectOption[] = [];

  targetGroupForm: any = {
    targetName: '',
    categorySelection: 'single',
    selectedCategories: []
  };

  // ─── Pagination config 
  get totalPages(): number {
    return Math.ceil(this.getFilteredGroups().length / this.pageSize);
  }

  get paginationConfig(): PaginationConfig {
    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.getFilteredGroups().length,
      itemsPerPage: this.pageSize,
      showPageNumbers: true
    };
  }

  // ─── Static options 
  allCategoriesBase = [
    { id: 'all', name: 'All Users' },
    { id: 'age', name: 'Age' },
    { id: 'birthday', name: 'Birthday' },
    { id: 'gender', name: 'Gender' },
    { id: 'joined', name: 'Membership Date' },
    { id: 'level', name: 'Level' },
    { id: 'pointsexpiry', name: 'Points Expiry' },
    { id: 'receivedpoints', name: 'Received Points' },
    { id: 'spending', name: 'Spending' },
    { id: 'status', name: 'User Status' },
    { id: 'transactions', name: 'Purchase Transactions' },
    { id: 'topuptransactions', name: 'TopUp Transactions' },
    { id: 'brandvisit', name: 'Brand Visit' },
    { id: 'brandlevel', name: 'Brand Level' },
    { id: 'brandreceived', name: 'Brand Received Points' },
  ];

  allCategories = this.allCategoriesBase;

  get allCategoryOptions(): SelectOption[] {
    return this.allCategories.map(c => ({ value: c.id, label: c.name }));
  }

  genderOptions: MultiSelectOption[] = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  ageOperatorOptions: SelectOption[] = [
    { value: 'between', label: 'Between' }
  ];

  transactionTypeOptions: SelectOption[] = [
    { value: 'repurchase', label: 'Repurchase' },
    { value: 'no_repurchase', label: 'No Repurchase' },
    { value: 'nopurchase', label: 'Never Purchase' }
  ];

  topupTypeOptions: SelectOption[] = [
    { value: 'topup', label: 'Topup' },
    { value: 'notopup', label: 'No Topup' },
    { value: 'nevertopup', label: 'Never Topup' }
  ];

  repurchaseDayOptions: SelectOption[] = [
    { value: '30', label: '30 Days' },
    { value: '60', label: '60 Days' },
    { value: '90', label: '90 Days' }
  ];

  statusOptions: SelectOption[] = [
    { value: 'inactive', label: 'Inactive' },
    { value: 'active', label: 'Active' }
  ];

  inactiveDayOptions: SelectOption[] = [
    { value: '30', label: '30 Days' },
    { value: '60', label: '60 Days' },
    { value: '90', label: '90 Days' }
  ];

  pointsExpiryOptions: SelectOption[] = [
    { value: 'quarter', label: 'This Quarter' },
    { value: 'half', label: 'This Half' },
    { value: 'year', label: 'This Year' }
  ];

  pointsOperatorOptions: SelectOption[] = [
    { value: '>', label: 'More than -' }
  ];

  monthOptions: MultiSelectOption[] = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ].map(m => ({ value: m, label: m }));

  dateOptions: MultiSelectOption[] = Array.from({ length: 31 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1)
  }));

  // ─── Chip color map 
  private readonly chipColorMap: Record<string, string> = {
    'level': 'chip-blue',
    'gender': 'chip-pink',
    'age': 'chip-green',
    'birthday': 'chip-purple',
    'points': 'chip-orange',
    'pointsbalance': 'chip-orange',
    'spending': 'chip-yellow',
    'joined': 'chip-teal',
    'transactions': 'chip-red',
    'topuptransactions': 'chip-teal',
    'status': 'chip-gray',
    'pointsexpiry': 'chip-indigo',
    'brandvisit': 'chip-cyan',
    'brandlevel': 'chip-violet',
    'brandreceived': 'chip-amber',
    'all': 'chip-dark'
  };

  private readonly chipTailwindMap: Record<string, string> = {
    'chip-blue': 'bg-blue-100 text-blue-700',
    'chip-pink': 'bg-pink-100 text-pink-700',
    'chip-green': 'bg-green-100 text-green-700',
    'chip-purple': 'bg-purple-100 text-purple-700',
    'chip-orange': 'bg-orange-100 text-orange-700',
    'chip-yellow': 'bg-yellow-100 text-yellow-700',
    'chip-teal': 'bg-teal-100 text-teal-700',
    'chip-red': 'bg-red-100 text-red-700',
    'chip-gray': 'bg-gray-100 text-gray-700',
    'chip-indigo': 'bg-indigo-100 text-indigo-700',
    'chip-cyan': 'bg-cyan-100 text-cyan-700',
    'chip-violet': 'bg-violet-100 text-violet-700',
    'chip-amber': 'bg-amber-100 text-amber-700',
    'chip-dark': 'bg-gray-800 text-white',
    'chip-more': 'bg-gray-100 text-gray-500',
    'chip-default': 'bg-gray-100 text-gray-600'
  };

  getChipClasses(chipClass: string): string {
    return this.chipTailwindMap[chipClass] || 'bg-gray-100 text-gray-600';
  }

  // ─── Lifecycle ─────
  constructor(
    private router: Router,
    private dataService: DataService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.getAllTargets();
    this.getMemberLevels();
    this.checkBrandAvailability();
    this.getTargetLimit();
  }

  // ─── API calls ─────
  getTargetLimit(): void {
    this.dataService.getMethod('api/v1/member/rfm/getTargetLimit').subscribe({
      next: (res: any) => { this.targetLimit = res; }
    });
  }

  checkBrandAvailability(): void {
    this.dataService.getMethod('api/v1/customers').subscribe({
      next: (res: any) => {
        this.brandAvailable = res.data.customer[0].brand === 'Yes';
        if (!this.brandAvailable) {
          this.allCategories = this.allCategoriesBase.filter(
            c => !['brandvisit', 'brandlevel', 'brandreceived'].includes(c.id)
          );
        } else {
          this.getAllBrands();
          this.allCategories = this.allCategoriesBase;
        }
      }
    });
  }

  getAllTargets(retryCount = 0): void {
    this.isLoading = true;
    this.dataService.getMethod('api/v1/member/rfm/getTargets').subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.allTargetGroups = response.data.map((t: any) => ({
            targetId: t.targetid,
            title: t.targetname,
            description: this.getDescriptionFromTargetQuery(t.targetquery),
            category: t.targetcategory,
            isDefault: t.defaultTarget === 'Yes',
            data: t
          }));
          this.allTargetGroups.sort((a: any, b: any) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return (a.title || '').localeCompare(b.title || '');
          });
          this.updatePaginatedGroups();
          this.isLoading = false;
          this.createDefaultTargets();
        } else if (retryCount < 3) {
          setTimeout(() => this.getAllTargets(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        if (retryCount < 3) {
          setTimeout(() => this.getAllTargets(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          this.notification.showError('Error', 'Failed to load targets. Please refresh.');
          this.isLoading = false;
        }
      }
    });
  }

  getMemberLevels(): void {
    this.dataService.getMethod('api/v1/loyalty/memberlevels/details').subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.data) {
          this.levelOptions = res.data.map((l: any) => ({ value: l.Description, label: l.Description }));
        }
      },
      error: () => {
        this.notification.showError('Warning', 'Member levels do not exist');
        this.levelOptions = [];
      }
    });
  }

  getAllBrands(): void {
    this.dataService.getMethod('api/v1/member/getAllBrands').subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.data) {
          this.brandOptions = [
            { value: 'ALL', label: 'ALL' },
            ...res.data.map((b: any) => ({ value: b.brand_id, label: b.name }))
          ];
        }
      },
      error: () => {
        this.notification.showError('Warning', 'Brands do not exist');
        this.brandOptions = [];
      }
    });
  }

  getBrandLevels(brandId: string): void {
    if (!brandId || brandId === 'ALL') return;
    if (this.brandLevelOptionsMap[brandId]) return;
    this.dataService.getMethod(`api/v1/loyalty/brandmemberlevels/details/${brandId}`).subscribe({
      next: (res: any) => {
        if (res.status === 200 && res.data) {
          this.brandLevelOptionsMap[brandId] = res.data.map((l: any) => ({
            value: l.Description, label: l.Description
          }));
        }
      },
      error: () => { this.brandLevelOptionsMap[brandId] = []; }
    });
  }

  getBrandLevelOptions(brandId: string): SelectOption[] {
    if (!brandId || brandId === 'ALL') return [];
    return this.brandLevelOptionsMap[brandId] || [];
  }

  getTargetById(targetId: string): void {
    this.dataService.getMethod(`api/v1/member/rfm/getTarget/${targetId}`).subscribe({
      next: (res: any) => {
        if (res.status === 200) this.populateFormForEdit(res.data);
      },
      error: () => this.notification.showError('Error', 'Failed to load target')
    });
  }

  createTarget(targetData: any): void {
    this.isLoading = true;
    this.dataService.postMethod('api/v1/member/rfm/createTarget', targetData).subscribe({
      next: (res: any) => {
        if (res.status === 200 || res.status === 201) {
          this.notification.showSuccess('Success', 'Target group created');
          this.getAllTargets();
          this.showTargetDialog = false;
          this.resetForm();
        }
        this.isLoading = false;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to create target');
        this.isLoading = false;
      }
    });
  }

  updateTarget(targetId: string, targetData: any): void {
    this.isLoading = true;
    this.dataService.putMethod(`api/v1/member/rfm/updateTarget/${targetId}`, targetData).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.notification.showSuccess('Success', 'Target group updated');
          this.getAllTargets();
          this.showTargetDialog = false;
          this.isDefaultTarget = false;
          this.resetForm();
        }
        this.isLoading = false;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to update target');
        this.isLoading = false;
      }
    });
  }

  deleteTarget(targetId: string): void {
    this.isLoading = true;
    this.dataService.deleteMethod(`api/v1/member/rfm/deleteTarget/${targetId}`).subscribe({
      next: (res: any) => {
        if (res.status === 200) {
          this.notification.showSuccess('Success', 'Target group deleted');
          this.getAllTargets();
          this.getTargetLimit();
          this.showDeleteConfirm = false;
          this.deletingGroup = null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to delete target');
        this.isLoading = false;
      }
    });
  }

  // ─── Default targets 
  private canCreateDefaultTarget(targetid: string): boolean {
    return !this.allTargetGroups.some((t: any) =>
      t.data?.targetid?.toLowerCase() === targetid.toLowerCase() &&
      t.data?.defaultTarget === 'Yes'
    );
  }

  createDefaultTargets(): void {
    if (!this.allTargetGroups || this.allTargetGroups.length === 0) return;

    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });

    const defaultTargets = [
      { targetid: 'all', targetname: 'ALL USERS', targetcategory: ['all'], targetquery: JSON.stringify({ category: ['all'] }) },
      {
        targetid: 'birthday', targetname: 'THIS MONTH BIRTHDAY', targetcategory: ['birthday'],
        targetquery: JSON.stringify({ category: ['birthday'], birthday: { months: [currentMonth], dates: Array.from({ length: 31 }, (_, i) => i + 1) } })
      },
      {
        targetid: 'repurchase', targetname: 'NO REPURCHASE IN DAYS', targetcategory: ['repurchase'],
        targetquery: JSON.stringify({ category: ['repurchase'], repurchase: { type: 'days', value: 30 } })
      },
      {
        targetid: 'inactive', targetname: 'INACTIVE FOR DAYS', targetcategory: ['inactive'],
        targetquery: JSON.stringify({ category: ['inactive'], inactive: { type: 'days', value: 30 } })
      },
      {
        targetid: 'spending', targetname: 'TOP SPENDING USERS', targetcategory: ['spending'],
        targetquery: JSON.stringify({ category: ['spending'], spending: { operator: '>', value: 0, limit: 50 } })
      },
      {
        targetid: 'receivedpoints', targetname: 'RECEIVED POINTS 2+ TIMES', targetcategory: ['receivedpoints'],
        targetquery: JSON.stringify({ category: ['receivedpoints'], receivedpoints: { times: 2 } })
      },
      {
        targetid: 'pointsexpiry', targetname: 'POINTS EXPIRING THIS QUARTER', targetcategory: ['pointsexpiry'],
        targetquery: JSON.stringify({ category: ['pointsexpiry'], pointsexpiry: { expiryPeriod: 'quarter' } })
      },
      {
        targetid: 'nopurchase', targetname: 'NEVER PURCHASED USERS', targetcategory: ['nopurchase'],
        targetquery: JSON.stringify({ category: ['nopurchase'], nopurchase: true })
      },
      {
        targetid: 'nevertopup', targetname: 'NEVER TOPUP USERS', targetcategory: ['nevertopup'],
        targetquery: JSON.stringify({ category: ['nevertopup'], nevertopup: true })
      }
    ];

    const targetsToCreate = defaultTargets
      .filter(t => this.canCreateDefaultTarget(t.targetid))
      .map(t => ({ ...t, defaultTarget: 'Yes' }));

    if (targetsToCreate.length === 0) return;
    this.createDefaultTargetsSequentially(targetsToCreate, 0);
  }

  private createDefaultTargetsSequentially(targets: any[], index: number): void {
    if (index >= targets.length) { this.getAllTargets(); return; }
    this.dataService.postMethod('api/v1/member/rfm/createTarget', targets[index]).subscribe({
      next: () => this.createDefaultTargetsSequentially(targets, index + 1),
      error: () => this.createDefaultTargetsSequentially(targets, index + 1)
    });
  }

  // ─── Pagination ────
  private getFilteredGroups(): any[] {
    if (!this.searchTerm?.trim()) return this.allTargetGroups || [];
    const term = this.searchTerm.trim().toLowerCase();
    return (this.allTargetGroups || []).filter((g: any) =>
      (g.title || '').toLowerCase().includes(term) ||
      (g.description || '').toLowerCase().includes(term) ||
      (g.isDefault && 'default'.includes(term))
    );
  }

  updatePaginatedGroups(): void {
    const filtered = this.getFilteredGroups();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedGroups = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedGroups();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    this.updatePaginatedGroups();
  }

  // ─── UI helpers ────
  getCategoryChips(targetquery: any): any[] {
    let query: any;
    try { query = typeof targetquery === 'string' ? JSON.parse(targetquery) : targetquery; }
    catch { return []; }
    if (!query?.category) return [];

    const chips = query.category.map((cat: string) => ({
      label: this.allCategories.find(c => c.id === cat)?.name || cat,
      class: this.chipColorMap[cat] || 'chip-default'
    }));

    if (chips.length > 3) {
      return [...chips.slice(0, 3), { label: `+${chips.length - 3} more`, class: 'chip-more' }];
    }
    return chips;
  }

  getHumanReadableDescription(group: any): string {
    let query: any;
    try {
      query = typeof group.data?.targetquery === 'string'
        ? JSON.parse(group.data.targetquery)
        : group.data?.targetquery;
    } catch { return ''; }
    if (!query) return '';

    const categories: string[] = query.category || [];
    const parts: string[] = [];

    if (categories.includes('all')) parts.push('All users');
    if (query.gender?.length > 0) parts.push(`${query.gender.join(' & ')} users`);
    if (query.age) parts.push(this.getAgeDescription(query.age));
    if (query.birthday?.months?.length) parts.push(`Birthday in ${query.birthday.months.join(', ')}`);
    if (query.joined) parts.push(`Joined ${this.formatDate(query.joined.from)} – ${this.formatDate(query.joined.to)}`);
    if (query.level?.level) parts.push(`Level: ${query.level.level}`);
    if (query.PointsExpired || query.pointsexpiry) {
      const d = query.PointsExpired || query.pointsexpiry;
      const p = d.expiryPeriod || d.period;
      const m: any = { quarter: 'this quarter', half: 'this half', year: 'this year' };
      if (p) parts.push(`Points expiring ${m[p] || p}`);
    }
    if (query.pointsbalance) parts.push(this.getPointsDescription(query.pointsbalance));
    if (query.spending) {
      if (query.spending.limit) parts.push(`Top ${query.spending.limit} spending users`);
      else if (query.spending.value !== undefined) parts.push(`Spending > ${query.spending.value}`);
    }
    if (query.receivedpoints?.times) parts.push(`Received points ${query.receivedpoints.times}+ times`);
    if (query.active) {
      const a = query.active;
      if (a.type === 'days' && a.value) parts.push(`Active for ${a.value} days`);
      else if (a.from && a.to) parts.push(`Active ${this.formatDate(a.from)} – ${this.formatDate(a.to)}`);
    }
    if (query.inactive) {
      const i = query.inactive;
      if (i.type === 'days' && i.value) parts.push(`Inactive for ${i.value} days`);
      else if (i.from && i.to) parts.push(`Inactive ${this.formatDate(i.from)} – ${this.formatDate(i.to)}`);
    }
    if (query.repurchase) {
      const r = query.repurchase;
      if (r.type === 'days' && r.value) parts.push(`No repurchase in ${r.value} days`);
      else if (r.from && r.to) parts.push(`No repurchase ${this.formatDate(r.from)} – ${this.formatDate(r.to)}`);
    }
    if (query.brandvisit) {
      const bv = query.brandvisit;
      parts.push(`Top ${bv.limit || ''} visits – ${bv.selectedBrand !== 'ALL' ? bv.selectedBrand : 'all brands'}`);
    }
    if (query.brandlevel) {
      const bl = query.brandlevel;
      parts.push(`Brand level${bl.level && bl.level !== 'ALL' ? ` (${bl.level})` : ''} – ${bl.brand_id !== 'ALL' ? bl.brand_id : 'all brands'}`);
    }
    if (query.brandreceived) {
      const br = query.brandreceived;
      parts.push(`Brand received points ${br.times || 2}+ times – ${br.brand_id !== 'ALL' ? br.brand_id : 'all brands'}`);
    }
    if (categories.includes('nevertopup')) parts.push('Never topped up');
    if (categories.includes('nopurchase')) parts.push('Never purchased');

    return parts.join(', ');
  }

  getAgeDescription(age: any): string {
    if (age.operator === 'between') return `Age between ${age.from} and ${age.to}`;
    const map: any = { '<=': 'less than or equal to', '>=': 'greater than or equal to', '<': 'less than', '>': 'greater than', '=': 'equal to' };
    return `Age ${map[age.operator] || age.operator} ${age.value}`;
  }

  getPointsDescription(points: any): string {
    const map: any = { '<=': 'less than or equal to', '>=': 'greater than or equal to', '<': 'less than', '>': 'greater than', '=': 'equal to' };
    return `Points ${map[points.operator] || points.operator} ${points.value}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getDescriptionFromTargetQuery(targetquery: any): string {
    let query: any;
    try { query = typeof targetquery === 'string' ? JSON.parse(targetquery) : targetquery; }
    catch { return 'Custom target segment'; }
    const parts: string[] = [];
    if (query?.level?.length > 0) parts.push(`Level: ${query.level.join(', ')}`);
    if (query?.gender?.length > 0) parts.push(`Gender: ${query.gender.join(', ')}`);
    if (query?.age) parts.push(`Age ${query.age.operator} ${query.age.value}`);
    if (query?.joined) parts.push(`Joined: ${query.joined.from} to ${query.joined.to}`);
    if (query?.birthday) parts.push(`Birthday: ${query.birthday.months.join(', ')}`);
    return parts.length > 0 ? parts.join(', ') : 'Custom target segment';
  }

  // ─── Form helpers ──
  getAvailableCategories(currentIndex?: number): any[] {
    if (!this.targetGroupForm.selectedCategories?.length) return this.allCategories;
    const selectedIds = this.targetGroupForm.selectedCategories
      .map((c: any, idx: number) => idx !== currentIndex ? c.categoryId : null)
      .filter((id: any) => id != null);
    return this.allCategories.filter(cat => !selectedIds.includes(cat.id));
  }

  getReversedCategories(): any[] {
    return [...this.targetGroupForm.selectedCategories].reverse();
  }

  getRealIndex(reversedIndex: number): number {
    return this.targetGroupForm.selectedCategories.length - 1 - reversedIndex;
  }

  addCategory(): void {
    const hasAll = this.targetGroupForm.selectedCategories.some((c: any) => c.categoryId === 'all');
    if (hasAll) { this.notification.showError('Validation', 'Cannot add more categories when "All Users" is selected'); return; }
    const ids = this.targetGroupForm.selectedCategories.map((c: any) => c.categoryId).filter(Boolean);
    if (ids.length !== new Set(ids).size) { this.notification.showError('Validation', 'Please resolve duplicate categories first'); return; }
    if (this.getAvailableCategories().length === 0) { this.notification.showError('Warning', 'All categories have been added'); return; }
    this.targetGroupForm.selectedCategories.push({ categoryId: null, data: {} });
  }

  removeCategory(index: number): void {
    this.targetGroupForm.selectedCategories.splice(index, 1);
  }

  onCategoryChange(index: number, newValue: string): void {
    const cat = this.targetGroupForm.selectedCategories[index];
    const isDuplicate = this.targetGroupForm.selectedCategories.some((c: any, i: number) => i !== index && c.categoryId === newValue);
    if (isDuplicate) { this.notification.showError('Duplicate', 'This category is already selected'); setTimeout(() => cat.categoryId = null, 0); return; }
    const hasAll = this.targetGroupForm.selectedCategories.some((c: any, i: number) => i !== index && c.categoryId === 'all');
    const hasOther = this.targetGroupForm.selectedCategories.some((c: any, i: number) => i !== index && c.categoryId && c.categoryId !== 'all');
    if (newValue === 'all' && hasOther) { this.notification.showError('Validation', 'Cannot select "All Users" when other categories exist'); setTimeout(() => cat.categoryId = null, 0); return; }
    if (newValue !== 'all' && hasAll) { this.notification.showError('Validation', 'Cannot add other categories when "All Users" is selected'); setTimeout(() => cat.categoryId = null, 0); return; }
    if (cat.categoryId !== newValue) { cat.categoryId = newValue; cat.data = {}; }
  }

  onCategorySelectionChange(value: string): void {
    this.targetGroupForm.categorySelection = value;
    this.targetGroupForm.selectedCategories = [];
    this.addCategory();
  }

  onTransactionTypeChange(index: number, _: any): void {
    const d = this.targetGroupForm.selectedCategories[index].data;
    d.repurchaseType = null; d.repurchaseDays = null; d.repurchaseFrom = null; d.repurchaseTo = null;
  }

  onTopupTypeChange(index: number, _: any): void {
    const d = this.targetGroupForm.selectedCategories[index].data;
    d.topupType = null; d.topupDays = null; d.topupFrom = null; d.topupTo = null;
  }

  onStatusChange(index: number, _: any): void {
    const d = this.targetGroupForm.selectedCategories[index].data;
    d.inactiveType = null; d.inactiveDays = null; d.inactiveFrom = null; d.inactiveTo = null;
  }

  onBrandLevelBrandChange(index: number, brandId: string): void {
    if (brandId && this.targetGroupForm.selectedCategories[index]) {
      this.targetGroupForm.selectedCategories[index].data.level = null;
      this.getBrandLevels(brandId);
    }
  }

  // ─── Build & validate request body ───────────────────────────────────────
  buildTargetRequestBody(): any {
    const form = this.targetGroupForm;
    let targetquery: any = { category: [] };

    const cats = form.selectedCategories;
    if (!cats.length || !cats[0]?.categoryId) {
      this.notification.showError('Validation', 'Please select at least one category'); return null;
    }

    const buildCategoryData = (cat: any): boolean => {
      switch (cat.categoryId) {
        case 'all': break;
        case 'age':
          if (!cat.data.operator) { this.notification.showError('Validation', 'Please select age operator'); return false; }
          if (cat.data.operator === 'between') {
            if (!cat.data.from || !cat.data.to) { this.notification.showError('Validation', 'Please enter age range'); return false; }
            targetquery.age = { operator: 'between', from: +cat.data.from, to: +cat.data.to };
          } else {
            if (!cat.data.value) { this.notification.showError('Validation', 'Please enter age value'); return false; }
            targetquery.age = { operator: cat.data.operator, value: +cat.data.value };
          }
          break;
        case 'birthday':
          if (!cat.data.selectedMonths?.length) { this.notification.showError('Validation', 'Please select at least one month'); return false; }
          if (!cat.data.selectedDates?.length) { this.notification.showError('Validation', 'Please select at least one date'); return false; }
          targetquery.birthday = { months: cat.data.selectedMonths, dates: cat.data.selectedDates };
          break;
        case 'gender':
          if (!cat.data.selectedGenders?.length) { this.notification.showError('Validation', 'Please select at least one gender'); return false; }
          targetquery.gender = cat.data.selectedGenders;
          break;
        case 'level':
          if (!cat.data.selectedLevels?.length) { this.notification.showError('Validation', 'Please select at least one level'); return false; }
          if (!cat.data.levelFrom || !cat.data.levelTo) { this.notification.showError('Validation', 'Please select level date range'); return false; }
          targetquery.level = { level: cat.data.selectedLevels[0], from: cat.data.levelFrom, to: cat.data.levelTo };
          break;
        case 'transactions':
          if (!cat.data.transactionType) { this.notification.showError('Validation', 'Please select transaction type'); return false; }
          if (cat.data.transactionType === 'nopurchase') {
            targetquery.category = targetquery.category.filter((c: string) => c !== 'transactions');
            targetquery.category.push('nopurchase');
            targetquery.nopurchase = {};
          } else {
            const key = cat.data.transactionType;
            targetquery.category = targetquery.category.filter((c: string) => c !== 'transactions');
            targetquery.category.push(key);
            if (!cat.data.repurchaseType) { this.notification.showError('Validation', 'Please select period type'); return false; }
            if (cat.data.repurchaseType === 'days') {
              if (!cat.data.repurchaseDays) { this.notification.showError('Validation', 'Please select days'); return false; }
              targetquery[key] = { type: 'days', value: cat.data.repurchaseDays };
            } else {
              if (!cat.data.repurchaseFrom || !cat.data.repurchaseTo) { this.notification.showError('Validation', 'Please select date range'); return false; }
              targetquery[key] = { type: 'range', from: cat.data.repurchaseFrom, to: cat.data.repurchaseTo };
            }
          }
          break;
        case 'topuptransactions':
          if (!cat.data.topupTransactionType) { this.notification.showError('Validation', 'Please select topup type'); return false; }
          if (cat.data.topupTransactionType === 'nevertopup') {
            targetquery.category = targetquery.category.filter((c: string) => c !== 'topuptransactions');
            targetquery.category.push('nevertopup');
            targetquery.nevertopup = {};
          } else {
            const key = cat.data.topupTransactionType;
            targetquery.category = targetquery.category.filter((c: string) => c !== 'topuptransactions');
            targetquery.category.push(key);
            if (!cat.data.topupType) { this.notification.showError('Validation', 'Please select period type'); return false; }
            if (cat.data.topupType === 'days') {
              if (!cat.data.topupDays) { this.notification.showError('Validation', 'Please select days'); return false; }
              targetquery[key] = { type: 'days', value: cat.data.topupDays };
            } else {
              if (!cat.data.topupFrom || !cat.data.topupTo) { this.notification.showError('Validation', 'Please select date range'); return false; }
              targetquery[key] = { type: 'range', from: cat.data.topupFrom, to: cat.data.topupTo };
            }
          }
          break;
        case 'status':
          if (!cat.data.status) { this.notification.showError('Validation', 'Please select user status'); return false; }
          const statusKey = cat.data.status;
          targetquery.category = targetquery.category.filter((c: string) => c !== 'status');
          targetquery.category.push(statusKey);
          if (!cat.data.inactiveType) { this.notification.showError('Validation', `Please select ${statusKey} period type`); return false; }
          if (cat.data.inactiveType === 'days') {
            if (!cat.data.inactiveDays) { this.notification.showError('Validation', `Please select ${statusKey} days`); return false; }
            targetquery[statusKey] = { type: 'days', value: cat.data.inactiveDays };
          } else {
            if (!cat.data.inactiveFrom || !cat.data.inactiveTo) { this.notification.showError('Validation', `Please select ${statusKey} date range`); return false; }
            targetquery[statusKey] = { type: 'range', from: cat.data.inactiveFrom, to: cat.data.inactiveTo };
          }
          break;
        case 'spending':
          if (!cat.data.operator || !cat.data.value) { this.notification.showError('Validation', 'Please enter spending criteria'); return false; }
          targetquery.spending = { operator: cat.data.operator, value: +cat.data.value, from: cat.data.spendingFrom, to: cat.data.spendingTo };
          break;
        case 'points':
          if (!cat.data.operator || !cat.data.value) { this.notification.showError('Validation', 'Please enter points criteria'); return false; }
          targetquery.points = { operator: cat.data.operator, value: +cat.data.value, from: cat.data.pointsFrom, to: cat.data.pointsTo };
          break;
        case 'pointsexpiry':
          if (!cat.data.expiryPeriod) { this.notification.showError('Validation', 'Please select expiry period'); return false; }
          targetquery.PointsExpired = { period: cat.data.expiryPeriod };
          break;
        case 'pointsbalance':
          if (!cat.data.operator || !cat.data.value) { this.notification.showError('Validation', 'Please enter points balance criteria'); return false; }
          targetquery.pointsbalance = { operator: cat.data.operator, value: +cat.data.value };
          break;
        case 'receivedpoints':
        case 'received':
          if (!cat.data.from || !cat.data.to || !cat.data.times) { this.notification.showError('Validation', 'Please enter received points criteria'); return false; }
          targetquery.received = { from: cat.data.from, to: cat.data.to, times: +cat.data.times };
          break;
        case 'joined':
          if (!cat.data.from || !cat.data.to) { this.notification.showError('Validation', 'Please select joined date range'); return false; }
          targetquery.joined = { from: cat.data.from, to: cat.data.to };
          break;
        case 'brandvisit':
          if (!cat.data.selectedBrand || !cat.data.from || !cat.data.to || !cat.data.limit) {
            this.notification.showError('Validation', 'Please complete brand visit fields'); return false;
          }
          targetquery.category = targetquery.category.filter((c: string) => c !== 'brandvisit');
          targetquery.category.push('brandvisits');
          targetquery.brandvisits = { brand: cat.data.selectedBrand, from: cat.data.from, to: cat.data.to, limit: +cat.data.limit };
          break;
        case 'brandlevel':
          if (!cat.data.brand_id || !cat.data.level || !cat.data.from || !cat.data.to) {
            this.notification.showError('Validation', 'Please complete brand level fields'); return false;
          }
          targetquery.brandlevel = { brand_id: cat.data.brand_id, level: cat.data.level, from: cat.data.from, to: cat.data.to };
          break;
        case 'brandreceived':
          if (!cat.data.brand_id || !cat.data.times || !cat.data.from || !cat.data.to) {
            this.notification.showError('Validation', 'Please complete brand received points fields'); return false;
          }
          targetquery.brandreceived = { brand_id: cat.data.brand_id, times: +cat.data.times, from: cat.data.from, to: cat.data.to };
          break;
      }
      return true;
    };

    for (const cat of cats) {
      if (!cat.categoryId && cat.categoryId !== 'all') { continue; }
      targetquery.category.push(cat.categoryId);
      if (!buildCategoryData(cat)) return null;
    }

    return {
      targetname: form.targetName,
      targetcategory: cats.map((c: any) => c.categoryId).filter(Boolean),
      targetquery: JSON.stringify(targetquery)
    };
  }

  // ─── populateFormForEdit (preserved 1:1 from legacy) ─────────────────────
  populateFormForEdit(target: any): void {
    this.targetGroupForm.targetName = target.targetname;
    let query: any;
    try { query = typeof target.targetquery === 'string' ? JSON.parse(target.targetquery) : target.targetquery; }
    catch { this.notification.showError('Error', 'Invalid target data'); return; }
    if (!query?.category) { this.notification.showError('Error', 'Invalid target data'); return; }

    const categoryIdMap: Record<string, string> = {
      repurchase: 'transactions', no_repurchase: 'transactions', nopurchase: 'transactions',
      topup: 'topuptransactions', notopup: 'topuptransactions', nevertopup: 'topuptransactions',
      inactive: 'status', active: 'status',
      spending: 'spending', receivedpoints: 'receivedpoints', pointsexpiry: 'pointsexpiry',
      brandvisit: 'brandvisit', brandvisits: 'brandvisit',
      all: 'all', age: 'age', birthday: 'birthday', gender: 'gender', joined: 'joined',
      level: 'level', pointsbalance: 'pointsbalance', brandlevel: 'brandlevel',
      brandreceived: 'brandreceived', transactions: 'transactions', status: 'status'
    };

    const mapped = query.category
      .map((id: string) => categoryIdMap[id] || id)
      .filter((id: string, idx: number, arr: string[]) => arr.indexOf(id) === idx);

    this.targetGroupForm.categorySelection = mapped.length === 1 ? 'single' : 'multiple';
    this.targetGroupForm.selectedCategories = [];

    mapped.forEach((formCatId: string) => {
      const cd: any = { categoryId: formCatId, data: {} };
      switch (formCatId) {
        case 'age':
          if (query.age) { cd.data.operator = query.age.operator; cd.data.from = query.age.from; cd.data.to = query.age.to; cd.data.value = query.age.value; }
          break;
        case 'birthday':
          if (query.birthday) { cd.data.selectedMonths = query.birthday.months || []; cd.data.selectedDates = (query.birthday.dates || []).map(String); }
          break;
        case 'gender': cd.data.selectedGenders = query.gender || []; break;
        case 'level':
          if (query.level) {
            if (typeof query.level === 'object' && query.level.level) {
              cd.data.selectedLevels = [query.level.level]; cd.data.levelFrom = query.level.from; cd.data.levelTo = query.level.to;
            } else if (Array.isArray(query.level)) { cd.data.selectedLevels = query.level; }
          }
          break;
        case 'transactions':
          if (query.category.includes('nopurchase')) { cd.data.transactionType = 'nopurchase'; }
          else if (query.category.includes('repurchase')) {
            cd.data.transactionType = 'repurchase';
            if (query.repurchase) { cd.data.repurchaseType = query.repurchase.type; cd.data.repurchaseDays = query.repurchase.value; cd.data.repurchaseFrom = query.repurchase.from; cd.data.repurchaseTo = query.repurchase.to; }
          } else if (query.category.includes('no_repurchase')) {
            cd.data.transactionType = 'no_repurchase';
            if (query.no_repurchase) { cd.data.repurchaseType = query.no_repurchase.type; cd.data.repurchaseDays = query.no_repurchase.value; cd.data.repurchaseFrom = query.no_repurchase.from; cd.data.repurchaseTo = query.no_repurchase.to; }
          }
          break;
        case 'topuptransactions':
          if (query.category.includes('nevertopup')) { cd.data.topupTransactionType = 'nevertopup'; }
          else if (query.category.includes('topup')) {
            cd.data.topupTransactionType = 'topup';
            if (query.topup) { cd.data.topupType = query.topup.type; cd.data.topupDays = query.topup.value; cd.data.topupFrom = query.topup.from; cd.data.topupTo = query.topup.to; }
          } else if (query.category.includes('notopup')) {
            cd.data.topupTransactionType = 'notopup';
            if (query.notopup) { cd.data.topupType = query.notopup.type; cd.data.topupDays = query.notopup.value; cd.data.topupFrom = query.notopup.from; cd.data.topupTo = query.notopup.to; }
          }
          break;
        case 'status':
          if (query.category.includes('active')) {
            cd.data.status = 'active';
            if (query.active) { cd.data.inactiveType = query.active.type; cd.data.inactiveDays = query.active.value; cd.data.inactiveFrom = query.active.from; cd.data.inactiveTo = query.active.to; }
          } else if (query.category.includes('inactive')) {
            cd.data.status = 'inactive';
            if (query.inactive) { cd.data.inactiveType = query.inactive.type; cd.data.inactiveDays = query.inactive.value; cd.data.inactiveFrom = query.inactive.from; cd.data.inactiveTo = query.inactive.to; }
          }
          break;
        case 'spending': if (query.spending) { cd.data.operator = query.spending.operator; cd.data.value = query.spending.value; cd.data.spendingFrom = query.spending.from; cd.data.spendingTo = query.spending.to; } break;
        case 'points': if (query.points) { cd.data.operator = query.points.operator; cd.data.value = query.points.value; cd.data.pointsFrom = query.points.from; cd.data.pointsTo = query.points.to; } break;
        case 'pointsexpiry':
          if (query.PointsExpired) cd.data.expiryPeriod = query.PointsExpired.period;
          else if (query.pointsexpiry) cd.data.expiryPeriod = query.pointsexpiry.expiryPeriod || query.pointsexpiry.period;
          break;
        case 'joined': if (query.joined) { cd.data.from = query.joined.from; cd.data.to = query.joined.to; } break;
        case 'pointsbalance': if (query.pointsbalance) { cd.data.operator = query.pointsbalance.operator; cd.data.value = query.pointsbalance.value; } break;
        case 'receivedpoints':
          const rp = query.received || query.receivedpoints;
          if (rp) { cd.data.from = rp.from; cd.data.to = rp.to; cd.data.times = rp.times; }
          break;
        case 'brandvisit':
          const bv = query.brandvisits || query.brandvisit;
          if (bv) { cd.data.selectedBrand = bv.brand || bv.selectedBrand; cd.data.from = bv.from; cd.data.to = bv.to; cd.data.limit = bv.limit; }
          break;
        case 'brandlevel': if (query.brandlevel) { cd.data.brand_id = query.brandlevel.brand_id; cd.data.level = query.brandlevel.level; cd.data.from = query.brandlevel.from; cd.data.to = query.brandlevel.to; this.getBrandLevels(query.brandlevel.brand_id); } break;
        case 'brandreceived': if (query.brandreceived) { cd.data.brand_id = query.brandreceived.brand_id; cd.data.times = query.brandreceived.times; cd.data.from = query.brandreceived.from; cd.data.to = query.brandreceived.to; } break;
      }
      this.targetGroupForm.selectedCategories.push(cd);
    });
  }

  // ─── UI actions ────
  createTargetGroup(): void {
    if (this.targetLimit?.targets_count >= this.targetLimit?.targets_limit) {
      this.notification.showError('Limit Reached', 'You have reached the target group limit');
      return;
    }
    this.getTargetLimit();
    this.isEditMode = false;
    this.editingGroupId = null;
    this.targetGroupForm = { targetName: '', categorySelection: 'single', selectedCategories: [] };
    this.addCategory();
    this.showTargetDialog = true;
  }

  onCardClick(group: any): void {
    this.router.navigate(['/crafted/retail/rfm-segmentation', group.targetId], { state: { group } });
  }

  editTargetGroup(group: any, e: MouseEvent): void {
    e.stopPropagation();
    this.isEditMode = true;
    this.isDefaultTarget = !!group.isDefault;
    this.editingGroupId = group.targetId;
    this.getTargetById(group.targetId);
    this.showTargetDialog = true;
  }

  confirmDelete(group: any, e: MouseEvent): void {
    e.stopPropagation();
    this.deletingGroup = group;
    this.showDeleteConfirm = true;
  }

  deleteTargetGroup(): void {
    if (this.deletingGroup) this.deleteTarget(this.deletingGroup.targetId);
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletingGroup = null;
  }

  saveTargetGroup(): void {
    if (!this.targetGroupForm.targetName?.trim()) {
      this.notification.showError('Validation', 'Please enter a target name'); return;
    }
    if (this.targetGroupForm.categorySelection === 'multiple') {
      const ids = this.targetGroupForm.selectedCategories.map((c: any) => c.categoryId).filter(Boolean);
      if (ids.length !== new Set(ids).size) { this.notification.showError('Validation', 'Duplicate categories detected'); return; }
    }
    const body = this.buildTargetRequestBody();
    if (!body) return;
    if (this.isEditMode && this.editingGroupId) {
      this.updateTarget(this.editingGroupId, body);
    } else {
      this.createTarget({ targetid: this.generateUniqueId('TGT'), ...body });
    }
  }

  resetForm(): void {
    this.targetGroupForm = { targetName: '', categorySelection: 'single', selectedCategories: [] };
  }

  cancelDialog(): void {
    this.showTargetDialog = false;
    this.resetForm();
    this.isEditMode = false;
    this.isDefaultTarget = false;
    this.editingGroupId = null;
  }

  generateUniqueId(prefix = 'TGT', length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return `${prefix}_${Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
  }

  getSelectedCategoryIds(): string[] {
    return this.targetGroupForm.selectedCategories.map((c: any) => c.categoryId).filter(Boolean);
  }
}