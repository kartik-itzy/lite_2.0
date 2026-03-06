import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  TemplateRef,
  Directive,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeVariant } from '../badge/badge.component';

@Directive({
  selector: '[appTableCell]',
  standalone: true,
})
export class TableCellDirective {
  @Input('appTableCell') columnKey!: string;
  constructor(public template: TemplateRef<any>) {}
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  transform?: 'date' | 'uppercase' | 'lowercase' | 'capitalize' | 'currency' | 'custom';
  transformOptions?: {
    dateFormat?: 'short' | 'medium' | 'long' | 'custom';
    customDateFormat?: string;
    currencyCode?: string;
    customTransform?: (value: any) => string;
  };
}

export interface TableRow {
  [key: string]: any;
}

export interface TableConfig {
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  searchable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden bg-white rounded-lg border border-gray-200">

      <!-- Search Bar -->
      <div *ngIf="config.searchable" class="p-4 border-b border-gray-200">
        <div class="relative">
          <input
            type="text"
            placeholder="Search..."
            [value]="internalSearchTerm"
            (input)="onSearch($event)"
            class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50
                   focus:outline-none focus:border-blue-500 focus:bg-white
                   focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="config.loading" class="flex items-center justify-center p-8">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span class="text-sm text-gray-600">Loading...</span>
        </div>
      </div>

      <!-- Table -->
      <div *ngIf="!config.loading" class="table-container">
        <table class="w-full">

          <!-- Header -->
          <thead class="table-header">
            <tr>
              <th *ngIf="config.selectable" class="table-cell">
                <input
                  type="checkbox"
                  [checked]="allSelected"
                  (change)="toggleSelectAll()"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th
                *ngFor="let column of columns"
                class="table-cell font-medium text-gray-900"
                [class.text-center]="column.align === 'center'"
                [class.text-right]="column.align === 'right'"
                [style.width]="column.width"
              >
                <div
                  class="flex items-center space-x-1"
                  [class.justify-center]="column.align === 'center'"
                  [class.justify-end]="column.align === 'right'"
                >
                  <span>{{ column.label }}</span>
                  <svg
                    *ngIf="column.sortable"
                    [class]="getSortIconClasses(column.key)"
                    class="w-4 h-4 text-gray-400 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    (click)="onSort(column)"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr
              *ngFor="let row of displayedRows; trackBy: trackByRow"
              class="table-row"
              [class.selected-row]="isRowSelected(row)"
              (click)="onRowClick(row)"
            >
              <td *ngIf="config.selectable" class="table-cell">
                <input
                  type="checkbox"
                  [checked]="isRowSelected(row)"
                  (change)="toggleRowSelection(row)"
                  (click)="$event.stopPropagation()"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td
                *ngFor="let column of columns"
                class="table-cell"
                [class]="getCellAlignment(column.align)"
              >
                <ng-container *ngIf="getCellTemplate(column.key) as template; else defaultCell">
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="{
                      $implicit: getTransformedValue(row[column.key], column),
                      row: row,
                      column: column,
                      value: row[column.key],
                      originalValue: row[column.key]
                    }"
                  />
                </ng-container>
                <ng-template #defaultCell>
                  <span>{{ getTransformedValue(row[column.key], column) }}</span>
                </ng-template>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="displayedRows.length === 0 && !config.loading" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-2 text-sm text-gray-500">{{ config.emptyMessage || 'No data available' }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="config.pagination && effectiveTotalPages > 1"
           class="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">

          <div class="text-sm text-gray-700">
            Showing {{ paginationStart }} to {{ paginationEnd }} of {{ effectiveTotalItems }} results
          </div>

          <div class="flex items-center space-x-2">
            <button
              [disabled]="currentPage === 1"
              (click)="previousPage()"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <div class="flex items-center space-x-1">
              <button
                *ngFor="let page of getPageNumbers()"
                [class]="getPageButtonClasses(page)"
                (click)="goToPage(page)"
                class="px-3 py-1 text-sm rounded-md"
              >
                {{ page }}
              </button>
            </div>

            <button
              [disabled]="currentPage === effectiveTotalPages"
              (click)="nextPage()"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .table-container { overflow-x: auto; }
    .table-header { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .table-row {
      border-bottom: 1px solid #f3f4f6;
      transition: background-color 0.15s ease-in-out;
      cursor: pointer;
    }
    .table-row:hover { background-color: #f9fafb; }
    .table-cell {
      padding: 0.75rem 1rem;
      text-align: left;
      vertical-align: middle;
      height: 60px;
    }
    .table-cell.text-center { text-align: center; }
    .table-cell.text-right  { text-align: right; }
    .selected-row { background-color: #eff6ff; }
    .table-cell > * { display: flex; align-items: center; min-height: 100%; }
  `],
})
export class TableComponent implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() rows: TableRow[] = [];
  @Input() config: TableConfig = {};

  /**
   * Current page (1-based).
   * - Server-side: parent controls and passes this back in on each fetch.
   * - Client-side: managed entirely inside the component.
   */
  @Input() currentPage = 1;

  /**
   * Rows per page. Falls back to config.pageSize if not explicitly set.
   */
  @Input() pageSize = 10;

  /**
   * Total records across ALL pages (from the API response).
   *
   * SERVER-SIDE: pass response.pagination.total_records (or equivalent).
   *   The table renders rows[] as-is — no local slicing, no local filtering.
   *
   * CLIENT-SIDE: omit or leave at 0.
   *   The table filters and slices rows[] itself.
   */
  @Input() totalItems = 0;

  @Output() rowClick   = new EventEmitter<TableRow>();
  @Output() rowSelect  = new EventEmitter<TableRow[]>();
  @Output() sort       = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() search     = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  @ContentChildren(TableCellDirective) cellTemplates!: QueryList<TableCellDirective>;

  selectedRows: Set<string | number> = new Set();
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  /**
   * Internal search term — only used in client-side mode.
   * In server-side mode the search event is emitted to the parent instead.
   */
  internalSearchTerm = '';

  // ── OnChanges ─────────────────────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    // When new rows arrive from the server, Angular re-renders automatically via
    // the displayedRows getter. No extra work needed here.
    // If rows reset (e.g. after a search), also reset internal page tracking.
    if (changes['rows'] && !changes['rows'].firstChange && !this.isServerSide) {
      this.currentPage = 1;
    }
  }

  // ── Mode detection ────────────────────────────────────────────────────────────
  private get isServerSide(): boolean {
    return this.totalItems > 0;
  }

  // ── Page size ─────────────────────────────────────────────────────────────────
  private get resolvedPageSize(): number {
    return this.pageSize || this.config.pageSize || 10;
  }

  // ── Effective totals ──────────────────────────────────────────────────────────
  get effectiveTotalItems(): number {
    return this.isServerSide ? this.totalItems : this.localFilteredRows.length;
  }

  get effectiveTotalPages(): number {
    return Math.ceil(this.effectiveTotalItems / this.resolvedPageSize);
  }

  // ── Row sets ──────────────────────────────────────────────────────────────────

  /** Client-side filtered rows (search applied). Never used in server-side mode. */
  get localFilteredRows(): TableRow[] {
    if (!this.internalSearchTerm) return this.rows;
    const term = this.internalSearchTerm.toLowerCase();
    return this.rows.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(term))
    );
  }

  /**
   * Rows rendered in the <tbody>.
   *
   * SERVER-SIDE → return rows[] directly.
   *   The parent already fetched exactly one page from the API.
   *   Do NOT filter or slice here.
   *
   * CLIENT-SIDE → filter then slice the local array.
   */
  get displayedRows(): TableRow[] {
    if (this.isServerSide) {
      return this.rows;
    }
    const start = (this.currentPage - 1) * this.resolvedPageSize;
    return this.localFilteredRows.slice(start, start + this.resolvedPageSize);
  }

  // ── Pagination helpers ────────────────────────────────────────────────────────
  get paginationStart(): number {
    return this.effectiveTotalItems === 0
      ? 0
      : (this.currentPage - 1) * this.resolvedPageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(this.currentPage * this.resolvedPageSize, this.effectiveTotalItems);
  }

  get allSelected(): boolean {
    return (
      this.displayedRows.length > 0 &&
      this.displayedRows.every(row => this.selectedRows.has(row['id'] ?? row))
    );
  }

  // ── Cell template lookup ──────────────────────────────────────────────────────
  getCellTemplate(columnKey: string): TemplateRef<any> | null {
    if (!this.cellTemplates) return null;
    const t = this.cellTemplates.find(t => t.columnKey === columnKey);
    return t ? t.template : null;
  }

  getBadgeVariant(status: string): BadgeVariant {
    const map: Record<string, BadgeVariant> = {
      MERGED: 'success', APPROVAL: 'warning', OPEN: 'info',
      REJECTED: 'danger', PENDING: 'secondary',
    };
    return map[status?.toUpperCase()] || 'light';
  }

  // ── Value transforms ──────────────────────────────────────────────────────────
  getTransformedValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) return '';
    if (!column.transform) return String(value);
    switch (column.transform) {
      case 'date':       return this.transformDate(value, column.transformOptions);
      case 'uppercase':  return String(value).toUpperCase();
      case 'lowercase':  return String(value).toLowerCase();
      case 'capitalize': return this.capitalizeWords(String(value));
      case 'currency':   return this.transformCurrency(value, column.transformOptions?.currencyCode || 'USD');
      case 'custom':     return column.transformOptions?.customTransform?.(value) ?? String(value);
      default:           return String(value);
    }
  }

  private transformDate(value: any, options?: TableColumn['transformOptions']): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    switch (options?.dateFormat || 'short') {
      case 'short':  return this.formatDateShort(date);
      case 'medium': return date.toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' });
      case 'long':   return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      case 'custom': return this.formatCustomDate(date, options?.customDateFormat || 'dd MMM yy');
      default:       return this.formatDateShort(date);
    }
  }

  private formatDateShort(date: Date): string {
    return `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear().toString().slice(-2)}`;
  }

  private formatCustomDate(date: Date, format: string): string {
    return format
      .replace('dd',   date.getDate().toString().padStart(2, '0'))
      .replace('d',    date.getDate().toString())
      .replace('MMM',  date.toLocaleDateString('en-US', { month: 'short' }))
      .replace('yyyy', date.getFullYear().toString())
      .replace('yy',   date.getFullYear().toString().slice(-2));
  }

  private capitalizeWords(value: string): string {
    return value.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  private transformCurrency(value: any, currencyCode: string): string {
    const num = parseFloat(value);
    return isNaN(num)
      ? String(value)
      : new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(num);
  }

  // ── Styling helpers ───────────────────────────────────────────────────────────
  getCellAlignment(align?: string): string {
    return ({ left: 'text-left', center: 'text-center', right: 'text-right' } as Record<string, string>)[align || 'left'];
  }

  getSortIconClasses(columnKey: string): string {
    return this.sortColumn === columnKey
      ? (this.sortDirection === 'asc' ? 'text-primary-600 rotate-180' : 'text-primary-600')
      : 'text-gray-400';
  }

  getPageButtonClasses(page: number): string {
    return page === this.currentPage
      ? 'bg-primary-600 text-white border border-primary-600 hover:bg-primary-700'
      : 'border border-gray-300 hover:bg-gray-50';
  }

  getPageNumbers(): number[] {
    const total = this.effectiveTotalPages;
    const maxVisible = 5;
    const pages: number[] = [];
    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end   = Math.min(total, start + maxVisible - 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }

  // ── Events ────────────────────────────────────────────────────────────────────
  trackByRow(index: number, row: TableRow): string | number {
    return row['id'] ?? index;
  }

  onRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }

  toggleRowSelection(row: TableRow): void {
    const id = row['id'] ?? row;
    this.selectedRows.has(id) ? this.selectedRows.delete(id) : this.selectedRows.add(id);
    this.emitSelectionChange();
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedRows.clear();
    } else {
      this.displayedRows.forEach(row => this.selectedRows.add(row['id'] ?? row));
    }
    this.emitSelectionChange();
  }

  isRowSelected(row: TableRow): boolean {
    return this.selectedRows.has(row['id'] ?? row);
  }

  emitSelectionChange(): void {
    this.rowSelect.emit(this.rows.filter(row => this.selectedRows.has(row['id'] ?? row)));
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;
    this.sortDirection = this.sortColumn === column.key && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortColumn = column.key;
    this.sort.emit({ column: column.key, direction: this.sortDirection });
  }

  /**
   * Search handler.
   *
   * SERVER-SIDE: emit the search term to the parent so it can re-fetch with a
   *   search/filter param. The parent should reset its currentPage to 1 and
   *   re-call the API.
   *
   * CLIENT-SIDE: set internalSearchTerm; displayedRows getter re-computes.
   */
  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.internalSearchTerm = term;
    this.currentPage = 1;

    if (this.isServerSide) {
      this.search.emit(term);
      // NOTE: do NOT emit pageChange here — let the parent decide whether
      // to support server-side search. The parent can listen to (search) and
      // re-fetch with the term + page=1.
    }
    // Client-side: no emit needed; the localFilteredRows getter handles it.
  }

  previousPage(): void {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.effectiveTotalPages) this.goToPage(this.currentPage + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.pageChange.emit(page);
  }
}