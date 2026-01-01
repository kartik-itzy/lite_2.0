import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertConfig {
  variant?: AlertVariant;
  size?: AlertSize;
  title?: string;
  message?: string;
  dismissible?: boolean;
  showIcon?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="alertClasses" role="alert">
      <!-- Icon -->
      <div
        *ngIf="showIcon"
        [class]="iconClasses"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            [attr.d]="icon || this.getDefaultIcon()"
          ></path>
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1">
        <!-- Title -->
        <h3
          *ngIf="title"
          [class]="titleClasses"
        >
          {{ title }}
        </h3>

        <!-- Message -->
        <div
          *ngIf="message"
          [class]="messageClasses"
        >
          {{ message }}
        </div>

        <!-- Default content -->
        <ng-content *ngIf="!message"></ng-content>
      </div>

      <!-- Dismiss button -->
      <button
        *ngIf="dismissible"
        type="button"
        [class]="dismissClasses"
        (click)="onDismiss()"
        aria-label="Close alert"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  `,
  styles: []
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'primary';
  @Input() size: AlertSize = 'md';
  @Input() title = '';
  @Input() message = '';
  @Input() dismissible = false;
  @Input() showIcon = true;
  @Input() icon?: string;

  @Output() dismissed = new EventEmitter<void>();

  get alertClasses(): string {
    const baseClasses = 'flex items-start p-4 rounded-lg border';
    
    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };

    const variantClasses = {
      primary: 'bg-primary-50 border-primary-200 text-primary-800',
      secondary: 'bg-gray-50 border-gray-200 text-gray-800',
      success: 'bg-success-50 border-success-200 text-success-800',
      warning: 'bg-warning-50 border-warning-200 text-warning-800',
      danger: 'bg-danger-50 border-danger-200 text-danger-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]}`;
  }

  get iconClasses(): string {
    const sizeClasses = {
      sm: 'mr-2 flex-shrink-0',
      md: 'mr-3 flex-shrink-0',
      lg: 'mr-4 flex-shrink-0'
    };

    const variantClasses = {
      primary: 'text-primary-600',
      secondary: 'text-gray-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600',
      info: 'text-blue-600'
    };

    return `${sizeClasses[this.size]} ${variantClasses[this.variant]}`;
  }

  get titleClasses(): string {
    const sizeClasses = {
      sm: 'text-sm font-medium mb-1',
      md: 'text-sm font-medium mb-1',
      lg: 'text-base font-medium mb-2'
    };

    return sizeClasses[this.size];
  }

  get messageClasses(): string {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base'
    };

    return sizeClasses[this.size];
  }

  get dismissClasses(): string {
    const sizeClasses = {
      sm: 'ml-2 -mr-1.5',
      md: 'ml-3 -mr-2',
      lg: 'ml-4 -mr-2'
    };

    const variantClasses = {
      primary: 'text-primary-600 hover:text-primary-800',
      secondary: 'text-gray-600 hover:text-gray-800',
      success: 'text-success-600 hover:text-success-800',
      warning: 'text-warning-600 hover:text-warning-800',
      danger: 'text-danger-600 hover:text-danger-800',
      info: 'text-blue-600 hover:text-blue-800'
    };

    const baseClasses = 'flex-shrink-0 p-1 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]}`;
  }

  getDefaultIcon(): string {
    const icons = {
      primary: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      secondary: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      danger: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };

    return icons[this.variant];
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
} 