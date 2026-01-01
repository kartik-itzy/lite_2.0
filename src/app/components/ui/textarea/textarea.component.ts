import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface TextareaConfig {
  label?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
}

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ],
  template: `
    <div [class]="containerClasses">
      <!-- Label -->
      <label
        *ngIf="config.label"
        [for]="textareaId"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        {{ config.label }}
        <span *ngIf="config.required" class="text-danger-600">*</span>
      </label>

      <!-- Textarea Container -->
      <div class="relative">
        <textarea
          #textarea
          [id]="textareaId"
          [rows]="config.rows || 4"
          [placeholder]="config.placeholder"
          [disabled]="config.disabled"
          [readonly]="config.readonly"
          [required]="config.required"
          [attr.maxlength]="config.maxLength"
          [class]="textareaClasses"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()"
          (focus)="onFocus()"
        ></textarea>

        <!-- Character Counter -->
        <div 
          *ngIf="config.showCharacterCount && config.maxLength"
          class="absolute bottom-2 right-2 text-xs text-gray-400"
        >
          {{ currentLength }}/{{ config.maxLength }}
        </div>
      </div>

      <!-- Helper Text -->
      <p
        *ngIf="config.helperText && !config.errorText"
        class="mt-1 text-sm text-gray-500"
      >
        {{ config.helperText }}
      </p>

      <!-- Error Text -->
      <p
        *ngIf="config.errorText"
        class="mt-1 text-sm text-danger-600"
      >
        {{ config.errorText }}
      </p>
    </div>
  `,
  styles: []
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() config: TextareaConfig = {
    rows: 4,
    showCharacterCount: true
  };

  @ViewChild('textarea', { static: true }) textareaElement!: ElementRef<HTMLTextAreaElement>;

  value = '';
  currentLength = 0;
  focused = false;
  textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;

  private onChange = (value: any) => {};
  public onTouched = () => {};

  get containerClasses(): string {
    return this.config.fullWidth ? 'w-full' : '';
  }

  get textareaClasses(): string {
    const baseClasses = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const variantClasses = {
      default: 'border-gray-300 text-gray-900 placeholder-gray-500 bg-gray-50 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]',
      success: 'border-success-300 text-gray-900 placeholder-gray-500 bg-gray-50 focus:border-success-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(34,197,94,0.1)]',
      warning: 'border-warning-300 text-gray-900 placeholder-gray-500 bg-gray-50 focus:border-warning-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,158,11,0.1)]',
      danger: 'border-danger-300 text-gray-900 placeholder-gray-500 bg-gray-50 focus:border-danger-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
    };

    const counterPadding = this.config.showCharacterCount && this.config.maxLength ? 'pb-8' : '';

    return `${baseClasses} ${sizeClasses[this.config.size || 'md']} ${variantClasses[this.config.variant || 'default']} ${counterPadding}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.currentLength = this.value.length;
    this.onChange(this.value);
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value || '';
    this.currentLength = this.value.length;
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

  focus(): void {
    this.textareaElement.nativeElement.focus();
  }

  blur(): void {
    this.textareaElement.nativeElement.blur();
  }

  select(): void {
    this.textareaElement.nativeElement.select();
  }
} 