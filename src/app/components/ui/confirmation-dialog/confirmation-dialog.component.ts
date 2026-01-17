import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  icon?: string;
  requireTextInput?: boolean;
  textInputLabel?: string;
  textInputPlaceholder?: string;
  expectedText?: string;
  textInputError?: string;
  loading?: boolean;
  error?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="onBackdropClick($event)">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div *ngIf="data.icon" class="flex-shrink-0">
              <svg class="w-6 h-6" [class]="getIconClasses()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="data.icon"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6">
          <p class="text-gray-600">{{ data.message }}</p>
          
          <!-- Text Input for Sensitive Delete -->
          <div *ngIf="data.requireTextInput" class="mt-4">
            <app-input
              [(ngModel)]="textInputValue"
              [label]="data.textInputLabel || 'Confirmation'"
              [placeholder]="data.textInputPlaceholder || 'Type to confirm'"
              [errorText]="textInputError"
              (ngModelChange)="onTextInputChange()">
            </app-input>
          </div>
          
          <!-- Error Message -->
          <div *ngIf="data.error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ data.error }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <app-button 
            variant="secondary" 
            (clicked)="onCancel()"
            [disabled]="data.loading || false">
            {{ data.cancelText || 'Cancel' }}
          </app-button>
          <app-button 
            [variant]="data.variant === 'danger' ? 'danger' : 'primary'"
            (clicked)="onConfirm()"
            [loading]="data.loading || false"
            [disabled]="!canConfirm()">
            {{ data.confirmText || 'Confirm' }}
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ConfirmationDialogComponent {
  @Input() data: ConfirmationDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'info'
  };

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  textInputValue = '';
  textInputError = '';

  onConfirm(): void {
    if (this.canConfirm()) {
      this.confirmed.emit();
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onTextInputChange(): void {
    this.textInputError = '';
    if (this.data.requireTextInput && this.data.expectedText) {
      if (this.textInputValue !== this.data.expectedText) {
        this.textInputError = this.data.textInputError || 'Text does not match';
      }
    }
  }

  canConfirm(): boolean {
    if (this.data.loading) {
      return false;
    }
    
    if (this.data.requireTextInput && this.data.expectedText) {
      return this.textInputValue === this.data.expectedText;
    }
    
    return true;
  }

  getIconClasses(): string {
    switch (this.data.variant) {
      case 'danger':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'primary':
        return 'text-blue-600';
      default:
        return 'text-blue-500';
    }
  }

  // Methods for external control
  setLoading(loading: boolean): void {
    this.data = { ...this.data, loading };
  }

  setError(error: string): void {
    this.data = { ...this.data, error };
  }

  clearError(): void {
    this.data = { ...this.data, error: undefined };
  }

  reset(): void {
    this.textInputValue = '';
    this.textInputError = '';
    this.data = { ...this.data, error: undefined, loading: false };
  }
}