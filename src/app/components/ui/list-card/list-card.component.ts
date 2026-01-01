import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ListItem {
  id: string;
  label: string;
  value?: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
  action?: {
    label: string;
    color?: string;
    onClick?: () => void;
  };
}

export interface ListCardData {
  title: string;
  subtitle?: string;
  items: ListItem[];
  showHeader?: boolean;
  showFooter?: boolean;
  footerText?: string;
  footerLink?: string;
}

@Component({
  selector: 'app-list-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div *ngIf="data.showHeader !== false" class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
        <p *ngIf="data.subtitle" class="text-sm text-gray-600">{{ data.subtitle }}</p>
      </div>
      
      <div class="space-y-3">
        <div *ngFor="let item of data.items" class="flex justify-between items-center">
          <div class="flex items-center">
            <div *ngIf="item.color" class="w-3 h-3 rounded mr-2" [ngClass]="item.color"></div>
            <span class="text-sm">{{ item.label }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span *ngIf="item.value" class="text-sm font-medium">{{ item.value }}</span>
            <button 
              *ngIf="item.action" 
              class="text-sm font-medium hover:underline"
              [ngClass]="item.action.color || 'text-blue-600 hover:text-blue-800'"
              (click)="onItemAction(item)">
              {{ item.action.label }}
            </button>
          </div>
        </div>
      </div>
      
      <div *ngIf="data.showFooter && data.footerText" class="mt-3 pt-4 border-t">
        <a 
          *ngIf="data.footerLink" 
          [href]="data.footerLink" 
          class="text-blue-600 hover:text-blue-800 text-sm">
          {{ data.footerText }}
        </a>
        <span *ngIf="!data.footerLink" class="text-sm text-gray-600">
          {{ data.footerText }}
        </span>
      </div>
    </div>
  `,
  styles: []
})
export class ListCardComponent {
  @Input() data!: ListCardData;
  @Output() itemAction = new EventEmitter<ListItem>();

  onItemAction(item: ListItem) {
    if (item.action?.onClick) {
      item.action.onClick();
    }
    this.itemAction.emit(item);
  }
} 