import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeStyle = 'solid' | 'outline' | 'soft';

export interface BadgeConfig {
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: BadgeStyle;
  rounded?: boolean;
  removable?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      <!-- Icon -->
      <svg
        *ngIf="icon"
        class="h-3 w-3 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          [attr.d]="icon"
        ></path>
      </svg>

      <!-- Content -->
      <ng-content></ng-content>

      <!-- Remove button -->
      <button
        *ngIf="removable"
        type="button"
        class="ml-1 inline-flex items-center justify-center w-3 h-3 rounded-full hover:bg-current hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2"
        (click)="onRemove($event)"
      >
        <svg
          class="w-2 h-2"
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
    </span>
  `,
  styles: []
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';
  @Input() size: BadgeSize = 'md';
  @Input() style: BadgeStyle = 'solid';
  @Input() rounded = false;
  @Input() removable = false;
  @Input() icon?: string;

  get badgeClasses(): string {
    const baseClasses = 'inline-flex items-center font-medium transition-colors duration-200';
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-sm'
    };

    const roundedClass = this.rounded ? 'rounded-full' : 'rounded-md';

    const variantClasses = this.getVariantClasses();

    return `${baseClasses} ${sizeClasses[this.size]} ${roundedClass} ${variantClasses}`;
  }

  private getVariantClasses(): string {
    const solidClasses = {
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-gray-100 text-gray-800',
      success: 'bg-success-100 text-success-800',
      warning: 'bg-warning-100 text-warning-800',
      danger: 'bg-danger-100 text-danger-800',
      info: 'bg-blue-100 text-blue-800',
      light: 'bg-gray-100 text-gray-800',
      dark: 'bg-gray-800 text-white'
    };

    const outlineClasses = {
      primary: 'border border-primary-300 text-primary-700 bg-transparent',
      secondary: 'border border-gray-300 text-gray-700 bg-transparent',
      success: 'border border-success-300 text-success-700 bg-transparent',
      warning: 'border border-warning-300 text-warning-700 bg-transparent',
      danger: 'border border-danger-300 text-danger-700 bg-transparent',
      info: 'border border-blue-300 text-blue-700 bg-transparent',
      light: 'border border-gray-300 text-gray-700 bg-transparent',
      dark: 'border border-gray-600 text-gray-800 bg-transparent'
    };

    const softClasses = {
      primary: 'bg-primary-50 text-primary-700',
      secondary: 'bg-gray-50 text-gray-700',
      success: 'bg-success-50 text-success-700',
      warning: 'bg-warning-50 text-warning-700',
      danger: 'bg-danger-50 text-danger-700',
      info: 'bg-blue-50 text-blue-700',
      light: 'bg-gray-50 text-gray-700',
      dark: 'bg-gray-900 text-gray-100'
    };

    const styleClasses = {
      solid: solidClasses,
      outline: outlineClasses,
      soft: softClasses
    };

    return styleClasses[this.style][this.variant];
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    // Emit remove event
  }
} 