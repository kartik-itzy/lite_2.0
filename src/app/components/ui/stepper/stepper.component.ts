import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepperStep {
  id: string;
  title: string;
  icon?: string;
  description?: string;
}

export interface StepperConfig {
  steps: StepperStep[];
  currentStep: number;
  showNavigation?: boolean;
  allowBackNavigation?: boolean;
  showProgress?: boolean;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <!-- Step Progress Indicator -->
      <div *ngIf="config.showProgress !== false" class="mb-8">
        <div class="flex items-center">
          <div 
            *ngFor="let step of config.steps; let i = index"
            class="flex items-center"
          >
            <!-- Step Circle and Title -->
            <div class="flex items-center">
              <div 
                class="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ease-in-out"
                [class]="getStepCircleClasses(i)"
              >
                <!-- Step Icon or Number -->
                <div *ngIf="step.icon" class="w-4 h-4 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="step.icon"></path>
                  </svg>
                </div>
                <span *ngIf="!step.icon" class="text-sm font-medium">
                  {{ i + 1 }}
                </span>
              </div>
              
              <!-- Step Title -->
              <div class="ml-3">
                <p 
                  class="text-sm font-medium transition-all duration-300 ease-in-out"
                  [class]="getStepTitleClasses(i)"
                >
                  {{ step.title }}
                </p>
                <p 
                  *ngIf="step.description"
                  class="text-xs text-gray-500 transition-all duration-300 ease-in-out"
                >
                  {{ step.description }}
                </p>
              </div>
            </div>

            <!-- Connector Line -->
            <div 
              *ngIf="i < config.steps.length - 1"
              class="relative w-16 h-1 mx-4 overflow-hidden"
            >
              <!-- Background Line -->
              <div class="absolute inset-0 bg-gray-200 rounded-full"></div>
              
              <!-- Progress Line -->
              <div 
                class="absolute inset-0 bg-blue-600 rounded-full transition-all duration-700 ease-out"
                [style.width.%]="getConnectorProgress(i)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="min-h-[400px] p-6 bg-white rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ config.steps[config.currentStep].title || 'Step' }}
        </h3>
        <p class="text-gray-600">
          {{ config.steps[config.currentStep].description || 'Step content goes here.' }}
        </p>
      </div>

      <!-- Navigation Buttons -->
      <div *ngIf="config.showNavigation !== false" class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div>
          <button 
            *ngIf="config.allowBackNavigation !== false && config.currentStep > 0"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            (click)="previousStep()"
          >
            Previous
          </button>
        </div>
        
        <div class="flex space-x-3">
          <button 
            *ngIf="config.currentStep < config.steps.length - 1"
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            (click)="nextStep()"
          >
            Next
          </button>
          
          <button 
            *ngIf="config.currentStep === config.steps.length - 1"
            type="button"
            class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            (click)="finish()"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .connector-line {
      position: relative;
      overflow: hidden;
    }
  `]
})
export class StepperComponent {
  @Input() config: StepperConfig = {
    steps: [],
    currentStep: 0,
    showNavigation: true,
    allowBackNavigation: true,
    showProgress: true
  };

  @Output() stepChanged = new EventEmitter<{ currentStep: number, previousStep: number }>();
  @Output() stepCompleted = new EventEmitter<{ step: StepperStep, stepIndex: number }>();
  @Output() stepperFinished = new EventEmitter<{ steps: StepperStep[], currentStep: number }>();

  // Step Progress Methods
  getStepCircleClasses(stepIndex: number): string {
    const isCurrent = stepIndex === this.config.currentStep;
    const isCompleted = stepIndex < this.config.currentStep;
    
    if (isCompleted) {
      return 'bg-blue-600 border-blue-600 text-white';
    } else if (isCurrent) {
      return 'bg-blue-600 border-blue-600 text-white';
    } else {
      return 'bg-white border-gray-300 text-gray-400';
    }
  }

  getStepTitleClasses(stepIndex: number): string {
    const isCurrent = stepIndex === this.config.currentStep;
    const isCompleted = stepIndex < this.config.currentStep;
    
    if (isCompleted || isCurrent) {
      return 'text-blue-600';
    } else {
      return 'text-gray-500';
    }
  }

  getConnectorProgress(stepIndex: number): number {
    const isCompleted = stepIndex < this.config.currentStep;
    
    if (isCompleted) {
      return 100; // Fully filled only for completed steps
    } else {
      return 0; // Empty for current and pending steps
    }
  }

  // Navigation Methods
  previousStep(): void {
    if (this.config.currentStep > 0) {
      const previousStep = this.config.currentStep;
      this.config.currentStep--;
      this.stepChanged.emit({ 
        currentStep: this.config.currentStep, 
        previousStep 
      });
    }
  }

  nextStep(): void {
    if (this.config.currentStep < this.config.steps.length - 1) {
      const previousStep = this.config.currentStep;
      this.config.currentStep++;
      
      // Emit step completed event
      this.stepCompleted.emit({
        step: this.config.steps[previousStep],
        stepIndex: previousStep
      });
      
      this.stepChanged.emit({ 
        currentStep: this.config.currentStep, 
        previousStep 
      });
    }
  }

  finish(): void {
    this.stepperFinished.emit({
      steps: this.config.steps,
      currentStep: this.config.currentStep
    });
  }

  // Public API Methods
  goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.config.steps.length) {
      const previousStep = this.config.currentStep;
      this.config.currentStep = stepIndex;
      this.stepChanged.emit({ 
        currentStep: this.config.currentStep, 
        previousStep 
      });
    }
  }

  reset(): void {
    this.config.currentStep = 0;
  }

  isStepCompleted(stepIndex: number): boolean {
    return stepIndex < this.config.currentStep;
  }

  isStepCurrent(stepIndex: number): boolean {
    return stepIndex === this.config.currentStep;
  }

  isStepPending(stepIndex: number): boolean {
    return stepIndex > this.config.currentStep;
  }
} 