import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoadingType = 'spinner' | 'dots' | 'bars' | 'pulse';
export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white';

export interface LoadingConfig {
  type?: LoadingType;
  size?: LoadingSize;
  color?: LoadingColor;
  text?: string;
  overlay?: boolean;
  fullScreen?: boolean;
}

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <!-- Overlay -->
      <div
        *ngIf="overlay"
        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      ></div>

      <!-- Loading Content -->
      <div [class]="contentClasses">
        <!-- Spinner -->
        <div *ngIf="type === 'spinner'" [class]="spinnerClasses">
          <svg
            class="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>

        <!-- Dots -->
        <div *ngIf="type === 'dots'" [class]="dotsClasses">
          <div class="animate-bounce"></div>
          <div class="animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="animate-bounce" style="animation-delay: 0.2s"></div>
        </div>

        <!-- Bars -->
        <div *ngIf="type === 'bars'" [class]="barsClasses">
          <div class="animate-pulse"></div>
          <div class="animate-pulse" style="animation-delay: 0.1s"></div>
          <div class="animate-pulse" style="animation-delay: 0.2s"></div>
        </div>

        <!-- Pulse -->
        <div *ngIf="type === 'pulse'" [class]="pulseClasses">
          <div class="animate-ping"></div>
        </div>

        <!-- Text -->
        <p
          *ngIf="text"
          [class]="textClasses"
        >
          {{ text }}
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoadingComponent {
  @Input() type: LoadingType = 'spinner';
  @Input() size: LoadingSize = 'md';
  @Input() color: LoadingColor = 'primary';
  @Input() text = '';
  @Input() overlay = false;
  @Input() fullScreen = false;

  get containerClasses(): string {
    const baseClasses = 'flex items-center justify-center';
    const fullScreenClass = this.fullScreen ? 'fixed inset-0 z-50' : '';
    return `${baseClasses} ${fullScreenClass}`;
  }

  get contentClasses(): string {
    const baseClasses = 'flex flex-col items-center justify-center';
    const overlayClass = this.overlay ? 'relative z-10' : '';
    return `${baseClasses} ${overlayClass}`;
  }

  get spinnerClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    const colorClasses = {
      primary: 'text-primary-600',
      secondary: 'text-gray-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600',
      white: 'text-white'
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }

  get dotsClasses(): string {
    const sizeClasses = {
      sm: 'w-1 h-1',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4'
    };

    const colorClasses = {
      primary: 'bg-primary-600',
      secondary: 'bg-gray-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      danger: 'bg-danger-600',
      white: 'bg-white'
    };

    const baseClasses = 'flex space-x-1';
    const dotClasses = `${sizeClasses[this.size]} ${colorClasses[this.color]} rounded-full`;

    return `${baseClasses} [&>div]:${dotClasses}`;
  }

  get barsClasses(): string {
    const sizeClasses = {
      sm: 'w-1 h-4',
      md: 'w-1.5 h-6',
      lg: 'w-2 h-8',
      xl: 'w-3 h-12'
    };

    const colorClasses = {
      primary: 'bg-primary-600',
      secondary: 'bg-gray-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      danger: 'bg-danger-600',
      white: 'bg-white'
    };

    const baseClasses = 'flex space-x-1';
    const barClasses = `${sizeClasses[this.size]} ${colorClasses[this.color]} rounded`;

    return `${baseClasses} [&>div]:${barClasses}`;
  }

  get pulseClasses(): string {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    const colorClasses = {
      primary: 'bg-primary-600',
      secondary: 'bg-gray-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      danger: 'bg-danger-600',
      white: 'bg-white'
    };

    return `relative ${sizeClasses[this.size]} ${colorClasses[this.color]} rounded-full`;
  }

  get textClasses(): string {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg'
    };

    const colorClasses = {
      primary: 'text-primary-600',
      secondary: 'text-gray-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600',
      white: 'text-white'
    };

    return `mt-2 font-medium ${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }
} 