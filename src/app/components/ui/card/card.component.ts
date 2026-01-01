import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardConfig {
  variant?: CardVariant;
  size?: CardSize;
  padding?: boolean;
  shadow?: boolean;
  border?: boolean;
  fullWidth?: boolean;
  clickable?: boolean;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="cardClasses"
      (click)="onCardClick($event)"
      [class.cursor-pointer]="clickable"
    >
      <!-- Header -->
      <div
        *ngIf="header"
        [class]="headerClasses"
      >
        <ng-content select="[card-header]"></ng-content>
      </div>

      <!-- Body -->
      <div [class]="bodyClasses">
        <ng-content select="[card-body]"></ng-content>
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <div
        *ngIf="footer"
        [class]="footerClasses"
      >
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class CardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() size: CardSize = 'md';
  @Input() padding = true;
  @Input() shadow = true;
  @Input() border = false;
  @Input() fullWidth = false;
  @Input() clickable = false;
  @Input() header = false;
  @Input() footer = false;

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-xl transition-all duration-200';
    
    const variantClasses = {
      default: 'border border-gray-200',
      elevated: 'shadow-soft',
      outlined: 'border-2 border-gray-200',
      flat: 'bg-gray-50'
    };

    const shadowClass = this.shadow && this.variant !== 'elevated' ? 'shadow-sm' : '';
    const borderClass = this.border ? 'border border-gray-200' : '';
    const widthClass = this.fullWidth ? 'w-full' : '';
    const clickableClass = this.clickable ? 'hover:shadow-medium hover:scale-[1.02]' : '';

    return `${baseClasses} ${variantClasses[this.variant]} ${shadowClass} ${borderClass} ${widthClass} ${clickableClass}`;
  }

  get headerClasses(): string {
    const baseClasses = 'border-b border-gray-200';
    const paddingClasses = this.getPaddingClasses();
    return `${baseClasses} ${paddingClasses}`;
  }

  get bodyClasses(): string {
    return this.padding ? this.getPaddingClasses() : '';
  }

  get footerClasses(): string {
    const baseClasses = 'border-t border-gray-200';
    const paddingClasses = this.getPaddingClasses();
    return `${baseClasses} ${paddingClasses}`;
  }

  private getPaddingClasses(): string {
    const paddingClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };
    return paddingClasses[this.size];
  }

  onCardClick(event: Event): void {
    if (this.clickable) {
      // Emit click event or handle navigation
    }
  }
} 