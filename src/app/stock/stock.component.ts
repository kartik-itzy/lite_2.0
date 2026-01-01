import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OrderItem {
  id: string;
  orderNumber: string;
  items: number;
  price: string;
  created: string;
  vendor: string;
  status: 'pending' | 'complete' | 'partial';
  received: string;
  total: number;
  emailSent: boolean;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 p-6 space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Asset Value</p>
              <p class="text-3xl font-bold text-gray-900">$10,200,323</p>
            </div>
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Products</p>
              <p class="text-3xl font-bold text-gray-900">32</p>
              <p class="text-sm text-gray-500">product</p>
            </div>
            <div class="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-3">Stock Status</p>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">In stock: 20</span>
                <span class="text-primary-600 font-medium">62.5%</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Low stock: 4</span>
                <span class="text-warning-600 font-medium">12.5%</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Out of stock: 8</span>
                <span class="text-danger-600 font-medium">25%</span>
              </div>
            </div>
            <!-- Progress Bar -->
            <div class="mt-3">
              <div class="progress-bar">
                <div class="progress-fill progress-in-stock" style="width: 62.5%"></div>
                <div class="progress-fill progress-low-stock" style="width: 12.5%"></div>
                <div class="progress-fill progress-out-stock" style="width: 25%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <a href="#" class="text-gray-500 hover:text-gray-700 py-2 px-1 border-b-2 border-transparent font-medium text-sm">
            Inventory
          </a>
          <a href="#" class="text-primary-600 border-b-2 border-primary-600 py-2 px-1 font-medium text-sm">
            Order Stock
          </a>
        </nav>
      </div>

      <!-- Table Controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              class="input-field pl-10 w-64"
            />
          </div>
          <button class="btn btn-secondary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            Filters
          </button>
        </div>
        <button class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Order Stock
        </button>
      </div>

      <!-- Data Table -->
      <div class="table-container">
        <table class="w-full">
          <thead class="table-header">
            <tr>
              <th class="table-cell">
                <input type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
              </th>
              <th class="table-cell font-medium text-gray-900">
                <div class="flex items-center space-x-1">
                  <span>ORDER</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </div>
              </th>
              <th class="table-cell font-medium text-gray-900">
                <div class="flex items-center space-x-1">
                  <span>CREATED</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </div>
              </th>
              <th class="table-cell font-medium text-gray-900">
                <div class="flex items-center space-x-1">
                  <span>FROM VENDOR</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                </div>
              </th>
              <th class="table-cell font-medium text-gray-900">STATUS</th>
              <th class="table-cell font-medium text-gray-900">ITEM RECEIVED</th>
              <th class="table-cell font-medium text-gray-900">SEND EMAIL</th>
              <th class="table-cell font-medium text-gray-900">Receive</th>
              <th class="table-cell font-medium text-gray-900"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of orderItems" class="table-row">
              <td class="table-cell">
                <input type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
              </td>
              <td class="table-cell">
                <div>
                  <p class="font-medium text-gray-900">{{ item.orderNumber }}</p>
                  <p class="text-sm text-gray-500">{{ item.items }} items</p>
                  <p class="text-sm font-medium text-gray-900">{{ item.price }}</p>
                </div>
              </td>
              <td class="table-cell text-gray-900">{{ item.created }}</td>
              <td class="table-cell text-gray-900">{{ item.vendor }}</td>
              <td class="table-cell">
                <span [class]="getStatusClass(item.status)" class="status-badge">
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td class="table-cell">
                <div class="flex items-center space-x-2">
                                     <div class="progress-bar w-16">
                     <div class="progress-fill progress-in-stock" [style.width.%]="getProgressPercentage(item.received)"></div>
                   </div>
                  <span class="text-sm text-gray-600">{{ item.received }}</span>
                </div>
              </td>
              <td class="table-cell">
                <div *ngIf="item.emailSent" class="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </td>
              <td class="table-cell">
                <button class="btn btn-secondary btn-sm">Receive</button>
              </td>
              <td class="table-cell">
                <button class="p-1 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: []
})
export class StockComponent {
  orderItems: OrderItem[] = [
    {
      id: '1',
      orderNumber: '#OS12KOS',
      items: 2,
      price: '$2.000',
      created: 'July 14, 2015',
      vendor: 'Barone LLC.',
      status: 'pending',
      received: '0/3',
      total: 3,
      emailSent: false
    },
    {
      id: '2',
      orderNumber: '#OS13KOS',
      items: 3,
      price: '$1.500',
      created: 'July 15, 2015',
      vendor: 'Acme Corp.',
      status: 'complete',
      received: '3/3',
      total: 3,
      emailSent: true
    },
    {
      id: '3',
      orderNumber: '#OS14KOS',
      items: 4,
      price: '$3.200',
      created: 'July 16, 2015',
      vendor: 'Tech Solutions',
      status: 'partial',
      received: '2/4',
      total: 4,
      emailSent: true
    }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-badge status-pending';
      case 'complete':
        return 'status-badge status-complete';
      case 'partial':
        return 'status-badge status-partial';
      default:
        return 'status-badge status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'complete':
        return 'COMPLETE';
      case 'partial':
        return 'PARTIALLY RECEIVED';
      default:
        return 'PENDING';
    }
  }

  getProgressPercentage(received: string): number {
    const [receivedCount, totalCount] = received.split('/').map(Number);
    return (receivedCount / totalCount) * 100;
  }
} 