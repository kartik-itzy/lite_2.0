import { Component, Input, forwardRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'success' | 'warning' | 'danger';

export interface InputConfig {
  type?: InputType;
  size?: InputSize;
  variant?: InputVariant;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="containerClasses">
      <!-- Label -->
      <label
        *ngIf="label"
        [for]="inputId"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        {{ label }}
        <span *ngIf="required" class="text-danger-600">*</span>
      </label>

      <!-- Input Container -->
      <div class="relative">
        <!-- Left Icon -->
        <div
          *ngIf="icon && iconPosition !== 'right'"
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <svg
            class="h-5 w-5 text-gray-400"
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
        </div>

        <!-- Input Field -->
        <input
          #input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [class]="inputClasses"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()"
          (focus)="onFocus()"
        />

        <!-- Right Icon -->
        <div
          *ngIf="icon && iconPosition === 'right'"
          class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
        >
          <svg
            class="h-5 w-5 text-gray-400"
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
        </div>
      </div>

      <!-- Helper Text -->
      <p
        *ngIf="helperText && !errorText"
        class="mt-1 text-sm text-gray-500"
      >
        {{ helperText }}
      </p>

      <!-- Error Text -->
      <p
        *ngIf="errorText"
        class="mt-1 text-sm text-danger-600"
      >
        {{ errorText }}
      </p>
    </div>
  `,
  styles: []
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() variant: InputVariant = 'default';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() label = '';
  @Input() helperText = '';
  @Input() errorText = '';
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() fullWidth = false;

  @ViewChild('input', { static: true }) inputElement!: ElementRef<HTMLInputElement>;

  value = '';
  focused = false;
  inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  private onChange = (value: any) => {};
  public onTouched = () => {};

  get containerClasses(): string {
    return this.fullWidth ? 'w-full' : '';
  }

  get inputClasses(): string {
    const baseClasses = 'block w-full rounded-lg border border-gray-300 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-3 text-sm',
      lg: 'px-6 py-4 text-base'
    };

    const variantClasses = {
      default: 'text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white',
      success: 'text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white',
      warning: 'text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white',
      danger: 'text-gray-900 placeholder-gray-500 bg-gray-50 focus:bg-white'
    };

    const iconPadding = this.icon && this.iconPosition !== 'right' ? 'pl-12' : '';
    const rightIconPadding = this.icon && this.iconPosition === 'right' ? 'pr-12' : '';

    return `${baseClasses} ${sizeClasses[this.size]} ${variantClasses[this.variant]} ${iconPadding} ${rightIconPadding}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onFocus(): void {
    this.focused = true;
  }

  @HostListener('blur')
  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Public methods for external access
  focus(): void {
    this.inputElement.nativeElement.focus();
  }

  blur(): void {
    this.inputElement.nativeElement.blur();
  }

  select(): void {
    this.inputElement.nativeElement.select();
  }
} 