import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../input/input.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent],
  template: `
    <div class="flex-1 max-w-md">
      <app-input
        [placeholder]="placeholder"
        [(ngModel)]="searchValue"
        (input)="onSearch()"
        icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        iconPosition="left"
      ></app-input>
    </div>
  `,
  styles: []
})
export class SearchComponent {
  @Input() placeholder: string = 'Search';
  @Input() searchValue: string = '';
  @Output() searchValueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  onSearch(): void {
    this.searchValueChange.emit(this.searchValue);
    this.search.emit(this.searchValue);
  }
} 