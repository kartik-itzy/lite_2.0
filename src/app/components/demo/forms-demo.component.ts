import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import form components
import { InputComponent } from '../ui/input/input.component';
import { TextareaComponent } from '../ui/textarea/textarea.component';
import { TimeRangeInputComponent } from '../ui/time-range-input/time-range-input.component';
import { ButtonComponent } from '../ui/button/button.component';
import { DropdownComponent } from '../ui/dropdown/dropdown.component';
import { CardComponent } from '../ui/card/card.component';
import { BadgeComponent } from '../ui/badge/badge.component';

@Component({
  selector: 'app-forms-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    TextareaComponent,
    TimeRangeInputComponent,
    ButtonComponent,
    DropdownComponent,
    CardComponent,
    BadgeComponent
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Form Components Demo</h1>
        <p class="text-sm text-gray-600">A showcase of form components and their integration with Angular Reactive Forms</p>
      </div>

      <!-- Basic Form Section -->
      <app-card class="mb-8" [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Basic Form</h2>
          <app-badge variant="primary">Reactive Forms</app-badge>
        </div>

        <form [formGroup]="basicForm" (ngSubmit)="onBasicFormSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-input
              formControlName="firstName"
              label="First Name"
              placeholder="Enter your first name"
              helperText="This field is required"
            ></app-input>
            
            <app-input
              formControlName="lastName"
              label="Last Name"
              placeholder="Enter your last name"
              helperText="This field is required"
            ></app-input>
            
            <app-input
              formControlName="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            ></app-input>
            
            <app-input
              formControlName="phone"
              type="tel"
              label="Phone Number"
              placeholder="Enter your phone number"
              icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            ></app-input>
          </div>
          
          <app-textarea
            formControlName="message"
            [config]="textareaConfig"
          ></app-textarea>
          
          <div class="flex gap-3">
            <app-button type="submit" [loading]="isSubmitting">
              Submit Form
            </app-button>
            <app-button variant="secondary" type="button" (clicked)="resetBasicForm()">
              Reset
            </app-button>
          </div>
        </form>

        <div card-footer class="text-sm text-gray-500">
          All form components integrate seamlessly with Angular Reactive Forms and support validation.
        </div>
      </app-card>

      <!-- Advanced Form Section -->
      <app-card class="mb-8" [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Advanced Form</h2>
          <app-badge variant="success">Complex Integration</app-badge>
        </div>

        <form [formGroup]="advancedForm" (ngSubmit)="onAdvancedFormSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-input
              formControlName="title"
              label="Title"
              placeholder="Enter title"
              helperText="Required field"
            ></app-input>
            
            <app-dropdown 
              [data]="categoryDropdown"
              formControlName="category">
            </app-dropdown>
          </div>
          
          <app-time-range-input
            [config]="timeRangeConfig"
            formControlName="timeRange">
          </app-time-range-input>
          
          <app-textarea
            formControlName="description"
            [config]="descriptionConfig">
          </app-textarea>
          
          <div class="flex gap-3">
            <app-button type="submit" [loading]="isAdvancedSubmitting">
              Save
            </app-button>
            <app-button variant="secondary" type="button" (clicked)="resetAdvancedForm()">
              Cancel
            </app-button>
          </div>
        </form>

        <div card-footer class="text-sm text-gray-500">
          Advanced forms can include dropdowns, time ranges, and complex validation rules.
        </div>
      </app-card>

      <!-- Form States Section -->
      <app-card class="mb-8" [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Form States</h2>
          <app-badge variant="info">Validation Examples</app-badge>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-input
              label="Success Input"
              variant="success"
              placeholder="This input is valid"
              helperText="Great! This field is valid"
              value="Valid value"
            ></app-input>
            
            <app-input
              label="Error Input"
              variant="danger"
              placeholder="This input has an error"
              errorText="This field is required"
              value=""
            ></app-input>
            
            <app-input
              label="Disabled Input"
              [disabled]="true"
              placeholder="This input is disabled"
              value="Disabled value"
            ></app-input>
            
            <app-input
              label="Readonly Input"
              [readonly]="true"
              value="Readonly value"
            ></app-input>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Form components support various states including success, error, disabled, and readonly.
        </div>
      </app-card>

      <!-- Form Results Section -->
      <app-card class="mb-8" [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Form Results</h2>
          <app-badge variant="warning">Live Preview</app-badge>
        </div>

        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Basic Form Data:</h3>
            <pre class="bg-gray-100 p-4 rounded-lg text-sm">{{ basicForm.value | json }}</pre>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Advanced Form Data:</h3>
            <pre class="bg-gray-100 p-4 rounded-lg text-sm">{{ advancedForm.value | json }}</pre>
          </div>
          
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-2">Form Validation:</h3>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-sm">Basic Form Valid:</span>
                <app-badge [variant]="basicForm.valid ? 'success' : 'danger'">
                  {{ basicForm.valid ? 'Valid' : 'Invalid' }}
                </app-badge>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm">Advanced Form Valid:</span>
                <app-badge [variant]="advancedForm.valid ? 'success' : 'danger'">
                  {{ advancedForm.valid ? 'Valid' : 'Invalid' }}
                </app-badge>
              </div>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Form data is automatically synchronized with the component state and can be validated in real-time.
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class FormsDemoComponent {
  basicForm!: FormGroup;
  advancedForm!: FormGroup;
  isSubmitting = false;
  isAdvancedSubmitting = false;

  // Textarea Configuration
  textareaConfig = {
    label: 'Message',
    placeholder: 'Enter your message here...',
    maxLength: 500,
    showCharacterCount: true,
    rows: 4,
    size: 'md' as const,
    variant: 'default' as const
  };

  // Time Range Configuration
  timeRangeConfig = {
    label: 'Time Range',
    startTimeLabel: 'Start',
    endTimeLabel: 'End',
    separatorText: 'to',
    size: 'md' as const,
    variant: 'default' as const
  };

  // Description Configuration
  descriptionConfig = {
    label: 'Description',
    placeholder: 'Enter a detailed description...',
    maxLength: 1000,
    showCharacterCount: true,
    rows: 6,
    size: 'md' as const,
    variant: 'default' as const
  };

  // Category Dropdown Configuration
  categoryDropdown = {
    label: 'Category',
    placeholder: 'Select a category',
    options: [
      { value: 'general', label: 'General' },
      { value: 'technical', label: 'Technical' },
      { value: 'support', label: 'Support' },
      { value: 'feature', label: 'Feature Request' }
    ],
    size: 'md' as const
  };

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Basic Form
    this.basicForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Advanced Form
    this.advancedForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      timeRange: [{
        startTime: '09:00',
        endTime: '10:00'
      }, Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  onBasicFormSubmit(): void {
    if (this.basicForm.valid) {
      this.isSubmitting = true;
      // Simulate API call
      setTimeout(() => {
        console.log('Basic form submitted:', this.basicForm.value);
        this.isSubmitting = false;
        this.resetBasicForm();
      }, 2000);
    } else {
      this.markFormGroupTouched(this.basicForm);
    }
  }

  onAdvancedFormSubmit(): void {
    if (this.advancedForm.valid) {
      this.isAdvancedSubmitting = true;
      // Simulate API call
      setTimeout(() => {
        console.log('Advanced form submitted:', this.advancedForm.value);
        this.isAdvancedSubmitting = false;
        this.resetAdvancedForm();
      }, 2000);
    } else {
      this.markFormGroupTouched(this.advancedForm);
    }
  }

  resetBasicForm(): void {
    this.basicForm.reset();
  }

  resetAdvancedForm(): void {
    this.advancedForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
} 