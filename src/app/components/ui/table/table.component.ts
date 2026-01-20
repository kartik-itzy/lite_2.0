// First, update your TableComponent to support custom cell templates
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChildren,
  QueryList,
  TemplateRef,
  Directive,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeVariant } from '../badge/badge.component';

// Add a directive to identify custom cell templates
@Directive({
  selector: '[appTableCell]',
  standalone:true
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
  transform?:
    | 'date'
    | 'uppercase'
    | 'lowercase'
    | 'capitalize'
    | 'currency'
    | 'custom';
  transformOptions?: {
    dateFormat?: 'short' | 'medium' | 'long' | 'custom';
    customDateFormat?: string; // e.g., 'dd MMM yy'
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

// Update your TableComponent
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
            [placeholder]="'Search...'"
            [value]="searchTerm"
            (input)="onSearch($event)"
            class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          />
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <svg
              class="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="config.loading" class="flex items-center justify-center p-8">
        <div class="flex items-center space-x-2">
          <div
            class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"
          ></div>
          <span class="text-sm text-gray-600">Loading...</span>
        </div>
      </div>

      <!-- Table -->
      <div *ngIf="!config.loading" class="table-container">
        <table class="w-full">
          <!-- Header -->
          <thead class="table-header">
            <tr>
              <!-- Select All Checkbox -->
              <th *ngIf="config.selectable" class="table-cell">
                <input
                  type="checkbox"
                  [checked]="allSelected"
                  (change)="toggleSelectAll()"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>

              <!-- Column Headers -->
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

                  <!-- Sort Icon -->
                  <svg
                    *ngIf="column.sortable"
                    [class]="getSortIconClasses(column.key)"
                    class="w-4 h-4 text-gray-400 cursor-pointer"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    (click)="onSort(column)"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    ></path>
                  </svg>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr
              *ngFor="let row of filteredRows; trackBy: trackByRow"
              class="table-row"
              [class.selected-row]="isRowSelected(row)"
              (click)="onRowClick(row)"
            >
              <!-- Select Row Checkbox -->
              <td *ngIf="config.selectable" class="table-cell">
                <input
                  type="checkbox"
                  [checked]="isRowSelected(row)"
                  (change)="toggleRowSelection(row)"
                  (click)="$event.stopPropagation()"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>

              <!-- Row Data -->
              <td
                *ngFor="let column of columns"
                class="table-cell"
                [class]="getCellAlignment(column.align)"
              >
                <!-- Custom Template if available -->
                <ng-container
                  *ngIf="
                    getCellTemplate(column.key) as template;
                    else defaultCell
                  "
                >
                  <ng-container
                    [ngTemplateOutlet]="template"
                    [ngTemplateOutletContext]="{
                      $implicit: getTransformedValue(row[column.key], column),
                      row: row,
                      column: column,
                      value: row[column.key],
                      originalValue: row[column.key]
                    }"
                  ></ng-container>
                </ng-container>

                <!-- Default Cell Content -->
                <ng-template #defaultCell>
                  <span>{{
                    getTransformedValue(row[column.key], column)
                  }}</span>
                </ng-template>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div
          *ngIf="filteredRows.length === 0 && !config.loading"
          class="text-center py-8"
        >
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500">
            {{ config.emptyMessage || 'No data available' }}
          </p>
        </div>
      </div>

      <!-- Pagination -->
      <div
        *ngIf="config.pagination && totalPages > 1"
        class="px-4 py-3 border-t border-gray-200 bg-gray-50"
      >
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of
            {{ totalItems }} results
          </div>

          <div class="flex items-center space-x-2">
            <button
              [disabled]="currentPage === 1"
              (click)="previousPage()"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
              [disabled]="currentPage === totalPages"
              (click)="nextPage()"
              class="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .table-container {
        overflow-x: auto;
      }

      .table-header {
        background-color: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
      }

      .table-row {
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.15s ease-in-out;
        cursor: pointer;
      }

      .table-row:hover {
        background-color: #f9fafb;
      }

      .table-cell {
        padding: 0.75rem 1rem;
        text-align: left;
        vertical-align: middle;
        height: 60px; /* Add fixed height */
      }

      .table-cell.text-center {
        text-align: center;
      }

      .table-cell.text-right {
        text-align: right;
      }

      .selected-row {
        background-color: #eff6ff;
      }

      /* Ensure content inside cells is vertically centered */
      .table-cell > * {
        display: flex;
        align-items: center;
        min-height: 100%;
      }
    `,
  ],
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() rows: TableRow[] = [];
  @Input() config: TableConfig = {};
  @Input() searchTerm = '';
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;

  @Output() rowClick = new EventEmitter<TableRow>();
  @Output() rowSelect = new EventEmitter<TableRow[]>();
  @Output() sort = new EventEmitter<{
    column: string;
    direction: 'asc' | 'desc';
  }>();
  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  @ContentChildren(TableCellDirective)
  cellTemplates!: QueryList<TableCellDirective>;

  selectedRows: Set<string | number> = new Set();
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredRows(): TableRow[] {
    let filtered = this.rows;

    if (this.searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(this.searchTerm.toLowerCase())
        )
      );
    }

    if (this.config.pagination) {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      filtered = filtered.slice(start, end);
    }

    return filtered;
  }

  get allSelected(): boolean {
    return (
      this.filteredRows.length > 0 &&
      this.selectedRows.size === this.filteredRows.length
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.totalItems);
  }

  // Updated method to get custom cell templates
  getCellTemplate(columnKey: string): TemplateRef<any> | null {
    if (!this.cellTemplates) return null;

    const template = this.cellTemplates.find((t) => t.columnKey === columnKey);
    return template ? template.template : null;
  }

  // Helper method to get badge variant based on status
  getBadgeVariant(status: string): BadgeVariant {
    const statusMap: Record<string, BadgeVariant> = {
      MERGED: 'success',
      APPROVAL: 'warning',
      Open: 'info',
      REJECTED: 'danger',
      PENDING: 'secondary',
    };
    return statusMap[status.toUpperCase()] || 'light';
  }

  /**
   * Transform cell value based on column configuration
   */
  getTransformedValue(value: any, column: TableColumn): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (!column.transform) {
      return String(value);
    }

    switch (column.transform) {
      case 'date':
        return this.transformDate(value, column.transformOptions);

      case 'uppercase':
        return String(value).toUpperCase();

      case 'lowercase':
        return String(value).toLowerCase();

      case 'capitalize':
        return this.capitalizeWords(String(value));

      case 'currency':
        return this.transformCurrency(
          value,
          column.transformOptions?.currencyCode || 'USD'
        );

      case 'custom':
        return column.transformOptions?.customTransform
          ? column.transformOptions.customTransform(value)
          : String(value);

      default:
        return String(value);
    }
  }

  private transformDate(
    value: any,
    options?: TableColumn['transformOptions']
  ): string {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return String(value);
    }

    const format = options?.dateFormat || 'short';

    switch (format) {
      case 'short':
        return this.formatDateShort(date);

      case 'medium':
        return date.toLocaleDateString('en-US', {
          year: '2-digit',
          month: 'short',
          day: 'numeric',
        });

      case 'long':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'custom':
        return this.formatCustomDate(
          date,
          options?.customDateFormat || 'dd MMM yy'
        );

      default:
        return this.formatDateShort(date);
    }
  }

  private formatDateShort(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  }

  private formatCustomDate(date: Date, format: string): string {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    const fullYear = date.getFullYear();

    return format
      .replace('dd', day.toString().padStart(2, '0'))
      .replace('d', day.toString())
      .replace('MMM', month)
      .replace('yyyy', fullYear.toString())
      .replace('yy', year);
  }

  private capitalizeWords(value: string): string {
    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private transformCurrency(value: any, currencyCode: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return String(value);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(num);
  }

  getCellAlignment(align?: string): string {
    const alignmentClasses: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };
    return alignmentClasses[align || 'left'];
  }

  getSortIconClasses(columnKey: string): string {
    if (this.sortColumn !== columnKey) {
      return 'text-gray-400';
    }
    return this.sortDirection === 'asc'
      ? 'text-primary-600 rotate-180'
      : 'text-primary-600';
  }

  getPageButtonClasses(page: number): string {
    const baseClasses = 'border border-gray-300 hover:bg-gray-50';
    const activeClasses =
      'bg-primary-600 text-white border-primary-600 hover:bg-primary-700';
    return page === this.currentPage ? activeClasses : baseClasses;
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  trackByRow(index: number, row: TableRow): string | number {
    return row['id'] || index;
  }

  onRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }

  toggleRowSelection(row: TableRow): void {
    const rowId = row['id'] || row;
    if (this.selectedRows.has(rowId)) {
      this.selectedRows.delete(rowId);
    } else {
      this.selectedRows.add(rowId);
    }
    this.emitSelectionChange();
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedRows.clear();
    } else {
      this.filteredRows.forEach((row) => {
        const rowId = row['id'] || row;
        this.selectedRows.add(rowId);
      });
    }
    this.emitSelectionChange();
  }

  isRowSelected(row: TableRow): boolean {
    const rowId = row['id'] || row;
    return this.selectedRows.has(rowId);
  }

  emitSelectionChange(): void {
    const selectedRows = this.rows.filter((row) => {
      const rowId = row['id'] || row;
      return this.selectedRows.has(rowId);
    });
    this.rowSelect.emit(selectedRows);
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.sort.emit({ column: column.key, direction: this.sortDirection });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.search.emit(target.value);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;     
    this.pageChange.emit(page);
  }
}
