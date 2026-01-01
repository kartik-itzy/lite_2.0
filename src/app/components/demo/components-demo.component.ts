import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

// Import our components
import { ButtonComponent } from '../ui/button/button.component';
import { InputComponent } from '../ui/input/input.component';
import { CardComponent } from '../ui/card/card.component';
import { BadgeComponent } from '../ui/badge/badge.component';
import { LoadingComponent } from '../ui/loading/loading.component';
import { AlertComponent } from '../ui/alert/alert.component';
import { TableComponent, TableColumn, TableRow } from '../ui/table/table.component';
import { ProgressComponent } from '../ui/progress/progress.component';
import { SwitchComponent } from '../ui/switch/switch.component';

// Import dashboard components
import { GreetingCardComponent, GreetingCardData } from '../ui/greeting-card/greeting-card.component';
import { StatCardComponent, StatCardData } from '../ui/stat-card/stat-card.component';
import { ChartCardComponent, ChartCardData } from '../ui/chart-card/chart-card.component';
import { ProgressCardComponent, ProgressCardData, ProgressItem } from '../ui/progress-card/progress-card.component';
import { ListCardComponent, ListCardData, ListItem } from '../ui/list-card/list-card.component';
import { MetricCardComponent, MetricCardData } from '../ui/metric-card/metric-card.component';

@Component({
  selector: 'app-components-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
    BadgeComponent,
    LoadingComponent,
    AlertComponent,
    TableComponent,
    ProgressComponent,
    SwitchComponent,
    // Dashboard components
    GreetingCardComponent,
    StatCardComponent,
    ChartCardComponent,
    ProgressCardComponent,
    ListCardComponent,
    MetricCardComponent
  ],
  template: `
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">UI Components Demo</h1>
        <p class="text-sm text-gray-600">A showcase of reusable Angular components built with Tailwind CSS</p>
      </div>

      <!-- Dashboard Components Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Dashboard Components</h2>
          <app-badge variant="primary">6 Components</app-badge>
        </div>

                 <div class="space-y-10">
           <!-- Greeting Card -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-6">Greeting Card</h3>
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <app-greeting-card [data]="greetingData1"></app-greeting-card>
              <app-greeting-card [data]="greetingData2"></app-greeting-card>
            </div>
          </div>

                     <!-- Stat Cards -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-6">Stat Cards</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <app-stat-card [data]="statData1"></app-stat-card>
              <app-stat-card [data]="statData2"></app-stat-card>
              <app-stat-card [data]="statData3"></app-stat-card>
              <app-stat-card [data]="statData4"></app-stat-card>
            </div>
          </div>

                     <!-- Chart Cards -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-6">Chart Cards</h3>
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <app-chart-card [data]="chartData1">
                <div class="h-48 bg-gray-100 rounded flex items-center justify-center">
                  <p class="text-sm text-gray-500">Chart Placeholder</p>
                </div>
              </app-chart-card>
              <app-chart-card [data]="chartData2">
                <div class="h-48 bg-gray-100 rounded flex items-center justify-center">
                  <p class="text-sm text-gray-500">Chart Placeholder</p>
                </div>
              </app-chart-card>
            </div>
          </div>

                     <!-- Progress Cards -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-6">Progress Cards</h3>
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <app-progress-card [data]="progressData1"></app-progress-card>
              <app-progress-card [data]="progressData2"></app-progress-card>
            </div>
          </div>

                     <!-- List Cards -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-6">List Cards</h3>
             <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <app-list-card [data]="listData1" (itemAction)="onItemAction($event)"></app-list-card>
              <app-list-card [data]="listData2" (itemAction)="onItemAction($event)"></app-list-card>
            </div>
          </div>

                     <!-- Metric Cards -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-6">Metric Cards</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <app-metric-card [data]="metricData1"></app-metric-card>
              <app-metric-card [data]="metricData2"></app-metric-card>
              <app-metric-card [data]="metricData3"></app-metric-card>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Dashboard components provide reusable patterns for building comprehensive dashboards and analytics interfaces.
        </div>
      </app-card>

      <!-- Buttons Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Buttons</h2>
          <app-badge variant="primary">5 Variants</app-badge>
        </div>

                 <div class="space-y-8">
           <!-- Button Variants -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Variants</h3>
             <div class="flex flex-wrap gap-4">
              <app-button variant="primary">Primary</app-button>
              <app-button variant="secondary">Secondary</app-button>
              <app-button variant="success">Success</app-button>
              <app-button variant="warning">Warning</app-button>
              <app-button variant="danger">Danger</app-button>
              <app-button variant="ghost">Ghost</app-button>
            </div>
          </div>

                     <!-- Button Sizes -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Sizes</h3>
             <div class="flex flex-wrap items-center gap-4">
              <app-button size="sm">Small</app-button>
              <app-button size="md">Medium</app-button>
              <app-button size="lg">Large</app-button>
            </div>
          </div>

                     <!-- Button States -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">States</h3>
             <div class="flex flex-wrap gap-4">
              <app-button>Normal</app-button>
              <app-button [loading]="true">Loading</app-button>
              <app-button [disabled]="true">Disabled</app-button>
              <app-button icon="M12 4v16m8-8H4">With Icon</app-button>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Buttons support various variants, sizes, and states with full form integration.
        </div>
      </app-card>

      <!-- Inputs Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Input Fields</h2>
          <app-badge variant="success">4 Variants</app-badge>
        </div>

                 <div class="space-y-8">
           <!-- Input Types -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Types</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-input
                label="Text Input"
                placeholder="Enter text..."
                helperText="This is a helper text"
              ></app-input>
              <app-input
                type="email"
                label="Email Input"
                placeholder="Enter email..."
                icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              ></app-input>
              <app-input
                type="password"
                label="Password Input"
                placeholder="Enter password..."
                icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></app-input>
              <app-input
                type="number"
                label="Number Input"
                placeholder="Enter number..."
                helperText="Numbers only"
              ></app-input>
            </div>
          </div>

                     <!-- Input States -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">States</h3>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-input
                label="Success Input"
                variant="success"
                placeholder="Success state..."
                helperText="This input is valid"
              ></app-input>
              <app-input
                label="Error Input"
                variant="danger"
                placeholder="Error state..."
                errorText="This field is required"
              ></app-input>
              <app-input
                label="Disabled Input"
                [disabled]="true"
                placeholder="Disabled..."
              ></app-input>
              <app-input
                label="Readonly Input"
                [readonly]="true"
                value="Readonly value"
              ></app-input>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Inputs support various types, states, and form validation with proper accessibility.
        </div>
      </app-card>

      <!-- Cards Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Cards</h2>
          <app-badge variant="warning">4 Variants</app-badge>
        </div>

                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-card variant="default" [clickable]="true">
            <h3 class="font-semibold text-gray-900 mb-2">Default Card</h3>
            <p class="text-sm text-gray-600">A simple card with default styling.</p>
          </app-card>

          <app-card variant="elevated" [clickable]="true">
            <h3 class="font-semibold text-gray-900 mb-2">Elevated Card</h3>
            <p class="text-sm text-gray-600">Card with enhanced shadow and hover effects.</p>
          </app-card>

          <app-card variant="outlined" [clickable]="true">
            <h3 class="font-semibold text-gray-900 mb-2">Outlined Card</h3>
            <p class="text-sm text-gray-600">Card with prominent border styling.</p>
          </app-card>

          <app-card variant="flat" [clickable]="true">
            <h3 class="font-semibold text-gray-900 mb-2">Flat Card</h3>
            <p class="text-sm text-gray-600">Minimal card with subtle background.</p>
          </app-card>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Cards support different variants and can be made clickable with hover effects.
        </div>
      </app-card>

      <!-- Badges Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Badges</h2>
          <app-badge variant="info">8 Variants</app-badge>
        </div>

                 <div class="space-y-8">
           <!-- Badge Variants -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Variants</h3>
             <div class="flex flex-wrap gap-3">
              <app-badge variant="primary">Primary</app-badge>
              <app-badge variant="secondary">Secondary</app-badge>
              <app-badge variant="success">Success</app-badge>
              <app-badge variant="warning">Warning</app-badge>
              <app-badge variant="danger">Danger</app-badge>
              <app-badge variant="info">Info</app-badge>
              <app-badge variant="light">Light</app-badge>
              <app-badge variant="dark">Dark</app-badge>
            </div>
          </div>

                     <!-- Badge Styles -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Styles</h3>
             <div class="flex flex-wrap gap-3">
              <app-badge style="solid" variant="primary">Solid</app-badge>
              <app-badge style="outline" variant="primary">Outline</app-badge>
              <app-badge style="soft" variant="primary">Soft</app-badge>
            </div>
          </div>

                     <!-- Badge Sizes -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Sizes</h3>
             <div class="flex flex-wrap items-center gap-3">
              <app-badge size="sm" variant="primary">Small</app-badge>
              <app-badge size="md" variant="primary">Medium</app-badge>
              <app-badge size="lg" variant="primary">Large</app-badge>
            </div>
          </div>

                     <!-- Badge Features -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Features</h3>
             <div class="flex flex-wrap gap-3">
              <app-badge [rounded]="true" variant="primary">Rounded</app-badge>
              <app-badge [removable]="true" variant="danger">Removable</app-badge>
              <app-badge icon="M5 13l4 4L19 7" variant="success">With Icon</app-badge>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Badges support various styles, sizes, and can include icons or remove buttons.
        </div>
      </app-card>

      <!-- Loading Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Loading Indicators</h2>
          <app-badge variant="dark">4 Types</app-badge>
        </div>

                 <div class="space-y-8">
           <!-- Loading Types -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Types</h3>
             <div class="flex flex-wrap items-center gap-10">
              <div class="text-center">
                <app-loading type="spinner" size="lg"></app-loading>
                <p class="text-sm text-gray-600 mt-2">Spinner</p>
              </div>
              <div class="text-center">
                <app-loading type="dots" size="lg"></app-loading>
                <p class="text-sm text-gray-600 mt-2">Dots</p>
              </div>
              <div class="text-center">
                <app-loading type="bars" size="lg"></app-loading>
                <p class="text-sm text-gray-600 mt-2">Bars</p>
              </div>
              <div class="text-center">
                <app-loading type="pulse" size="lg"></app-loading>
                <p class="text-sm text-gray-600 mt-2">Pulse</p>
              </div>
            </div>
          </div>

                     <!-- Loading Sizes -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Sizes</h3>
             <div class="flex flex-wrap items-center gap-10">
              <div class="text-center">
                <app-loading type="spinner" size="sm"></app-loading>
                <p class="text-sm text-gray-600 mt-2">Small</p>
              </div>
              <div class="text-center">
                <app-loading type="spinner" size="md"></app-loading>
                <p class="text-sm text-gray-600 mt-2">Medium</p>
              </div>
              <div class="text-center">
                <app-loading type="spinner" size="lg"></app-loading>
                <p class="text-sm text-gray-600 mt-2">Large</p>
              </div>
              <div class="text-center">
                <app-loading type="spinner" size="xl"></app-loading>
                <p class="text-sm text-gray-600 mt-2">Extra Large</p>
              </div>
            </div>
          </div>

                     <!-- Loading with Text -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">With Text</h3>
             <div class="flex flex-wrap gap-6">
              <app-loading type="spinner" text="Loading..." color="primary"></app-loading>
              <app-loading type="dots" text="Processing..." color="success"></app-loading>
              <app-loading type="bars" text="Saving..." color="warning"></app-loading>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Loading indicators support multiple types, sizes, and can include descriptive text.
        </div>
      </app-card>

      <!-- Form Demo -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Form Integration</h2>
          <app-badge variant="success">Reactive Forms</app-badge>
        </div>

                 <form [formGroup]="demoForm" (ngSubmit)="onSubmit()" class="space-y-6">
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-input
              formControlName="name"
              label="Full Name"
              placeholder="Enter your full name"
              helperText="This field is required"
            ></app-input>
            <app-input
              formControlName="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
            ></app-input>
          </div>
                     <div class="flex gap-4">
            <app-button type="submit" [loading]="isSubmitting">
              Submit Form
            </app-button>
            <app-button variant="secondary" type="button" (clicked)="resetForm()">
              Reset
            </app-button>
          </div>
        </form>

        <div card-footer class="text-sm text-gray-500">
          All components integrate seamlessly with Angular Reactive Forms.
        </div>
      </app-card>

      <!-- Alerts Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Alerts</h2>
          <app-badge variant="warning">6 Variants</app-badge>
        </div>

                 <div class="space-y-6">
           <app-alert
            variant="primary"
            title="Information"
            message="This is an informational alert with some important details."
            [dismissible]="true"
          ></app-alert>

          <app-alert
            variant="success"
            title="Success"
            message="Your action was completed successfully!"
            [dismissible]="true"
          ></app-alert>

          <app-alert
            variant="warning"
            title="Warning"
            message="Please review your input before proceeding."
            [dismissible]="true"
          ></app-alert>

          <app-alert
            variant="danger"
            title="Error"
            message="Something went wrong. Please try again."
            [dismissible]="true"
          ></app-alert>

          <app-alert
            variant="info"
            title="Tip"
            message="Here's a helpful tip for you."
            [dismissible]="true"
          ></app-alert>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Alerts provide contextual feedback for user actions with different severity levels.
        </div>
      </app-card>

      <!-- Progress Bars Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Progress Bars</h2>
          <app-badge variant="success">5 Variants</app-badge>
        </div>

                 <div class="space-y-8">
           <!-- Progress Variants -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Variants</h3>
             <div class="space-y-6">
              <app-progress
                [value]="75"
                label="Primary Progress"
                [config]="{ variant: 'primary', showPercentage: true }"
              ></app-progress>

              <app-progress
                [value]="60"
                label="Success Progress"
                [config]="{ variant: 'success', showPercentage: true }"
              ></app-progress>

              <app-progress
                [value]="45"
                label="Warning Progress"
                [config]="{ variant: 'warning', showPercentage: true }"
              ></app-progress>

              <app-progress
                [value]="30"
                label="Danger Progress"
                [config]="{ variant: 'danger', showPercentage: true }"
              ></app-progress>
            </div>
          </div>

                     <!-- Progress Sizes -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Sizes</h3>
             <div class="space-y-6">
              <app-progress
                [value]="50"
                label="Small Progress"
                [config]="{ size: 'sm', showPercentage: true }"
              ></app-progress>

              <app-progress
                [value]="50"
                label="Medium Progress"
                [config]="{ size: 'md', showPercentage: true }"
              ></app-progress>

              <app-progress
                [value]="50"
                label="Large Progress"
                [config]="{ size: 'lg', showPercentage: true }"
              ></app-progress>
            </div>
          </div>

                     <!-- Progress Styles -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Styles</h3>
             <div class="space-y-6">
              <app-progress
                [value]="80"
                label="Animated Progress"
                [config]="{ animated: true, showPercentage: true }"
              ></app-progress>

              <app-progress
                [value]="65"
                label="Inside Label"
                [config]="{ labelPosition: 'inside', showPercentage: true }"
              ></app-progress>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Progress bars show completion status with various styles and configurations.
        </div>
      </app-card>

      <!-- Switches Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Switches</h2>
          <app-badge variant="primary">5 Variants</app-badge>
        </div>

                 <div class="space-y-8">
           <!-- Switch Variants -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Variants</h3>
             <div class="space-y-6">
              <app-switch
                label="Primary Switch"
                description="This is a primary switch with description"
                [config]="{ variant: 'primary', showDescription: true }"
              ></app-switch>

              <app-switch
                label="Success Switch"
                description="This is a success switch with description"
                [config]="{ variant: 'success', showDescription: true }"
              ></app-switch>

              <app-switch
                label="Warning Switch"
                description="This is a warning switch with description"
                [config]="{ variant: 'warning', showDescription: true }"
              ></app-switch>

              <app-switch
                label="Danger Switch"
                description="This is a danger switch with description"
                [config]="{ variant: 'danger', showDescription: true }"
              ></app-switch>
            </div>
          </div>

                     <!-- Switch Sizes -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">Sizes</h3>
             <div class="space-y-6">
              <app-switch
                label="Small Switch"
                [config]="{ size: 'sm' }"
              ></app-switch>

              <app-switch
                label="Medium Switch"
                [config]="{ size: 'md' }"
              ></app-switch>

              <app-switch
                label="Large Switch"
                [config]="{ size: 'lg' }"
              ></app-switch>
            </div>
          </div>

                     <!-- Switch States -->
           <div>
             <h3 class="text-sm font-semibold text-gray-900 mb-4">States</h3>
             <div class="space-y-6">
              <app-switch
                label="Disabled Switch"
                [config]="{ disabled: true }"
              ></app-switch>

              <app-switch
                label="Loading Switch"
                [config]="{ loading: true }"
              ></app-switch>
            </div>
          </div>
        </div>

        <div card-footer class="text-sm text-gray-500">
          Switches provide toggle functionality with various states and configurations.
        </div>
      </app-card>

      <!-- Table Section -->
      <app-card [header]="true" [footer]="true">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Data Table</h2>
          <app-badge variant="info">Interactive</app-badge>
        </div>

        <app-table
          [columns]="tableColumns"
          [rows]="tableRows"
          [config]="tableConfig"
          (rowClick)="onTableRowClick($event)"
          (rowSelect)="onTableRowSelect($event)"
        ></app-table>

        <div card-footer class="text-sm text-gray-500">
          Data tables support sorting, searching, pagination, and row selection.
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class ComponentsDemoComponent {
  demoForm: FormGroup;
  isSubmitting = false;

  // Dashboard component data
  greetingData1: GreetingCardData = {
    title: 'Good morning!',
    subtitle: 'Welcome back to your dashboard',
    userName: 'John Doe',
    date: 'Monday, January 15, 2024',
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  };

  greetingData2: GreetingCardData = {
    title: 'Hello there!',
    subtitle: 'Ready to start your day?',
    userName: 'Sarah Wilson',
    date: 'Tuesday, January 16, 2024',
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
  };

  statData1: StatCardData = {
    title: 'Total Revenue',
    value: '$45,231',
    subtitle: '+20.1% from last month',
    change: {
      value: 20.1,
      isPositive: true,
      label: 'from last month'
    },
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    iconColor: 'text-green-500'
  };

  statData2: StatCardData = {
    title: 'Subscriptions',
    value: '+2350',
    subtitle: '+180.1% from last month',
    change: {
      value: 180.1,
      isPositive: true,
      label: 'from last month'
    },
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    iconColor: 'text-blue-500'
  };

  statData3: StatCardData = {
    title: 'Sales',
    value: '+12,234',
    subtitle: '+19% from last month',
    change: {
      value: 19,
      isPositive: true,
      label: 'from last month'
    },
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01',
    iconColor: 'text-purple-500'
  };

  statData4: StatCardData = {
    title: 'Active Now',
    value: '+573',
    subtitle: '+201 since last hour',
    change: {
      value: 201,
      isPositive: true,
      label: 'since last hour'
    },
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    iconColor: 'text-orange-500'
  };

  chartData1: ChartCardData = {
    title: 'Revenue',
    subtitle: 'Monthly revenue overview',
    total: '$45,231.89',
    period: 'This month',
    showPeriodSelector: true,
    periodOptions: ['This week', 'This month', 'This year'],
    selectedPeriod: 'This month'
  };

  chartData2: ChartCardData = {
    title: 'Active Users',
    subtitle: 'User engagement metrics',
    total: '+2,350',
    period: 'This month',
    showPeriodSelector: true,
    periodOptions: ['This week', 'This month', 'This year'],
    selectedPeriod: 'This month'
  };

  progressData1: ProgressCardData = {
    title: 'Customer Orders',
    subtitle: 'Order completion rates',
    items: [
      { label: 'Completed', value: 45, color: 'bg-green-500', percentage: 75 },
      { label: 'In Progress', value: 15, color: 'bg-blue-500', percentage: 25 },
      { label: 'Pending', value: 5, color: 'bg-yellow-500', percentage: 8 }
    ],
    showLegend: true,
    showPercentages: true,
    total: 65
  };

  progressData2: ProgressCardData = {
    title: 'Stock Availability',
    subtitle: 'Inventory levels by category',
    items: [
      { label: 'High Stock', value: 120, color: 'bg-green-500', percentage: 60 },
      { label: 'Medium Stock', value: 60, color: 'bg-yellow-500', percentage: 30 },
      { label: 'Low Stock', value: 20, color: 'bg-red-500', percentage: 10 }
    ],
    showLegend: true,
    showPercentages: true,
    total: 200
  };

  listData1: ListCardData = {
    title: 'Recent Sales',
    subtitle: 'Latest transactions',
    items: [
      {
        id: '1',
        label: 'Olivia Martin',
        value: '+$1,999.00',
        subtitle: 'olivia.martin@email.com',
        color: 'text-green-600',
        action: { label: 'View', color: 'text-blue-600' }
      },
      {
        id: '2',
        label: 'Jackson Lee',
        value: '+$39.00',
        subtitle: 'jackson.lee@email.com',
        color: 'text-green-600',
        action: { label: 'View', color: 'text-blue-600' }
      },
      {
        id: '3',
        label: 'Isabella Nguyen',
        value: '+$299.00',
        subtitle: 'isabella.nguyen@email.com',
        color: 'text-green-600',
        action: { label: 'View', color: 'text-blue-600' }
      }
    ],
    showHeader: true,
    showFooter: true,
    footerText: 'View all sales',
    footerLink: '#'
  };

  listData2: ListCardData = {
    title: 'Popular Products',
    subtitle: 'Best selling items',
    items: [
      {
        id: '1',
        label: 'Electronics',
        value: '45 units',
        subtitle: 'Smart devices & gadgets',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: { label: 'Order', color: 'text-blue-600' }
      },
      {
        id: '2',
        label: 'Clothing',
        value: '32 units',
        subtitle: 'Fashion & accessories',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: { label: 'Order', color: 'text-blue-600' }
      },
      {
        id: '3',
        label: 'Home & Garden',
        value: '28 units',
        subtitle: 'Household essentials',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        action: { label: 'Order', color: 'text-blue-600' }
      }
    ],
    showHeader: true,
    showFooter: true,
    footerText: 'View all products',
    footerLink: '#'
  };

  metricData1: MetricCardData = {
    title: 'Total Customers',
    value: '2,350',
    subtitle: '+180.1% from last month',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    iconColor: 'text-blue-500',
    trend: {
      value: 180.1,
      isPositive: true,
      label: 'from last month'
    },
    description: 'Active customers in the system',
    action: {
      label: 'View Details',
      onClick: () => console.log('View customers details')
    }
  };

  metricData2: MetricCardData = {
    title: 'Orders',
    value: '156',
    subtitle: '+12% from last week',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    iconColor: 'text-green-500',
    trend: {
      value: 12,
      isPositive: true,
      label: 'from last week'
    },
    description: 'Pending orders today',
    action: {
      label: 'Process',
      onClick: () => console.log('Process order')
    }
  };

  metricData3: MetricCardData = {
    title: 'Revenue',
    value: '$45,231',
    subtitle: '+20.1% from last month',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    iconColor: 'text-green-500',
    trend: {
      value: 20.1,
      isPositive: true,
      label: 'from last month'
    },
    description: 'Total revenue this month',
    action: {
      label: 'View Report',
      onClick: () => console.log('View revenue report')
    }
  };

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      name: [''],
      email: ['']
    });
  }

  onSubmit(): void {
    if (this.demoForm.valid) {
      this.isSubmitting = true;
      // Simulate API call
      setTimeout(() => {
        console.log('Form submitted:', this.demoForm.value);
        this.isSubmitting = false;
      }, 2000);
    }
  }

  resetForm(): void {
    this.demoForm.reset();
  }

  onItemAction(item: ListItem): void {
    console.log('Item action clicked:', item);
  }

  // Table data
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastLogin', label: 'Last Login', sortable: true }
  ];

  tableRows: TableRow[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-01-15 10:30 AM'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'User',
      status: 'Active',
      lastLogin: '2024-01-14 02:15 PM'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      role: 'Manager',
      status: 'Inactive',
      lastLogin: '2024-01-10 09:45 AM'
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      role: 'User',
      status: 'Active',
      lastLogin: '2024-01-13 11:20 AM'
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie.wilson@example.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-01-12 03:30 PM'
    }
  ];

  tableConfig = {
    variant: 'default' as const,
    size: 'md' as const,
    selectable: true,
    sortable: true,
    searchable: true,
    pagination: true,
    loading: false,
    emptyMessage: 'No data available'
  };

  onTableRowClick(row: TableRow): void {
    console.log('Table row clicked:', row);
  }

  onTableRowSelect(selectedRows: TableRow[]): void {
    console.log('Selected rows:', selectedRows);
  }
} 