import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent, BadgeVariant } from '../badge/badge.component';
import { ButtonComponent } from '../button/button.component';
import { CardComponent } from '../card/card.component';

export interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  status: 'active' | 'draft' | 'archived' | 'out-of-stock';
  tags: string[];
  retailPrice: string;
  wholesalePrice: string;
  stock: number;
  stockStatus: 'high' | 'low' | 'out-of-stock';
  variants?: number;
  isDropship?: boolean;
  isInventory?: boolean;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent, ButtonComponent, CardComponent],
  template: `
    <app-card variant="default" size="md" [clickable]="true" class="h-full flex flex-col">
      <!-- Product Image, SKU, and Description on same line -->
      <div class="flex items-start space-x-3 mb-3">
        <!-- Product Image -->
        <div class="flex-shrink-0">
          <div class="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
            <img 
              [src]="product.image" 
              [alt]="product.name"
              class="w-full h-full object-cover"
              (error)="onImageError($event)"
            />
            <div *ngIf="imageError" class="absolute inset-0 flex items-center justify-center bg-gray-50">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Product Info (SKU and Description) -->
        <div class="flex-1 min-w-0">
          <!-- Product Name/Description -->
          <h3 class="font-medium text-gray-900 text-sm line-clamp-2 leading-tight mb-1">
            {{ product.name }}
          </h3>
          
          <!-- SKU and Status Badge on same line -->
          <div class="flex items-center space-x-2">
            <p class="text-xs text-gray-500">
              {{ product.sku }}
            </p>
            <app-badge 
              [variant]="getStatusVariant(product.status)"
              size="sm"
              style="soft"
            >
              {{ getStatusText(product.status) }}
            </app-badge>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1 mb-3">
        <app-badge 
          *ngFor="let tag of product.tags.slice(0, 2)"
          variant="secondary"
          size="sm"
          style="soft"
        >
          {{ tag }}
        </app-badge>
        <app-badge 
          *ngIf="product.tags.length > 2"
          variant="secondary"
          size="sm"
          style="soft"
        >
          +{{ product.tags.length - 2 }}
        </app-badge>
        <app-badge 
          *ngIf="product.isDropship"
          variant="info"
          size="sm"
          style="soft"
        >
          Dropship
        </app-badge>
        <app-badge 
          *ngIf="product.isInventory"
          variant="info"
          size="sm"
          style="soft"
        >
          Inventory
        </app-badge>
      </div>

      <!-- Pricing -->
      <div class="text-xs space-y-1 mb-3">
        <div class="text-gray-500">Retail: {{ product.retailPrice }}</div>
        <div class="text-gray-500">Wholesale: {{ product.wholesalePrice }}</div>
      </div>

      <!-- Stock Information -->
      <div class="flex justify-between items-center mb-3">
        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <span 
              [class]="getStockStatusClass(product.stockStatus)"
              class="text-xs font-medium"
            >
              {{ getStockText(product.stock, product.stockStatus) }}
            </span>
            <div *ngIf="product.stockStatus !== 'out-of-stock'" class="flex-1">
              <div class="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  [class]="getStockBarColor(product.stockStatus)"
                  class="h-1.5 rounded-full"
                  [style.width.%]="getStockPercentage(product.stock, product.stockStatus)"
                ></div>
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center mt-1">
            <span *ngIf="product.variants" class="text-xs text-gray-500">
              Variants ({{ product.variants }})
            </span>
            <button 
              class="text-gray-400 hover:text-gray-600 p-1"
              (click)="onViewDetails($event)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Spacer to push reorder button to bottom -->
      <div class="flex-1"></div>

      <!-- Reorder Button for Out of Stock - Always at bottom -->
      <div *ngIf="product.stockStatus === 'out-of-stock'" class="mt-3">
        <app-button 
          variant="secondary" 
          size="sm" 
          class="w-full bg-gray-800 text-white hover:bg-gray-700"
          (click)="onReorder($event)"
        >
          Reorder
        </app-button>
      </div>
    </app-card>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() cardClick = new EventEmitter<Product>();
  @Output() reorder = new EventEmitter<Product>();
  @Output() viewDetails = new EventEmitter<Product>();

  imageError = false;

  getStatusVariant(status: string): BadgeVariant {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'secondary';
      case 'out-of-stock':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'draft':
        return 'Draft';
      case 'archived':
        return 'Archived';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return status;
    }
  }

  getStockStatusClass(status: string): string {
    switch (status) {
      case 'high':
        return 'text-green-600';
      case 'low':
        return 'text-yellow-600';
      case 'out-of-stock':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  getStockBarColor(status: string): string {
    switch (status) {
      case 'high':
        return 'bg-green-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }

  getStockPercentage(stock: number, status: string): number {
    if (status === 'out-of-stock') return 0;
    if (status === 'high') return 80;
    if (status === 'low') return 30;
    return 50;
  }

  getStockText(stock: number, status: string): string {
    if (status === 'out-of-stock') {
      return 'Out of Stock';
    }
    const stockLevel = status === 'high' ? ' - High' : status === 'low' ? ' - Low' : '';
    return `${stock} stock${stockLevel}`;
  }

  onCardClick(): void {
    this.cardClick.emit(this.product);
  }

  onReorder(event: Event): void {
    event.stopPropagation();
    this.reorder.emit(this.product);
  }

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.viewDetails.emit(this.product);
  }

  onImageError(event: Event): void {
    this.imageError = true;
  }
} 