import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MultiSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-multiselect',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col relative" #container>
      <label *ngIf="label" class="text-sm font-medium text-gray-700 mb-1.5">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>

      <!-- Trigger Button -->
      <button
        type="button"
        (click)="toggleDropdown()"
        [disabled]="disabled"
        class="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        [class.border-blue-500]="isOpen"
      >
        <span class="truncate" [class.text-gray-400]="selected.length === 0">
          {{ getDisplayText() }}
        </span>
        <svg
          class="w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200"
          [class.rotate-180]="isOpen"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown -->
      <div
        *ngIf="isOpen"
        class="absolute z-[9999] bottom-full mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto"
      >
        <!-- Search -->
        <div *ngIf="searchable" class="p-2 border-b border-gray-100 sticky top-0 bg-white">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search..."
            class="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            (click)="$event.stopPropagation()"
          />
        </div>

        <!-- Select All -->
        <div *ngIf="showSelectAll && filteredOptions.length > 0"
          class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
          (click)="toggleAll()">
          <input type="checkbox"
            [checked]="isAllSelected()"
            [indeterminate]="isPartiallySelected()"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            (click)="$event.stopPropagation()" (change)="toggleAll()" />
          <span class="ml-3 text-sm font-medium text-gray-700">Select All</span>
        </div>

        <!-- Options -->
        <div *ngIf="filteredOptions.length === 0" class="px-3 py-4 text-sm text-gray-400 text-center">
          No options found
        </div>

        <label
          *ngFor="let option of filteredOptions"
          class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
        >
          <input
            type="checkbox"
            [checked]="isSelected(option.value)"
            (change)="toggleOption(option.value)"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <span class="ml-3 text-sm text-gray-700">{{ option.label }}</span>
        </label>
      </div>

      <p *ngIf="helperText" class="mt-1 text-xs text-gray-500">{{ helperText }}</p>
    </div>
  `
})
export class MultiselectComponent implements OnInit {
  @Input() options: MultiSelectOption[] = [];
  @Input() selected: string[] = [];
  @Input() label?: string;
  @Input() placeholder = 'Select options';
  @Input() helperText?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() searchable = false;
  @Input() showSelectAll = false;
  @Input() displayExpr?: string; // for object arrays
  @Input() valueExpr?: string;

  @Output() selectedChange = new EventEmitter<string[]>();
  @Output() selectionChanged = new EventEmitter<string[]>();

  isOpen = false;
  searchQuery = '';

  constructor(private elRef: ElementRef) {}

  ngOnInit(): void {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchQuery = '';
    }
  }

  get filteredOptions(): MultiSelectOption[] {
    if (!this.searchQuery.trim()) return this.options;
    const q = this.searchQuery.toLowerCase();
    return this.options.filter(o => o.label.toLowerCase().includes(q));
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) this.searchQuery = '';
  }

  toggleOption(value: string): void {
    const idx = this.selected.indexOf(value);
    const updated = idx === -1
      ? [...this.selected, value]
      : this.selected.filter(v => v !== value);
    this.selected = updated;
    this.selectedChange.emit(updated);
    this.selectionChanged.emit(updated);
  }

  toggleAll(): void {
    const updated = this.isAllSelected()
      ? []
      : this.filteredOptions.map(o => o.value);
    this.selected = updated;
    this.selectedChange.emit(updated);
    this.selectionChanged.emit(updated);
  }

  isSelected(value: string): boolean {
    return this.selected.includes(value);
  }

  isAllSelected(): boolean {
    return this.filteredOptions.length > 0 &&
      this.filteredOptions.every(o => this.selected.includes(o.value));
  }

  isPartiallySelected(): boolean {
    return this.selected.length > 0 && !this.isAllSelected();
  }

  getDisplayText(): string {
    if (this.selected.length === 0) return this.placeholder;
    if (this.selected.length === 1) {
      const opt = this.options.find(o => o.value === this.selected[0]);
      return opt ? opt.label : this.selected[0];
    }
    return `${this.selected.length} selected`;
  }
}