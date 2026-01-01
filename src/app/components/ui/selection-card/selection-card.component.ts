import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectableItem {
  id: string;
  name: string;
  duration?: string;
  price?: string;
  description?: string;
  isPopular?: boolean;
  metadata?: Record<string, any>;
}

export interface SelectionCardConfig {
  item: SelectableItem;
  selected?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showPopularBadge?: boolean;
  showDuration?: boolean;
  showPrice?: boolean;
}

@Component({
  selector: 'app-selection-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
      [class]="getCardClasses()"
      (click)="onSelect()"
    >
      <!-- Popular Badge -->
      <div 
        *ngIf="config.showPopularBadge && config.item.isPopular"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3"
      >
        Popular
      </div>

      <!-- Item Header -->
      <div class="flex items-start justify-between mb-3">
        <h4 class="font-medium text-gray-900">
          {{ config.item.name }}
        </h4>
        
        <!-- Selection Indicator -->
        <div 
          *ngIf="config.selected"
          class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
        >
          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>

      <!-- Item Details -->
      <div class="space-y-2">
        <!-- Duration -->
        <div 
          *ngIf="config.showDuration && config.item.duration"
          class="flex items-center text-sm text-gray-600"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {{ config.item.duration }}
        </div>

        <!-- Price -->
        <div 
          *ngIf="config.showPrice && config.item.price"
          class="flex items-center text-sm font-medium text-gray-900"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
          {{ config.item.price }}
        </div>

        <!-- Description -->
        <p 
          *ngIf="config.item.description && config.variant === 'detailed'"
          class="text-sm text-gray-500 mt-2"
        >
          {{ config.item.description }}
        </p>
      </div>

      <!-- Left Border Indicator -->
      <div 
        *ngIf="config.selected"
        class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-lg"
      ></div>
    </div>
  `,
  styles: []
})
export class SelectionCardComponent {
  @Input() config: SelectionCardConfig = {
    item: {
      id: '',
      name: ''
    }
  };

  @Output() selectItem = new EventEmitter<SelectableItem>();

  getCardClasses(): string {
    const baseClasses = 'relative border-gray-200 hover:border-blue-300';
    const selectedClasses = this.config.selected 
      ? 'border-blue-600 bg-blue-50' 
      : 'hover:bg-gray-50';
    
    return `${baseClasses} ${selectedClasses}`;
  }

  onSelect(): void {
    this.selectItem.emit(this.config.item);
  }
} 