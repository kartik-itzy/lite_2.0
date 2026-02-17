import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-color-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorInputComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="fullWidth ? 'w-full' : ''">
      <!-- Label -->
      <label
        *ngIf="label"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        {{ label }}
        <span *ngIf="required" class="text-danger-600">*</span>
      </label>

      <!-- Wrapper -->
      <div class="flex items-center gap-3">

        <!-- Preview + Native Picker -->
        <div class="relative h-10 w-10 color-picker-wrapper">
          <div
            class="h-10 w-10 rounded-md border"
            [style.background]="value"
          ></div>

          <!-- invisible but positioned picker -->
          <input
            type="color"
            class="absolute inset-0 opacity-0 cursor-pointer color-picker-input"
            [value]="value"
            (input)="onColorChange($event)"
            [disabled]="disabled || readonly"
          />
        </div>

        <!-- Hex Input -->
        <input
          type="text"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [class]="inputClasses"
          (input)="onTextInput($event)"
          (blur)="onTouched()"
        />
      </div>

      <!-- Helper -->
      <p *ngIf="helperText && !errorText" class="mt-1 text-sm text-gray-500">
        {{ helperText }}
      </p>

      <!-- Error -->
      <p *ngIf="errorText" class="mt-1 text-sm text-danger-600">
        {{ errorText }}
      </p>
    </div>
  `,
  styles: [`
    .color-picker-wrapper {
      overflow: visible;
    }
    
    .color-picker-input::-webkit-color-swatch-wrapper {
      transform: translateY(100%);
    }
    
    /* Force the color picker to open below */
    input[type="color"] {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 2px;
    }
    
    /* Keep the clickable area in the original position */
    input[type="color"]::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 40px;
      height: 40px;
      transform: translateY(-100%);
    }
  `]
})
export class ColorInputComponent implements ControlValueAccessor {
  @Input() size: InputSize = 'md';
  @Input() variant: InputVariant = 'default';
  @Input() placeholder = '#000000';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() label = '';
  @Input() helperText = '';
  @Input() errorText = '';
  @Input() fullWidth = false;

  value = '#000000';

  private onChange = (value: any) => {};
  onTouched = () => {};

  get inputClasses(): string {
    const base =
      'flex-1 rounded-lg border border-gray-300 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-3 text-base',
    };

    return `${base} ${sizeClasses[this.size]}`;
  }

  onColorChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.updateValue(val);
  }

  onTextInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.updateValue(val);
  }

  private updateValue(val: string) {
    this.value = val;
    this.onChange(val);
    this.onTouched();
  }

  // ========================
  // ControlValueAccessor
  // ========================

  writeValue(value: any): void {
    this.value = value || '#000000';
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
}