import { Component, Input, ContentChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent, DropdownData, DropdownOption } from '../dropdown/dropdown.component';

export interface ChartCardData {
  title: string;
  subtitle?: string;
  total?: string | number;
  period?: string;
  showPeriodSelector?: boolean;
  periodOptions?: string[];
  selectedPeriod?: string;
}

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, DropdownComponent],
  template: `
    <div class="bg-white rounded-lg p-6 shadow-sm flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
          <p *ngIf="data.subtitle" class="text-sm text-gray-600">{{ data.subtitle }}</p>
        </div>
        <app-dropdown 
          *ngIf="data.showPeriodSelector" 
          [data]="periodDropdownData"
          (selectionChange)="onPeriodChange($event)">
        </app-dropdown>
      </div>
      
      <div class="mb-4" *ngIf="data.total">
        <div class="flex items-center justify-between">
          <span class="text-3xl font-bold text-gray-900">{{ data.total }}</span>
        </div>
        <p *ngIf="data.period" class="text-sm text-gray-600 mt-1">{{ data.period }}</p>
      </div>
      
      <div class="flex-1">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class ChartCardComponent {
  @Input() data!: ChartCardData;
  @Output() periodChange = new EventEmitter<string>();

  get periodDropdownData(): DropdownData {
    return {
      options: (this.data.periodOptions || []).map(option => ({
        value: option,
        label: option
      })),
      selectedValue: this.data.selectedPeriod || this.data.periodOptions?.[0] || '',
      size: 'sm'
    };
  }

  onPeriodChange(value: string): void {
    this.periodChange.emit(value);
  }
} 