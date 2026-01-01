import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SwitchVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchConfig {
  variant?: SwitchVariant;
  size?: SwitchSize;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  description?: string;
  showLabel?: boolean;
  showDescription?: boolean;
}

@Component({
  selector: 'app-switch',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="containerClasses">
      <!-- Switch Toggle -->
      <button
        type="button"
        [class]="switchClasses"
        [disabled]="disabled || loading"
        (click)="toggle()"
        role="switch"
        [attr.aria-checked]="checked"
        [attr.aria-label]="label || 'Toggle switch'"
      >
        <!-- Loading Spinner -->
        <div
          *ngIf="loading"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        </div>

        <!-- Switch Handle -->
        <div
          *ngIf="!loading"
          [class]="handleClasses"
          class="inline-block bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out"
        ></div>
      </button>

      <!-- Label and Description -->
      <div
        *ngIf="showLabel || showDescription"
        class="ml-3"
      >
        <!-- Label -->
        <label
          *ngIf="showLabel"
          [for]="switchId"
          [class]="labelClasses"
          (click)="toggle()"
        >
          {{ label }}
        </label>

        <!-- Description -->
        <p
          *ngIf="showDescription && description"
          [class]="descriptionClasses"
        >
          {{ description }}
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class SwitchComponent implements ControlValueAccessor {
  @Input() checked = false;
  @Input() config: SwitchConfig = {};
  @Input() label = '';
  @Input() description = '';

  @Output() checkedChange = new EventEmitter<boolean>();

  switchId = `switch-${Math.random().toString(36).substr(2, 9)}`;

  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  get disabled(): boolean {
    return this.config.disabled || false;
  }

  get loading(): boolean {
    return this.config.loading || false;
  }

  get showLabel(): boolean {
    return this.config.showLabel !== false && this.label !== '';
  }

  get showDescription(): boolean {
    return this.config.showDescription !== false && this.description !== '';
  }

  get containerClasses(): string {
    const baseClasses = 'flex items-center';
    const disabledClass = this.disabled ? 'opacity-50 cursor-not-allowed' : '';
    return `${baseClasses} ${disabledClass}`;
  }

  get switchClasses(): string {
    const baseClasses = 'relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'h-5 w-9',
      md: 'h-6 w-11',
      lg: 'h-7 w-14'
    };

    const variantClasses = {
      primary: 'bg-gray-200 focus:ring-primary-500',
      secondary: 'bg-gray-200 focus:ring-gray-500',
      success: 'bg-gray-200 focus:ring-success-500',
      warning: 'bg-gray-200 focus:ring-warning-500',
      danger: 'bg-gray-200 focus:ring-danger-500'
    };

    const checkedClasses = {
      primary: 'bg-primary-600 focus:ring-primary-500',
      secondary: 'bg-gray-600 focus:ring-gray-500',
      success: 'bg-success-600 focus:ring-success-500',
      warning: 'bg-warning-600 focus:ring-warning-500',
      danger: 'bg-danger-600 focus:ring-danger-500'
    };

    const variant = this.config.variant || 'primary';
    const variantClass = this.checked ? checkedClasses[variant] : variantClasses[variant];
    const disabledClass = this.disabled ? 'cursor-not-allowed' : 'cursor-pointer';

    return `${baseClasses} ${sizeClasses[this.config.size || 'md']} ${variantClass} ${disabledClass}`;
  }

  get handleClasses(): string {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    const transformClasses = {
      sm: this.checked ? 'translate-x-4' : 'translate-x-0.5',
      md: this.checked ? 'translate-x-5' : 'translate-x-0.5',
      lg: this.checked ? 'translate-x-7' : 'translate-x-0.5'
    };

    return `${sizeClasses[this.config.size || 'md']} ${transformClasses[this.config.size || 'md']}`;
  }

  get labelClasses(): string {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base'
    };

    const variantClasses = {
      primary: 'text-primary-700',
      secondary: 'text-gray-700',
      success: 'text-success-700',
      warning: 'text-warning-700',
      danger: 'text-danger-700'
    };

    const disabledClass = this.disabled ? 'text-gray-400' : '';
    const cursorClass = this.disabled ? '' : 'cursor-pointer';

    return `${sizeClasses[this.config.size || 'md']} font-medium ${variantClasses[this.config.variant || 'primary']} ${disabledClass} ${cursorClass}`;
  }

  get descriptionClasses(): string {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-sm'
    };

    const disabledClass = this.disabled ? 'text-gray-400' : 'text-gray-500';

    return `${sizeClasses[this.config.size || 'md']} ${disabledClass}`;
  }

  toggle(): void {
    if (this.disabled || this.loading) return;

    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.checkedChange.emit(this.checked);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.config.disabled = isDisabled;
  }
} 