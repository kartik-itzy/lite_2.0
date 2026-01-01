import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
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
      <div
        *ngIf="config.searchable"
        class="p-4 border-b border-gray-200"
      >
        <div class="relative">
          <input
            type="text"
            [placeholder]="'Search...'"
            [value]="searchTerm"
            (input)="onSearch($event)"
            class="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
      <div
        *ngIf="config.loading"
        class="flex items-center justify-center p-8"
      >
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          <span class="text-sm text-gray-600">Loading...</span>
        </div>
      </div>

      <!-- Table -->
      <div
        *ngIf="!config.loading"
        class="table-container"
      >
        <table class="w-full">
          <!-- Header -->
          <thead class="table-header">
            <tr>
              <!-- Select All Checkbox -->
              <th
                *ngIf="config.selectable"
                class="table-cell"
              >
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
                [style.width]="column.width"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  
                  <!-- Sort Icon -->
                  <svg
                    *ngIf="column.sortable"
                    [class]="getSortIconClasses(column.key)"
                    class="w-4 h-4 text-gray-400"
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
              (click)="onRowClick(row)"
            >
              <!-- Select Row Checkbox -->
              <td
                *ngIf="config.selectable"
                class="table-cell"
              >
                <input
                  type="checkbox"
                  [checked]="isRowSelected(row)"
                  (change)="toggleRowSelection(row)"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>

              <!-- Row Data -->
              <td
                *ngFor="let column of columns"
                class="table-cell"
                [class]="getCellAlignment(column.align)"
              >
                <ng-content
                  [ngTemplateOutlet]="getCellTemplate(column.key)"
                  [ngTemplateOutletContext]="{ $implicit: row[column.key], row: row, column: column }"
                ></ng-content>
                <span *ngIf="!getCellTemplate(column.key)">{{ row[column.key] }}</span>
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
          <p class="mt-2 text-sm text-gray-500">{{ config.emptyMessage || 'No data available' }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div
        *ngIf="config.pagination && totalPages > 1"
        class="px-4 py-3 border-t border-gray-200 bg-gray-50"
      >
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalItems }} results
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
  styles: [`
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
    }
    
    .table-row:hover {
      background-color: #f9fafb;
    }
    
    .table-cell {
      padding: 0.75rem 1rem;
      text-align: left;
      vertical-align: middle;
    }
    
    .table-cell.text-center {
      text-align: center;
    }
    
    .table-cell.text-right {
      text-align: right;
    }
  `]
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
  @Output() sort = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

  selectedRows: Set<string | number> = new Set();
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredRows(): TableRow[] {
    let filtered = this.rows;
    
    if (this.searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
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
    return this.filteredRows.length > 0 && this.selectedRows.size === this.filteredRows.length;
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

  get tableClasses(): string {
    const baseClasses = 'min-w-full divide-y divide-gray-200';
    return baseClasses;
  }

  get headerClasses(): string {
    return 'bg-gray-50';
  }

  get bodyClasses(): string {
    return 'bg-white divide-y divide-gray-200';
  }

  get headerCellClasses(): string {
    return 'px-4 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider';
  }

  get bodyCellClasses(): string {
    return 'px-4 py-3 text-sm text-gray-900';
  }

  getRowClasses(row: TableRow): string {
    const baseClasses = 'hover:bg-gray-50 transition-colors duration-200';
    const selectedClass = this.isRowSelected(row) ? 'bg-primary-50' : '';
    return `${baseClasses} ${selectedClass}`;
  }

  getCellAlignment(align?: string): string {
    const alignmentClasses: Record<string, string> = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    return alignmentClasses[align || 'left'];
  }

  getSortIconClasses(columnKey: string): string {
    if (this.sortColumn !== columnKey) {
      return 'text-gray-400';
    }
    return this.sortDirection === 'asc' ? 'text-primary-600 rotate-180' : 'text-primary-600';
  }

  getPageButtonClasses(page: number): string {
    const baseClasses = 'border border-gray-300 hover:bg-gray-50';
    const activeClasses = 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700';
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

  getCellTemplate(columnKey: string): any {
    return null;
  }

  trackByRow(index: number, row: TableRow): string | number {
    return row['id'];
  }

  onRowClick(row: TableRow): void {
    this.rowClick.emit(row);
  }

  toggleRowSelection(row: TableRow): void {
    if (this.selectedRows.has(row['id'])) {
      this.selectedRows.delete(row['id']);
    } else {
      this.selectedRows.add(row['id']);
    }
    this.emitSelectionChange();
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedRows.clear();
    } else {
      this.filteredRows.forEach(row => this.selectedRows.add(row['id']));
    }
    this.emitSelectionChange();
  }

  isRowSelected(row: TableRow): boolean {
    return this.selectedRows.has(row['id']);
  }

  emitSelectionChange(): void {
    const selectedRows = this.rows.filter(row => this.selectedRows.has(row['id']));
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
    this.pageChange.emit(page);
  }
} 