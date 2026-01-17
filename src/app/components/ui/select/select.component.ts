import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col">
      <label *ngIf="label" class="text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </label>
      
      <div class="relative">
        <select 
          [disabled]="disabled"
          (change)="onSelectionChange($event)"
          [(ngModel)]="value"
          [class]="getSelectClasses()"
        >
          <option value="" disabled>{{ placeholder || 'Select an option' }}</option>
          <option 
            *ngFor="let option of options" 
            [value]="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        
        <!-- Custom dropdown arrow -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
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
        class="mt-1 text-sm text-red-600"
      >
        {{ errorText }}
      </p>
    </div>
  `,
  styles: [`
    select:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() helperText?: string;
  @Input() errorText?: string;
  @Input() required = false;
  @Input() size: SelectSize = 'md';
  @Input() disabled = false;

  @Output() selectionChange = new EventEmitter<string>();

  value = '';
  private onChange = (value: string) => {};
  public onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTouched();
    this.selectionChange.emit(this.value);
  }

  getSelectClasses(): string {
    const baseClasses = `
      w-full
      bg-white 
      border 
      border-gray-300 
      rounded-lg 
      text-gray-700 
      focus:outline-none 
      focus:border-blue-500 
      focus:bg-white 
      cursor-pointer
      disabled:opacity-50 
      disabled:cursor-not-allowed
      transition-all
      duration-200
      hover:border-gray-400
      appearance-none
      leading-tight
    `;

    const sizeClasses = this.getSizeClasses();
    return `${baseClasses} ${sizeClasses}`.trim();
  }

  getSizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'text-sm pl-3 pr-10 py-2';
      case 'lg':
        return 'text-base pl-5 pr-10 py-3';
      default: // md
        return 'text-sm pl-4 pr-10 py-2.5';
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.cdr.markForCheck();
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
