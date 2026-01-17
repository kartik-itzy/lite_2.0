import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';


@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BreadcrumbComponent],
  template: `
    <div class="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">{{ title }}</h1>
          <ng-container *ngIf="(breadcrumbs?.length ?? 0) > 0; else subtitleTpl">
            <div class="mt-1">
              <app-breadcrumb [items]="breadcrumbs ?? []" size="sm"></app-breadcrumb>
            </div>
          </ng-container>
          <ng-template #subtitleTpl>
            <p class="text-sm text-gray-500 mt-1" *ngIf="subtitle">{{ subtitle }}</p>
          </ng-template>
        </div>
        
        <div *ngIf="showNextStep || showSummaryButton || showRefreshButton || showSaveButton" class="flex items-center space-x-3">
          <app-button 
            *ngIf="showRefreshButton"
            variant="secondary" 
            size="sm"
            (clicked)="onRefreshClick()"
            [loading]="isRefreshing"
            [icon]="refreshButtonIcon">
            {{ isRefreshing ? 'Refreshing...' : refreshButtonText }}
          </app-button>
          <app-button 
            *ngIf="showSummaryButton"
            variant="secondary" 
            size="sm"
            (clicked)="onSummaryClick()"
            [icon]="summaryButtonIcon">
            {{ summaryButtonText }}
          </app-button>
          <app-button 
            *ngIf="showNextStep"
            variant="primary" 
            size="sm"
            (clicked)="onNextStepClick()"
            [icon]="nextStepIcon">
            {{ nextStepText }}
          </app-button>
          <app-button
            *ngIf="showSaveButton"
            variant="primary"
            size="sm"
            (clicked)="onSaveClick()"
            [loading]="isSaving"
            [icon]="saveButtonIcon"
          >
            {{ isSaving ? 'Saving...' : saveButtonText }}
          </app-button>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
  @Input() showNextStep: boolean = false;
  @Input() nextStepText: string = 'Next Step';
  @Input() nextStepIcon: string = 'M13 7l5 5m0 0l-5 5m5-5H6';
  @Input() showSummaryButton: boolean = false;
  @Input() summaryButtonText: string = 'View Summary';
  @Input() summaryButtonIcon: string = 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
  @Input() showRefreshButton: boolean = false;
  @Input() refreshButtonText: string = 'Refresh';
  @Input() refreshButtonIcon: string = 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';
  @Input() isRefreshing: boolean = false;
  @Input() showSaveButton: boolean = false;
  @Input() saveButtonText: string = 'Save';
  @Input() saveButtonIcon: string = 'M5 13l4 4L19 7';
  @Input() isSaving: boolean = false;
  @Output() nextStepClick = new EventEmitter<void>();
  @Output() summaryClick = new EventEmitter<void>();
  @Output() refreshClick = new EventEmitter<void>();
  @Output() saveClick = new EventEmitter<void>();

  onNextStepClick(): void {
    this.nextStepClick.emit();
  }

  onSummaryClick(): void {
    this.summaryClick.emit();
  }

  onRefreshClick(): void {
    this.refreshClick.emit();
  }

  onSaveClick(): void {
    this.saveClick.emit();
  }
}
