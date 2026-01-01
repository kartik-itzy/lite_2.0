import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../ui/modal/modal.component';
import { StepperComponent, StepperConfig, StepperStep } from '../ui/stepper/stepper.component';
import { ButtonComponent } from '../ui/button/button.component';

export interface ModalConfig {
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton: boolean;
  closeOnBackdropClick: boolean;
  showBackdrop: boolean;
}

@Component({
  selector: 'app-demo-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    StepperComponent,
    ButtonComponent
  ],
  template: `
    <!-- Trigger Button -->
    <app-button variant="primary" (clicked)="openModal()">
      Open Demo Modal
    </app-button>

    <!-- Modal -->
    <app-modal [isOpen]="showModal" [config]="modalConfig" (closeModal)="closeModal()">
      <!-- Stepper -->
      <app-stepper 
        [config]="stepperConfig" 
        (stepChanged)="onStepChanged($event)"
        (stepCompleted)="onStepCompleted($event)"
        (stepperFinished)="onStepperFinished($event)"
      ></app-stepper>
    </app-modal>
  `
})
export class DemoModalComponent {
  showModal = false;
  
  // Modal Configuration
  modalConfig: ModalConfig = {
    title: 'Create New Order',
    size: 'xl',
    showCloseButton: true,
    closeOnBackdropClick: true,
    showBackdrop: true
  };

  // Stepper Configuration
  stepperConfig: StepperConfig = {
    steps: [
      { 
        id: 'product-selection', 
        title: 'Product Selection', 
        icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        description: 'Choose your products and quantities'
      },
      { 
        id: 'customer-info', 
        title: 'Customer Information', 
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        description: 'Enter customer details and preferences'
      },
      { 
        id: 'delivery-options', 
        title: 'Delivery & Payment', 
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        description: 'Select delivery method and payment'
      }
    ],
    currentStep: 0,
    showNavigation: true,
    allowBackNavigation: true,
    showProgress: true
  };

  // Methods
  openModal(): void {
    console.log('Opening modal...');
    this.showModal = true;
    console.log('Modal state:', this.showModal);
  }

  closeModal(): void {
    console.log('Closing modal...');
    this.showModal = false;
  }

  // Stepper Event Handlers
  onStepChanged(event: { currentStep: number, previousStep: number }): void {
    console.log('Step changed:', event);
  }

  onStepCompleted(event: { step: StepperStep, stepIndex: number }): void {
    console.log('Step completed:', event);
  }

  onStepperFinished(event: { steps: StepperStep[], currentStep: number }): void {
    console.log('Stepper finished:', event);
    console.log('Form data:', {
      step: event.currentStep,
      totalSteps: event.steps.length
    });
    
    // Here you would typically submit the data to your backend
    // For now, we'll just close the modal
    this.closeModal();
  }
} 