import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  label: string;
  value: string;
  count?: number;
  disabled?: boolean;
}

export interface TabConfig {
}

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button 
          *ngFor="let tab of tabs"
          [class]="selectedTabId === tab.value ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors"
          [disabled]="tab.disabled"
          (click)="selectTab(tab)"
        >
          {{ tab.label }}
          <span *ngIf="tab.count !== undefined" class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>
  `,
  styles: []
})
export class TabComponent implements AfterContentInit, OnDestroy {
  @Input() tabs: TabItem[] = [];
  @Input() config: TabConfig = {};
  @Input() selectedTabId: string = '';
  
  @Output() tabChange = new EventEmitter<string>();



  ngAfterContentInit(): void {
    if (!this.selectedTabId && this.tabs.length > 0) {
      const firstEnabledTab = this.tabs.find(tab => !tab.disabled);
      if (firstEnabledTab) {
        this.selectTab(firstEnabledTab);
      }
    }
  }

  ngOnDestroy(): void {
  }

  selectTab(tab: TabItem): void {
    if (tab.disabled) return;
    
    this.selectedTabId = tab.value;
    this.tabChange.emit(tab.value);
  }

  // Public method to programmatically select a tab
  setActiveTab(tabValue: string): void {
    const tab = this.tabs.find(t => t.value === tabValue);
    if (tab && !tab.disabled) {
      this.selectTab(tab);
    }
  }
} 