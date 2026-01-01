import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface TimeRangeInputConfig {
  label?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  separatorText?: string;
  disabled?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
}

@Component({
  selector: 'app-time-range-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeRangeInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      <!-- Label -->
      <label
        *ngIf="config.label"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        {{ config.label }}
        <span *ngIf="config.required" class="text-danger-600">*</span>
      </label>

      <!-- Time Range Container -->
      <div class="flex items-center space-x-3">
        <!-- Start Time -->
        <div class="flex-1">
          <label
            *ngIf="config.startTimeLabel"
            class="block text-xs text-gray-500 mb-1"
          >
            {{ config.startTimeLabel }}
          </label>
          <div class="relative">
            <input
              type="time"
              [value]="value.startTime"
              [disabled]="config.disabled"
              [required]="config.required"
              [class]="getInputClasses()"
              (input)="onStartTimeChange($event)"
              (blur)="onTouched()"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Separator -->
        <div class="flex items-center">
          <span class="text-sm text-gray-500 font-medium">
            {{ config.separatorText || 'to' }}
          </span>
        </div>

        <!-- End Time -->
        <div class="flex-1">
          <label
            *ngIf="config.endTimeLabel"
            class="block text-xs text-gray-500 mb-1"
          >
            {{ config.endTimeLabel }}
          </label>
          <div class="relative">
            <input
              type="time"
              [value]="value.endTime"
              [disabled]="config.disabled"
              [required]="config.required"
              [class]="getInputClasses()"
              (input)="onEndTimeChange($event)"
              (blur)="onTouched()"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TimeRangeInputComponent implements ControlValueAccessor {
  @Input() config: TimeRangeInputConfig = {
    separatorText: 'to'
  };

  @Output() timeRangeChange = new EventEmitter<TimeRange>();

  value: TimeRange = {
    startTime: '',
    endTime: ''
  };

  private onChange = (value: TimeRange) => {};
  public onTouched = () => {};

  getInputClasses(): string {
    const baseClasses = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed pr-10';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const variantClasses = {
      default: 'border-gray-300 text-gray-900 placeholder-gray-500 bg-gray-50 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
      outlined: 'border-gray-300 text-gray-900 placeholder-gray-500 bg-transparent focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
      filled: 'border-gray-300 text-gray-900 placeholder-gray-500 bg-gray-50 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
    };

    return `${baseClasses} ${sizeClasses[this.config.size || 'md']} ${variantClasses[this.config.variant || 'default']}`;
  }

  onStartTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.startTime = target.value;
    this.onChange(this.value);
    this.timeRangeChange.emit(this.value);
  }

  onEndTimeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.endTime = target.value;
    this.onChange(this.value);
    this.timeRangeChange.emit(this.value);
  }

  writeValue(value: TimeRange): void {
    this.value = value || { startTime: '', endTime: '' };
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.config.disabled = isDisabled;
  }
} 