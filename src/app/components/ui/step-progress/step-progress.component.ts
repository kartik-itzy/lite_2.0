import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Step {
  id: string;
  title: string;
  icon?: string;
  description?: string;
}

export interface StepProgressConfig {
  steps: Step[];
  currentStep: number;
  showStepNumbers?: boolean;
  variant?: 'default' | 'compact' | 'vertical';
}

@Component({
  selector: 'app-step-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
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
              <div *ngIf="step.icon" class="w-4 h-4">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <!-- Animated Connector Line -->
          <div 
            *ngIf="i < config.steps.length - 1"
            class="relative w-16 h-1 mx-4 overflow-hidden connector-line"
            [class]="getConnectorLineClasses(i)"
          >
            <!-- Background Line -->
            <div class="absolute inset-0 bg-gray-200 rounded-full"></div>
            
            <!-- Animated Progress Line -->
            <div 
              class="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700 ease-out"
              [class]="getConnectorAnimationClasses(i)"
              [style.width.%]="getConnectorProgress(i)"
            ></div>
            
            <!-- Animated Dot -->
            <div 
              *ngIf="isConnectorActive(i)"
              class="absolute top-1/2 left-0 w-2 h-2 bg-blue-600 rounded-full transform -translate-y-1/2 pulse-dot"
              [style.left.%]="getConnectorProgress(i)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes progressFill {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    
    @keyframes pulseDot {
      0%, 100% { 
        transform: translateY(-50%) scale(1);
        opacity: 1;
      }
      50% { 
        transform: translateY(-50%) scale(1.2);
        opacity: 0.8;
      }
    }
    
    @keyframes slideIn {
      0% { 
        transform: translateX(-100%);
        opacity: 0;
      }
      100% { 
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .progress-fill {
      animation: progressFill 0.8s ease-out forwards;
    }
    
    .pulse-dot {
      animation: pulseDot 2s ease-in-out infinite;
    }
    
    .slide-in {
      animation: slideIn 0.5s ease-out forwards;
    }
    
    .connector-line {
      position: relative;
      overflow: hidden;
    }
    
    .connector-line::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #60a5fa);
      border-radius: 9999px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .connector-line.completed::before {
      width: 100%;
    }
    
    .connector-line.current::before {
      width: 0%;
    }
    
    .connector-line.pending::before {
      width: 0%;
    }
  `]
})
export class StepProgressComponent {
  @Input() config: StepProgressConfig = {
    steps: [],
    currentStep: 0
  };

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

  getConnectorClasses(stepIndex: number): string {
    const isCompleted = stepIndex < this.config.currentStep;
    
    if (isCompleted) {
      return 'bg-blue-600';
    } else {
      return 'bg-gray-300';
    }
  }

  // Enhanced animation methods
  getConnectorAnimationClasses(stepIndex: number): string {
    const isCompleted = stepIndex < this.config.currentStep;
    const isCurrent = stepIndex === this.config.currentStep;
    
    if (isCompleted) {
      return 'bg-blue-600 shadow-sm';
    } else if (isCurrent) {
      return 'bg-blue-600 shadow-md';
    } else {
      return 'bg-gray-300';
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

  isConnectorActive(stepIndex: number): boolean {
    return stepIndex === this.config.currentStep;
  }

  getConnectorLineClasses(stepIndex: number): string {
    const isCompleted = stepIndex < this.config.currentStep;
    const isCurrent = stepIndex === this.config.currentStep;
    
    if (isCompleted) {
      return 'connector-line completed';
    } else if (isCurrent) {
      return 'connector-line current';
    } else {
      return 'connector-line pending';
    }
  }
} 