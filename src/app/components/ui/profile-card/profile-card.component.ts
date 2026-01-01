import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
  specialization?: string;
  rating?: number;
  totalClients?: number;
  todayOrders?: number;
  isAvailable?: boolean;
  metadata?: Record<string, any>;
}

export interface ProfileCardConfig {
  profile: UserProfile;
  selected?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  showAvailability?: boolean;
  showRating?: boolean;
  showOrders?: boolean;
  showTotalClients?: boolean;
}

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
      [class]="getCardClasses()"
      (click)="onSelect()"
    >
      <!-- Availability Badge -->
      <div 
        *ngIf="config.showAvailability"
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3"
        [class]="getAvailabilityClasses()"
      >
        {{ config.profile.isAvailable ? 'Available' : 'Unavailable' }}
      </div>

      <!-- Profile Info -->
      <div class="flex items-start space-x-3">
        <!-- Profile Image -->
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <img 
              *ngIf="config.profile.imageUrl"
              [src]="config.profile.imageUrl"
              [alt]="config.profile.name"
              class="w-full h-full object-cover"
            />
            <svg 
              *ngIf="!config.profile.imageUrl"
              class="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>

        <!-- Profile Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                {{ config.profile.name }}
              </h4>
              <p class="text-sm text-gray-500">
                {{ config.profile.title }}
              </p>
              <p 
                *ngIf="config.profile.specialization"
                class="text-xs text-gray-400 mt-1"
              >
                {{ config.profile.specialization }}
              </p>
            </div>

            <!-- Selection Indicator -->
            <div 
              *ngIf="config.selected"
              class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center ml-2"
            >
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="mt-2 space-y-1">
            <!-- Today's Orders -->
            <div 
              *ngIf="config.showOrders"
              class="flex items-center text-xs text-gray-600"
            >
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Today's orders: {{ config.profile.todayOrders || 0 }} client(s)
            </div>

            <!-- Rating -->
            <div 
              *ngIf="config.showRating && config.profile.rating"
              class="flex items-center text-xs text-gray-600"
            >
              <svg class="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              {{ config.profile.rating }}/5
            </div>

            <!-- Total Clients -->
            <div 
              *ngIf="config.showTotalClients && config.profile.totalClients"
              class="flex items-center text-xs text-gray-600"
            >
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              {{ config.profile.totalClients }} total clients
            </div>
          </div>
        </div>
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
export class ProfileCardComponent {
  @Input() config: ProfileCardConfig = {
    profile: {
      id: '',
      name: '',
      title: '',
      todayOrders: 0
    }
  };

  @Output() selectProfile = new EventEmitter<UserProfile>();

  getCardClasses(): string {
    const baseClasses = 'relative border-gray-200 hover:border-blue-300';
    const selectedClasses = this.config.selected 
      ? 'border-blue-600 bg-blue-50' 
      : 'hover:bg-gray-50';
    
    return `${baseClasses} ${selectedClasses}`;
  }

  getAvailabilityClasses(): string {
    return this.config.profile.isAvailable 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  onSelect(): void {
    this.selectProfile.emit(this.config.profile);
  }
} 