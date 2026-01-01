import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalConfig {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  showBackdrop?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onBackdropClick($event)"
    >
      <!-- Backdrop -->
      <div 
        *ngIf="config.showBackdrop !== false"
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      ></div>

      <!-- Modal Container -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div 
          class="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto"
          [class]="getSizeClasses()"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ config.title }}
            </h3>
            <button
              *ngIf="config.showCloseButton !== false"
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              (click)="close()"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() config: ModalConfig = {
    title: '',
    size: 'md',
    showCloseButton: true,
    closeOnBackdropClick: true,
    showBackdrop: true
  };

  @Output() closeModal = new EventEmitter<void>();

  getSizeClasses(): string {
    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl',
      full: 'max-w-full mx-4'
    };
    return sizeClasses[this.config.size || 'md'];
  }

  close(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (this.config.closeOnBackdropClick !== false) {
      this.close();
    }
  }
} 