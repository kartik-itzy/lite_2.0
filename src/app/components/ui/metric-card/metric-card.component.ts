import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MetricCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
        <div *ngIf="data.icon" class="flex items-center">
          <svg class="w-5 h-5" [ngClass]="data.iconColor || 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
            <path [attr.d]="data.icon"></path>
          </svg>
        </div>
      </div>
      
      <div class="space-y-4 mb-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">{{ data.subtitle || 'TOTAL' }}</span>
          <div class="flex items-center">
            <span class="text-lg font-bold text-gray-900 mr-2">{{ data.value }}</span>
            <div *ngIf="data.trend" class="flex items-center" [ngClass]="data.trend.isPositive ? 'text-green-600' : 'text-red-600'">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path *ngIf="data.trend.isPositive" fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L12 7z" clip-rule="evenodd"/>
                <path *ngIf="!data.trend.isPositive" fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L12 13z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm">{{ data.trend.value }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex-1">
        <ng-content></ng-content>
      </div>
      
      <div *ngIf="data.description" class="mt-4 text-center">
        <p class="text-sm text-gray-600">{{ data.description }}</p>
      </div>
      
      <div *ngIf="data.action" class="mt-4 text-center">
        <button 
          class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          (click)="onAction()">
          {{ data.action.label }}
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class MetricCardComponent {
  @Input() data!: MetricCardData;

  onAction() {
    if (this.data.action?.onClick) {
      this.data.action.onClick();
    }
  }
} 