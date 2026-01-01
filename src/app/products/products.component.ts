import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent, Product } from '../components/ui/product-card/product-card.component';
import { ButtonComponent } from '../components/ui/button/button.component';
import { FilterComponent, FilterOption } from '../components/ui/filter/filter.component';
import { SearchComponent } from '../components/ui/search/search.component';
import { ViewToggleComponent, ViewMode } from '../components/ui/view-toggle/view-toggle.component';
import { CardComponent } from '../components/ui/card/card.component';
import { PaginationComponent, PaginationConfig } from '../components/ui/pagination/pagination.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    ButtonComponent,
    FilterComponent,
    SearchComponent,
    ViewToggleComponent,
    CardComponent,
    PaginationComponent
  ],
  template: `
    <div class="p-6">
      <app-card variant="default" size="lg" class="h-full">
        <div class="space-y-6">
          <!-- Page Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <h1 class="text-2xl font-bold text-gray-900">Products</h1>
              <div class="flex items-center space-x-2">
                <button class="p-1 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </button>
                <button class="p-1 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </button>
              </div>
            </div>
            <app-button 
              variant="primary" 
              size="md"
              icon="M12 6v6m0 0v6m0-6h6m-6 0H6"
              iconPosition="left"
            >
              Add Product
            </app-button>
          </div>

          <!-- Filter Tabs -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <app-filter 
                [filters]="filters"
                [selectedFilter]="selectedFilter"
                (filterChange)="setFilter($event)"
              ></app-filter>
              <app-button variant="secondary" size="sm">
                + View
              </app-button>
            </div>
          </div>

          <!-- Search and Filters -->
          <div class="flex items-center space-x-4">
            <app-search
              placeholder="Search"
              [(searchValue)]="searchTerm"
              (search)="onSearch()"
            ></app-search>
            
            <div class="flex items-center space-x-2">
              <select class="form-select text-sm border-gray-300 rounded-md px-3 py-2">
                <option>Category</option>
                <option>Electronics</option>
                <option>Accessories</option>
                <option>Cameras</option>
                <option>Laptops</option>
                <option>Speakers</option>
              </select>
              
              <select class="form-select text-sm border-gray-300 rounded-md px-3 py-2">
                <option>Type</option>
                <option>Physical</option>
                <option>Digital</option>
                <option>Dropship</option>
                <option>Inventory</option>
              </select>
              
              <app-button 
                variant="secondary" 
                size="sm"
                icon="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                iconPosition="left"
              >
                Advanced Filter
              </app-button>
            </div>
          </div>

          <!-- View Settings and Toggle -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">View Settings</span>
              <button class="p-1 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
                </svg>
              </button>
            </div>
            <app-view-toggle 
              [viewMode]="viewMode"
              (viewModeChange)="setViewMode($event)"
            ></app-view-toggle>
          </div>

          <!-- Products Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <app-product-card
              *ngFor="let product of paginatedProducts"
              [product]="product"
              (cardClick)="onProductClick($event)"
              (reorder)="onReorder($event)"
              (viewDetails)="onViewDetails($event)"
            ></app-product-card>
          </div>

          <!-- Pagination -->
          <app-pagination
            [config]="paginationConfig"
            (pageChange)="onPageChange($event)"
            (itemsPerPageChange)="onItemsPerPageChange($event)"
          ></app-pagination>



          <!-- Empty State -->
          <div *ngIf="paginatedProducts.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
            <div class="mt-6">
              <app-button 
                variant="primary" 
                size="md"
                icon="M12 6v6m0 0v6m0-6h6m-6 0H6"
                iconPosition="left"
              >
                Add Product
              </app-button>
            </div>
          </div>
        </div>
      </app-card>
    </div>
  `,
  styles: []
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedFilter = 'all';
  viewMode: ViewMode = 'grid';

  filters: FilterOption[] = [
    { label: 'All', value: 'all', count: 0 },
    { label: 'Active', value: 'active', count: 0 },
    { label: 'Draft', value: 'draft', count: 0 },
    { label: 'Archived', value: 'archived', count: 0 }
  ];

  paginationConfig: PaginationConfig = {
    totalItems: 0,
    itemsPerPage: 10,
    currentPage: 1,
    totalPages: 0,
    showPageNumbers: true,
    showItemsPerPage: true
  };

  paginatedProducts: Product[] = [];

  ngOnInit(): void {
    this.loadProducts();
    this.updateFilterCounts();
    this.updatePaginationConfig();
  }

  loadProducts(): void {
    this.products = [
      {
        id: '1',
        name: 'Macbook Pro 14 Inch 512GB...',
        sku: 'Mac-5006',
        image: 'https://picsum.photos/64/64?random=1',
        status: 'active',
        tags: ['Apple', 'Electronic'],
        retailPrice: '$180.00-$220.00',
        wholesalePrice: '$100.00-$170.00',
        stock: 210,
        stockStatus: 'high',
        variants: 6,
        isDropship: true
      },
      {
        id: '2',
        name: 'Logitech MX Mechanical Mini...',
        sku: 'Logitect-9920',
        image: 'https://picsum.photos/64/64?random=2',
        status: 'active',
        tags: ['Mechanical', 'Keyboard'],
        retailPrice: '$120.00',
        wholesalePrice: '$80.00',
        stock: 12,
        stockStatus: 'low',
        isInventory: true
      },
      {
        id: '3',
        name: 'JBL Go 2 Portable Speaker Bl...',
        sku: 'JBL-9928',
        image: 'https://picsum.photos/64/64?random=3',
        status: 'draft',
        tags: ['Speaker', 'Electronic'],
        retailPrice: '$180.00',
        wholesalePrice: '$100.00',
        stock: 341,
        stockStatus: 'high',
        isDropship: true
      },
      {
        id: '4',
        name: 'Gopro hero 7',
        sku: 'Gopro-9912',
        image: 'https://picsum.photos/64/64?random=4',
        status: 'active',
        tags: ['Camera', 'Gopro'],
        retailPrice: '$45.00',
        wholesalePrice: '$40.00',
        stock: 0,
        stockStatus: 'out-of-stock',
        isDropship: true
      },
      {
        id: '5',
        name: 'DJI Air 3 Fly More Combo (DJ...',
        sku: 'DJI-5006',
        image: 'https://picsum.photos/64/64?random=5',
        status: 'active',
        tags: ['DJI', 'Electronic'],
        retailPrice: '$85.00-$120.00',
        wholesalePrice: '$80.00-$110.00',
        stock: 32,
        stockStatus: 'low',
        variants: 8,
        isDropship: true
      },
      {
        id: '6',
        name: 'Logitech C920 Webcam PRO...',
        sku: 'Logitech-5006',
        image: 'https://picsum.photos/64/64?random=6',
        status: 'active',
        tags: ['Camera', 'Accessories'],
        retailPrice: '$60.00-$70.00',
        wholesalePrice: '$50.00-$60.00',
        stock: 0,
        stockStatus: 'out-of-stock',
        isDropship: true
      },
      {
        id: '7',
        name: 'Thinkplus LP1 Headset Earph...',
        sku: 'LP1-8821',
        image: 'https://picsum.photos/64/64?random=7',
        status: 'active',
        tags: ['Headset', 'Electronic'],
        retailPrice: '$120.00-$240.00',
        wholesalePrice: '$100.00-$170.00',
        stock: 150,
        stockStatus: 'high',
        isDropship: true
      },
      {
        id: '8',
        name: 'JBL Charge 5 - Portable Blue...',
        sku: 'JBL-1019',
        image: 'https://picsum.photos/64/64?random=8',
        status: 'active',
        tags: ['JBL', 'Electronic'],
        retailPrice: '$180.00',
        wholesalePrice: '$100.00',
        stock: 89,
        stockStatus: 'high',
        isDropship: true
      },
      {
        id: '9',
        name: 'Acer Aspire 5 Spin 14" A5SP1...',
        sku: 'Acer-9829',
        image: 'https://picsum.photos/64/64?random=9',
        status: 'active',
        tags: ['Laptop', 'Electronic'],
        retailPrice: '$180.00',
        wholesalePrice: '$100.00',
        stock: 45,
        stockStatus: 'high',
        isDropship: true
      },
      {
        id: '10',
        name: 'Samsung Galaxy S23 Ultra...',
        sku: 'Samsung-5007',
        image: 'https://picsum.photos/64/64?random=10',
        status: 'active',
        tags: ['Samsung', 'Phone'],
        retailPrice: '$1200.00',
        wholesalePrice: '$1000.00',
        stock: 25,
        stockStatus: 'low',
        isDropship: true
      },
      {
        id: '11',
        name: 'Sony WH-1000XM5 Headphones...',
        sku: 'Sony-5008',
        image: 'https://picsum.photos/64/64?random=11',
        status: 'active',
        tags: ['Sony', 'Headphones'],
        retailPrice: '$350.00',
        wholesalePrice: '$280.00',
        stock: 67,
        stockStatus: 'high',
        isDropship: true
      },
      {
        id: '12',
        name: 'Canon EOS R6 Mark II...',
        sku: 'Canon-5009',
        image: 'https://picsum.photos/64/64?random=12',
        status: 'active',
        tags: ['Canon', 'Camera'],
        retailPrice: '$2500.00',
        wholesalePrice: '$2000.00',
        stock: 8,
        stockStatus: 'low',
        isDropship: true
      },
      {
        id: '13',
        name: 'Apple iPad Pro 12.9"...',
        sku: 'Apple-5010',
        image: 'https://picsum.photos/64/64?random=13',
        status: 'active',
        tags: ['Apple', 'Tablet'],
        retailPrice: '$1100.00',
        wholesalePrice: '$900.00',
        stock: 34,
        stockStatus: 'high',
        isDropship: true
      },
      {
        id: '14',
        name: 'Microsoft Surface Laptop 5...',
        sku: 'Microsoft-5011',
        image: 'https://picsum.photos/64/64?random=14',
        status: 'active',
        tags: ['Microsoft', 'Laptop'],
        retailPrice: '$1300.00',
        wholesalePrice: '$1100.00',
        stock: 19,
        stockStatus: 'low',
        isDropship: true
      },
      {
        id: '15',
        name: 'Bose QuietComfort 45...',
        sku: 'Bose-5012',
        image: 'https://picsum.photos/64/64?random=15',
        status: 'active',
        tags: ['Bose', 'Headphones'],
        retailPrice: '$329.00',
        wholesalePrice: '$260.00',
        stock: 42,
        stockStatus: 'high',
        isDropship: true
      }
    ];

    this.filteredProducts = [...this.products];
    this.updatePaginationConfig();
    this.applyPagination();
  }

  updateFilterCounts(): void {
    this.filters[0].count = this.products.length;
    this.filters[1].count = this.products.filter(p => p.status === 'active').length;
    this.filters[2].count = this.products.filter(p => p.status === 'draft').length;
    this.filters[3].count = this.products.filter(p => p.status === 'archived').length;
  }

  updatePaginationConfig(): void {
    this.paginationConfig.totalItems = this.filteredProducts.length;
    this.paginationConfig.totalPages = Math.ceil(this.paginationConfig.totalItems / this.paginationConfig.itemsPerPage);
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.products];

    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(product => product.status === this.selectedFilter);
    }

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    this.filteredProducts = filtered;
    this.updatePaginationConfig();
    this.applyPagination();
  }

  onProductClick(product: Product): void {
  }

  onReorder(product: Product): void {
  }

  onViewDetails(product: Product): void {
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.applyPagination();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.paginationConfig.itemsPerPage = itemsPerPage;
    this.paginationConfig.currentPage = 1;
    this.updatePaginationConfig();
    this.applyPagination();
  }

  applyPagination(): void {
    const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const end = start + this.paginationConfig.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
  }
} 