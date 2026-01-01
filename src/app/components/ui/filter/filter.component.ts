import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button 
          *ngFor="let filter of filters"
          [class]="selectedFilter === filter.value ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          (click)="onFilterChange(filter.value)"
        >
          {{ filter.label }}
          <span *ngIf="filter.count !== undefined" class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
            {{ filter.count }}
          </span>
        </button>
      </nav>
    </div>
  `,
  styles: []
})
export class FilterComponent {
  @Input() filters: FilterOption[] = [];
  @Input() selectedFilter: string = '';
  @Output() filterChange = new EventEmitter<string>();

  onFilterChange(filterValue: string): void {
    this.filterChange.emit(filterValue);
  }
} 