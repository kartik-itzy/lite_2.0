import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ProgressItem {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface ProgressCardData {
  title: string;
  subtitle?: string;
  items: ProgressItem[];
  showLegend?: boolean;
  showPercentages?: boolean;
  total?: string | number;
}

@Component({
  selector: 'app-progress-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
        <div *ngIf="data.total" class="text-center">
          <div class="text-2xl font-bold text-gray-900">{{ data.total }}</div>
          <div *ngIf="data.subtitle" class="text-sm text-gray-600">{{ data.subtitle }}</div>
        </div>
      </div>
      
      <div class="space-y-3">
        <div *ngFor="let item of data.items" class="space-y-2">
          <div class="flex justify-between text-sm mb-1">
            <span>{{ item.label }}</span>
            <span *ngIf="data.showPercentages">{{ item.percentage || item.value }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full" 
              [ngClass]="item.color || 'bg-blue-600'"
              [style.width.%]="item.percentage || item.value">
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="data.showLegend" class="mt-4 pt-4 border-t">
        <h4 class="text-sm font-semibold text-gray-900 mb-2">LEGEND</h4>
        <div class="space-y-2 text-sm">
          <div *ngFor="let item of data.items" class="flex justify-between">
            <span>{{ item.label }}</span>
            <span class="font-medium">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProgressCardComponent {
  @Input() data!: ProgressCardData;
} 