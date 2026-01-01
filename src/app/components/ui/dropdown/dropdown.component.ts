import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownData {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col">
      <label *ngIf="data.label" class="text-sm font-medium text-gray-700 mb-2">
        {{ data.label }}
      </label>
      <div class="relative">
        <select 
          [disabled]="data.disabled || disabled"
          (change)="onSelectionChange($event)"
          [value]="value"
          class="
            w-full
            text-sm 
            bg-white 
            border 
            border-gray-300 
            rounded-lg 
            pl-3 
            pr-10
            py-2 
            text-gray-700 
            focus:outline-none 
            focus:border-blue-500 
            focus:bg-white 
            focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
            cursor-pointer
            disabled:opacity-50 
            disabled:cursor-not-allowed
            transition-all
            duration-200
            hover:border-gray-400
            appearance-none
            leading-tight
          "
          [class]="getSizeClasses()"
        >
          <option value="" disabled>{{ data.placeholder || 'Select an option' }}</option>
          <option 
            *ngFor="let option of data.options" 
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
    </div>
  `,
  styles: []
})
export class DropdownComponent implements ControlValueAccessor {
  @Input() data: DropdownData = {
    options: [],
    placeholder: 'Select an option'
  };

  @Output() selectionChange = new EventEmitter<string>();

  value = '';
  disabled = false;

  private onChange = (value: string) => {};
  public onTouched = () => {};

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.onChange(this.value);
    this.onTouched();
    this.selectionChange.emit(this.value);
  }

  getSizeClasses(): string {
    switch (this.data.size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-3';
      default: // md
        return 'text-sm px-3 py-2';
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
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
} 