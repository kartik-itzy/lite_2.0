import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-view-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-1">
      <button 
        [class]="viewMode === 'grid' ? 'bg-gray-100 text-gray-700' : 'text-gray-400'"
        class="p-2 rounded-md hover:bg-gray-100 transition-colors"
        (click)="setViewMode('grid')"
        title="Grid View"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
      </button>
      <button 
        [class]="viewMode === 'list' ? 'bg-gray-100 text-gray-700' : 'text-gray-400'"
        class="p-2 rounded-md hover:bg-gray-100 transition-colors"
        (click)="setViewMode('list')"
        title="List View"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
        </svg>
      </button>
    </div>
  `,
  styles: []
})
export class ViewToggleComponent {
  @Input() viewMode: ViewMode = 'grid';
  @Output() viewModeChange = new EventEmitter<ViewMode>();

  setViewMode(mode: ViewMode): void {
    this.viewModeChange.emit(mode);
  }
} 