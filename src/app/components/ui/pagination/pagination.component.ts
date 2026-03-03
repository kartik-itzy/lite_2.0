import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  showPageNumbers?: boolean;
  showItemsPerPage?: boolean;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <!-- Items per page and total info -->
      <div class="flex items-center space-x-4">
        <div class="text-sm text-gray-700">
          Showing 
          <span class="font-medium">{{ startItem }}</span>
          to 
          <span class="font-medium">{{ endItem }}</span>
          of 
          <span class="font-medium">{{ config.totalItems }}</span>
          results
        </div>
        
        <div *ngIf="config.showItemsPerPage" class="flex items-center space-x-2">
          <label class="text-sm text-gray-700">Items per page:</label>
          <select 
            [value]="config.itemsPerPage"
            (change)="onItemsPerPageChange($event)"
            class="text-sm border-gray-300 rounded-md px-2 py-1"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <!-- Pagination controls -->
      <div class="flex items-center space-x-2">
        <!-- Previous button -->
        <button
          (click)="onPageChange(config.currentPage - 1)"
          [disabled]="config.currentPage <= 1"
          class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <!-- Page numbers -->
        <div *ngIf="config.showPageNumbers" class="flex items-center space-x-1">
          <ng-container *ngFor="let page of visiblePages">
            <button
              *ngIf="page !== '...'"
              (click)="onPageChange(page)"
              [class]="page === config.currentPage 
                ? 'relative inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-md'
                : 'relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'"
            >
              {{ page }}
            </button>
            <span 
              *ngIf="page === '...'"
              class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 r  ounded-md"
            >
              ...
            </span>
          </ng-container>
        </div>

        <!-- Next button -->
        <button
          (click)="onPageChange(config.currentPage + 1)"
          [disabled]="config.currentPage >= config.totalPages"
          class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class PaginationComponent {
  @Input() config!: PaginationConfig;
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  get startItem(): number {
    return (this.config.currentPage - 1) * this.config.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.config.currentPage * this.config.itemsPerPage, this.config.totalItems);
  }

  get visiblePages(): (number | string)[] {
    const totalPages = this.config.totalPages;
    const currentPage = this.config.currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }

  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.config.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const itemsPerPage = parseInt(select.value);
    this.itemsPerPageChange.emit(itemsPerPage);
  }
} 