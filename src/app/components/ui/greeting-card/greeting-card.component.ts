import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GreetingCardData {
  title: string;
  subtitle?: string;
  userName?: string;
  date?: string;
  icon?: string;
}

@Component({
  selector: 'app-greeting-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <div class="flex items-center">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ data.title }}
            <span *ngIf="data.userName" class="text-blue-600">{{ data.userName }}</span>
          </h2>
          <p *ngIf="data.subtitle || data.date" class="text-gray-600">
            {{ data.subtitle || data.date }}
          </p>
        </div>
        <div *ngIf="data.icon" class="ml-4">
          <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path [attr.d]="data.icon"></path>
          </svg>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class GreetingCardComponent {
  @Input() data!: GreetingCardData;
} 