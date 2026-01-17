import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: any[] | string;
  url?: string;
  queryParams?: Record<string, any>;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav aria-label="Breadcrumb" class="w-full">
      <ol class="flex flex-wrap items-center text-gray-500" [ngClass]="size === 'sm' ? 'text-xs' : 'text-sm'">
        <li class="inline-flex items-center cursor-pointer" (click)="navigateHome()" title="Go to home">
          <span class="hover:text-gray-700">Home</span>
        </li>
        <ng-container *ngFor="let item of items; let i = index">
          <li class="mx-2 text-gray-300">/</li>
          <li 
            class="inline-flex items-center"
            [attr.aria-current]="i === items.length - 1 ? 'page' : null"
            (click)="onCrumbClick(item, i === items.length - 1)"
            [class.cursor-pointer]="i !== items.length - 1 && !item.disabled"
            [title]="i !== items.length - 1 && !item.disabled ? 'Go to ' + item.label : item.label"
          >
            <ng-container *ngIf="i !== items.length - 1; else current">
              <span class="inline-flex items-center gap-1">
                <span *ngIf="item.icon" class="inline-block w-4 h-4">
                  <img [src]="item.icon" class="w-4 h-4" />
                </span>
                <span class="hover:text-gray-700">{{ item.label }}</span>
              </span>
            </ng-container>
            <ng-template #current>
              <span class="text-gray-700 inline-flex items-center gap-1">
                <span *ngIf="item.icon" class="inline-block w-4 h-4">
                  <img [src]="item.icon" class="w-4 h-4" />
                </span>
                <span>{{ item.label }}</span>
              </span>
            </ng-template>
          </li>
        </ng-container>
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() size: 'sm' | 'md' = 'sm';

  constructor(private router: Router) {}

  onCrumbClick(item: BreadcrumbItem, isLast: boolean): void {
    if (isLast || item.disabled) return;
    if (item.route) {
      const commands = Array.isArray(item.route) ? item.route : [item.route];
      this.router.navigate(commands, { queryParams: item.queryParams });
      return;
    }
    if (item.url) {
      window.location.href = item.url;
    }
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }
}