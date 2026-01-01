import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProgressVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressStyle = 'solid' | 'striped' | 'animated';

export interface ProgressConfig {
  variant?: ProgressVariant;
  size?: ProgressSize;
  style?: ProgressStyle;
  showLabel?: boolean;
  showPercentage?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inside';
  animated?: boolean;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <!-- Top Label -->
      <div
        *ngIf="showLabel && labelPosition === 'top'"
        class="flex items-center justify-between mb-2"
      >
        <span [class]="labelClasses">{{ label }}</span>
        <span *ngIf="showPercentage" [class]="percentageClasses">{{ percentage }}%</span>
      </div>

      <!-- Progress Bar Container -->
      <div [class]="barContainerClasses">
        <!-- Progress Bar -->
        <div
          [class]="barClasses"
          [style.width.%]="percentage"
          role="progressbar"
          [attr.aria-valuenow]="percentage"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <!-- Inside Label -->
          <span
            *ngIf="showLabel && labelPosition === 'inside' && percentage > 15"
            [class]="insideLabelClasses"
          >
            {{ label }}
          </span>

          <!-- Inside Percentage -->
          <span
            *ngIf="showPercentage && labelPosition === 'inside' && percentage > 15"
            [class]="insidePercentageClasses"
          >
            {{ percentage }}%
          </span>
        </div>
      </div>

      <!-- Bottom Label -->
      <div
        *ngIf="showLabel && labelPosition === 'bottom'"
        class="flex items-center justify-between mt-2"
      >
        <span [class]="labelClasses">{{ label }}</span>
        <span *ngIf="showPercentage" [class]="percentageClasses">{{ percentage }}%</span>
      </div>
    </div>
  `,
  styles: []
})
export class ProgressComponent {
  @Input() value = 0;
  @Input() max = 100;
  @Input() label = '';
  @Input() config: ProgressConfig = {};

  @Output() valueChange = new EventEmitter<number>();

  get percentage(): number {
    return Math.min(Math.max((this.value / this.max) * 100, 0), 100);
  }

  get showLabel(): boolean {
    return this.config.showLabel !== false && this.label !== '';
  }

  get showPercentage(): boolean {
    return this.config.showPercentage !== false;
  }

  get labelPosition(): 'top' | 'bottom' | 'inside' {
    return this.config.labelPosition || 'top';
  }

  get containerClasses(): string {
    return 'w-full';
  }

  get labelClasses(): string {
    const sizeClasses = {
      sm: 'text-xs font-medium',
      md: 'text-sm font-medium',
      lg: 'text-base font-medium'
    };

    const variantClasses = {
      primary: 'text-primary-700',
      secondary: 'text-gray-700',
      success: 'text-success-700',
      warning: 'text-warning-700',
      danger: 'text-danger-700'
    };

    return `${sizeClasses[this.config.size || 'md']} ${variantClasses[this.config.variant || 'primary']}`;
  }

  get percentageClasses(): string {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };

    const variantClasses = {
      primary: 'text-primary-600',
      secondary: 'text-gray-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600'
    };

    return `${sizeClasses[this.config.size || 'md']} ${variantClasses[this.config.variant || 'primary']}`;
  }

  get barContainerClasses(): string {
    const baseClasses = 'w-full bg-gray-200 rounded-full overflow-hidden';
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };

    return `${baseClasses} ${sizeClasses[this.config.size || 'md']}`;
  }

  get barClasses(): string {
    const baseClasses = 'h-full transition-all duration-300 ease-out flex items-center justify-center';
    
    const variantClasses = {
      primary: 'bg-primary-600',
      secondary: 'bg-gray-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      danger: 'bg-danger-600'
    };

    const styleClasses = {
      solid: '',
      striped: 'bg-gradient-to-r from-current to-current bg-stripes',
      animated: 'bg-gradient-to-r from-current to-current animate-pulse'
    };

    const animatedClass = this.config.animated ? 'animate-pulse' : '';

    return `${baseClasses} ${variantClasses[this.config.variant || 'primary']} ${styleClasses[this.config.style || 'solid']} ${animatedClass}`;
  }

  get insideLabelClasses(): string {
    const sizeClasses = {
      sm: 'text-xs font-medium',
      md: 'text-sm font-medium',
      lg: 'text-base font-medium'
    };

    return `${sizeClasses[this.config.size || 'md']} text-white`;
  }

  get insidePercentageClasses(): string {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };

    return `${sizeClasses[this.config.size || 'md']} text-white opacity-90`;
  }

  // Method to update progress value
  updateValue(newValue: number): void {
    this.value = Math.min(Math.max(newValue, 0), this.max);
    this.valueChange.emit(this.value);
  }

  // Method to increment progress
  increment(amount: number = 1): void {
    this.updateValue(this.value + amount);
  }

  // Method to decrement progress
  decrement(amount: number = 1): void {
    this.updateValue(this.value - amount);
  }

  // Method to set progress to a specific percentage
  setPercentage(percentage: number): void {
    const newValue = (percentage / 100) * this.max;
    this.updateValue(newValue);
  }
} 