import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabComponent, TabItem, TabConfig } from '../ui/tab/tab.component';
import { CardComponent } from '../ui/card/card.component';

@Component({
  selector: 'app-tab-demo',
  standalone: true,
  imports: [CommonModule, TabComponent, CardComponent],
  template: `
    <div class="p-6 space-y-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Tab Component Demo</h1>

      <!-- Basic Tabs (Same as Products Page Filter) -->
      <app-card variant="default" size="lg">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Basic Tabs</h2>
          <span class="text-sm text-gray-500">Same style as products page filter</span>
        </div>
        
        <app-tab
          [tabs]="defaultTabs"
          [selectedTabId]="selectedDefaultTab"
          (tabChange)="onDefaultTabChange($event)"
        ></app-tab>
      </app-card>

      <!-- Products Page Style Tabs -->
      <app-card variant="default" size="lg">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Products Page Style</h2>
          <span class="text-sm text-gray-500">Exact same as products page filter</span>
        </div>
        
        <app-tab
          [tabs]="pillTabs"
          [selectedTabId]="selectedPillTab"
          (tabChange)="onPillTabChange($event)"
        ></app-tab>
      </app-card>

      <!-- Usage Example -->
      <app-card variant="default" size="lg">
        <div card-header class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Usage Example</h2>
          <span class="text-sm text-gray-500">How to use the tab component</span>
        </div>
        
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Selected Tab: {{ selectedDefaultTab }}</h3>
          <p class="text-gray-600 mb-4">This tab component works exactly like the filter tabs in the products page.</p>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Code Example:</h4>
            <pre class="text-sm text-gray-700 bg-gray-100 p-3 rounded">
&lt;app-tab
  [tabs]="tabs"
  [selectedTabId]="selectedTab"
  (tabChange)="onTabChange($event)"
&gt;&lt;/app-tab&gt;
            </pre>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class TabDemoComponent {
  // Default Tabs
  selectedDefaultTab = 'overview';
  defaultTabs: TabItem[] = [
    {
      value: 'overview',
      label: 'Overview',
      count: 15
    },
    {
      value: 'analytics',
      label: 'Analytics',
      count: 8
    },
    {
      value: 'reports',
      label: 'Reports',
      count: 12
    },
    {
      value: 'settings',
      label: 'Settings',
      count: 3
    }
  ];

  // Pills Tabs
  selectedPillTab = 'all';
  pillTabs: TabItem[] = [
    { value: 'all', label: 'All', count: 15 },
    { value: 'active', label: 'Active', count: 12 },
    { value: 'draft', label: 'Draft', count: 3 },
    { value: 'archived', label: 'Archived', count: 0 }
  ];
  pillConfig: TabConfig = {
    variant: 'pills',
    size: 'md',
    showBadges: true
  };



  // Event Handlers
  onDefaultTabChange(tabId: string): void {
    this.selectedDefaultTab = tabId;
    console.log('Default tab changed to:', tabId);
  }

  onPillTabChange(tabId: string): void {
    this.selectedPillTab = tabId;
    console.log('Pill tab changed to:', tabId);
  }


} 