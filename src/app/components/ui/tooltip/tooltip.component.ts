import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'dark';
export type TooltipSize = 'sm' | 'md' | 'lg';

export interface TooltipConfig {
  position?: TooltipPosition;
  variant?: TooltipVariant;
  size?: TooltipSize;
  showArrow?: boolean;
  delay?: number;
  maxWidth?: string;
}

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      #tooltip
      [class]="tooltipClasses"
      [style.max-width]="config.maxWidth"
      [@tooltipAnimation]="isVisible ? 'visible' : 'hidden'"
      class="fixed z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg pointer-events-none transition-all duration-200"
      role="tooltip"
    >
      <!-- Arrow -->
      <div
        *ngIf="config.showArrow"
        [class]="arrowClasses"
        class="absolute w-2 h-2 bg-current transform rotate-45"
      ></div>

      <!-- Content -->
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
  animations: [
    {
      name: 'tooltipAnimation',
      definitions: [
        {
          state: 'hidden',
          style: {
            opacity: 0,
            transform: 'scale(0.95)'
          }
        },
        {
          state: 'visible',
          style: {
            opacity: 1,
            transform: 'scale(1)'
          }
        }
      ],
      transitions: [
        {
          from: 'hidden',
          to: 'visible',
          animation: '200ms ease-out'
        },
        {
          from: 'visible',
          to: 'hidden',
          animation: '150ms ease-in'
        }
      ]
    }
  ]
})
export class TooltipComponent {
  @Input() config: TooltipConfig = {};
  @Input() content = '';
  @Input() trigger: 'hover' | 'click' | 'focus' = 'hover';
  @Input() disabled = false;

  @Output() shown = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

  @ViewChild('tooltip') tooltipElement!: ElementRef<HTMLElement>;

  isVisible = false;
  private timeoutId?: number;

  get tooltipClasses(): string {
    const baseClasses = 'fixed z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg pointer-events-none transition-all duration-200';
    
    const sizeClasses = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-2',
      lg: 'text-base px-4 py-3'
    };

    const variantClasses = {
      primary: 'bg-primary-600 text-white',
      secondary: 'bg-gray-600 text-white',
      success: 'bg-success-600 text-white',
      warning: 'bg-warning-600 text-white',
      danger: 'bg-danger-600 text-white',
      dark: 'bg-gray-900 text-white'
    };

    const positionClasses = this.getPositionClasses();

    return `${baseClasses} ${sizeClasses[this.config.size || 'md']} ${variantClasses[this.config.variant || 'dark']} ${positionClasses}`;
  }

  get arrowClasses(): string {
    const positionClasses = {
      top: 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1',
      left: 'left-full top-1/2 transform -translate-x-1 -translate-y-1/2',
      right: 'right-full top-1/2 transform translate-x-1 -translate-y-1/2'
    };

    return positionClasses[this.config.position || 'top'];
  }

  private getPositionClasses(): string {
    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    return positionClasses[this.config.position || 'top'];
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.trigger === 'hover' && !this.disabled) {
      this.show();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.trigger === 'hover' && !this.disabled) {
      this.hide();
    }
  }

  @HostListener('click')
  onClick(): void {
    if (this.trigger === 'click' && !this.disabled) {
      this.toggle();
    }
  }

  @HostListener('focus')
  onFocus(): void {
    if (this.trigger === 'focus' && !this.disabled) {
      this.show();
    }
  }

  @HostListener('blur')
  onBlur(): void {
    if (this.trigger === 'focus' && !this.disabled) {
      this.hide();
    }
  }

  show(): void {
    if (this.disabled || this.isVisible) return;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const delay = this.config.delay || 0;
    if (delay > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.isVisible = true;
        this.shown.emit();
        this.updatePosition();
      }, delay);
    } else {
      this.isVisible = true;
      this.shown.emit();
      this.updatePosition();
    }
  }

  hide(): void {
    if (!this.isVisible) return;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.isVisible = false;
    this.hidden.emit();
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  private updatePosition(): void {
    if (!this.tooltipElement) return;

    const tooltip = this.tooltipElement.nativeElement;
    const hostElement = this.elementRef.nativeElement;
    const hostRect = hostElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = 0;
    let top = 0;

    switch (this.config.position || 'top') {
      case 'top':
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
        top = hostRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
        top = hostRect.bottom + 8;
        break;
      case 'left':
        left = hostRect.left - tooltipRect.width - 8;
        top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
        break;
      case 'right':
        left = hostRect.right + 8;
        top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
        break;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 8;
    if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - 8;
    if (top < 0) top = 8;
    if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  constructor(private elementRef: ElementRef) {}
} 