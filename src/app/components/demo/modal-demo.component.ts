import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import modal components
import { DemoModalComponent } from './demo-modal.component';
import { StepProgressComponent } from '../ui/step-progress/step-progress.component';
import { SelectionCardComponent } from '../ui/selection-card/selection-card.component';
import { ProfileCardComponent } from '../ui/profile-card/profile-card.component';
import { TimeRangeInputComponent } from '../ui/time-range-input/time-range-input.component';
import { TextareaComponent } from '../ui/textarea/textarea.component';
import { DropdownComponent } from '../ui/dropdown/dropdown.component';
import { CardComponent } from '../ui/card/card.component';
import { BadgeComponent } from '../ui/badge/badge.component';

@Component({
  selector: 'app-modal-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DemoModalComponent,
    StepProgressComponent,
    SelectionCardComponent,
    ProfileCardComponent,
    TimeRangeInputComponent,
    TextareaComponent,
    DropdownComponent,
    CardComponent,
    BadgeComponent
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Modal Components Demo</h1>
        <p class="text-sm text-gray-600">A showcase of reusable modal components and their integration</p>
      </div>

      <!-- Demo Modal Section -->
      <app-card class="mb-8" [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Complete Modal Demo</h2>
          <app-badge variant="primary">Full Integration</app-badge>
        </div>

        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            This demonstrates the complete modal integration with all the reusable components we created.
            Click the button below to open the modal.
          </p>
          
          <app-demo-modal></app-demo-modal>
        </div>

        <div card-footer class="text-sm text-gray-500">
          The modal showcases step progress, selection cards, profile cards, time range inputs, and textarea components.
        </div>
      </app-card>

      <!-- Individual Components Section -->
      <app-card class="mb-8" [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Individual Components</h2>
          <app-badge variant="success">6 Components</app-badge>
        </div>

        <div class="space-y-8">
          <!-- Step Progress -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Step Progress</h3>
            <app-step-progress [config]="stepConfig"></app-step-progress>
          </div>

          <!-- Selection Cards -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Selection Cards</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <app-selection-card 
                *ngFor="let item of sampleItems" 
                [config]="getSelectionConfig(item)"
                (selectItem)="onItemSelect($event)">
              </app-selection-card>
            </div>
          </div>

          <!-- Profile Cards -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Profile Cards</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <app-profile-card 
                *ngFor="let profile of sampleProfiles" 
                [config]="getProfileConfig(profile)"
                (selectProfile)="onProfileSelect($event)">
              </app-profile-card>
            </div>
          </div>

          <!-- Time Range Input -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Time Range Input</h3>
            <app-time-range-input 
              [config]="timeRangeConfig"
              [(ngModel)]="selectedTimeRange"
              (timeRangeChange)="onTimeRangeChange($event)">
            </app-time-range-input>
          </div>

          <!-- Textarea -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Textarea</h3>
            <app-textarea 
              [config]="textareaConfig"
              [(ngModel)]="sampleText">
            </app-textarea>
          </div>

          <!-- Dropdown -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Dropdown</h3>
            <app-dropdown [data]="dropdownData"></app-dropdown>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Each component can be used independently or integrated into larger forms and modals.
        </div>
      </app-card>

      <!-- Usage Examples Section -->
      <app-card class="mb-8" [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Usage Examples</h2>
          <app-badge variant="info">Code Samples</app-badge>
        </div>

        <div class="space-y-6">
                    <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Modal Integration</h3>
            <div class="bg-gray-100 p-4 rounded-lg">
              <p class="text-sm text-gray-700">Use the modal component with step progress, selection cards, and form components.</p>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Component Configuration</h3>
            <div class="bg-gray-100 p-4 rounded-lg">
              <p class="text-sm text-gray-700">All components support TypeScript interfaces for type safety and configuration.</p>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          All components are fully configurable and support TypeScript interfaces for type safety.
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class ModalDemoComponent {
  // Step Progress Configuration
  stepConfig = {
    steps: [
      { 
        id: 'step1', 
        title: 'Step 1', 
        icon: 'M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4M7 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V5C20 4.44772 19.5523 4 19 4H17M7 4H17' 
      },
      { 
        id: 'step2', 
        title: 'Step 2', 
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' 
      },
      { 
        id: 'step3', 
        title: 'Step 3', 
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
      }
    ],
    currentStep: 1
  };

  // Sample Items for Selection Cards
  sampleItems = [
    {
      id: 'item-1',
      name: 'Sample Item 1',
      duration: '± 1 hour(s)',
      price: 'Start from $100',
      isPopular: true
    },
    {
      id: 'item-2',
      name: 'Sample Item 2',
      duration: '± 2 hour(s)',
      price: 'Start from $200',
      isPopular: false
    }
  ];

  // Sample Profiles for Profile Cards
  sampleProfiles = [
    {
      id: 'profile-1',
      name: 'John Doe',
      title: 'Manager',
      imageUrl: '/assets/profile-1.jpg',
              todayOrders: 5,
      isAvailable: true,
      rating: 4.8,
      totalClients: 150
    },
    {
      id: 'profile-2',
      name: 'Jane Smith',
      title: 'Assistant',
      imageUrl: '/assets/profile-2.jpg',
              todayOrders: 3,
      isAvailable: false,
      rating: 4.5,
      totalClients: 120
    }
  ];

  // Time Range Configuration
  timeRangeConfig = {
    label: 'Select Time Range',
    startTimeLabel: 'Start',
    endTimeLabel: 'End',
    separatorText: 'to',
    size: 'md' as const,
    variant: 'default' as const
  };

  selectedTimeRange = {
    startTime: '09:00',
    endTime: '10:00'
  };

  // Textarea Configuration
  textareaConfig = {
    label: 'Sample Textarea',
    placeholder: 'Enter your message here...',
    maxLength: 200,
    showCharacterCount: true,
    rows: 4,
    size: 'md' as const,
    variant: 'default' as const
  };

  sampleText = '';

  // Dropdown Configuration
  dropdownData = {
    label: 'Select Option',
    placeholder: 'Choose an option',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' }
    ],
    size: 'md' as const
  };

  // Methods
  getSelectionConfig(item: any) {
    return {
      item: item,
      selected: false,
      variant: 'default' as const,
      showPopularBadge: true,
      showDuration: true,
      showPrice: true
    };
  }

  getProfileConfig(profile: any) {
    return {
      profile: profile,
      selected: false,
      variant: 'default' as const,
      showAvailability: true,
      showRating: true,
      showOrders: true,
      showTotalClients: true
    };
  }

  onItemSelect(item: any): void {
    console.log('Selected item:', item);
  }

  onProfileSelect(profile: any): void {
    console.log('Selected profile:', profile);
  }

  onTimeRangeChange(timeRange: any): void {
    console.log('Time range changed:', timeRange);
  }
} 