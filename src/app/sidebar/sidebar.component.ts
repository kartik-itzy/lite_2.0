import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('slideDown', [
      state('void', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('*', style({
        height: '*',
        opacity: '1'
      })),
      transition('void <=> *', [
        animate('200ms ease-in-out')
      ])
    ])
  ],
  template: `
    <div class="sidebar w-64 h-screen flex flex-col">
      <!-- Logo and Store Info -->
      <div class="p-6 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">PALM</h1>
            <p class="text-sm text-gray-500">Main Store</p>
          </div>
        </div>
        <div class="text-xs text-gray-500">
          <p>845 Euclid Avenue, CA</p>
        </div>
      </div>

      <!-- Navigation - Scrollable -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <!-- MAIN Section -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">MAIN</h3>
          <div class="space-y-1">
            <a routerLink="/dashboard" routerLinkActive="active" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Dashboard
            </a>
          </div>
        </div>

        <!-- DEMO Section -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">DEMO</h3>
          <div class="space-y-1">
            <!-- Demo Components -->
            <div class="relative">
              <button 
                (click)="toggleDemoMenu()" 
                class="flex items-center justify-between w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg sidebar-item"
                [class.active]="isDemoMenuOpen"
              >
                <div class="flex items-center">
                  <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                  </svg>
                  Components
                </div>
                <svg 
                  class="w-4 h-4 transition-transform duration-200" 
                  [class.rotate-180]="isDemoMenuOpen"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <!-- Sub-menu -->
              <div 
                *ngIf="isDemoMenuOpen" 
                class="ml-4 mt-1 space-y-1"
                [@slideDown]="isDemoMenuOpen"
              >
                <a 
                  routerLink="/demo/components" 
                  routerLinkActive="active"
                  class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg sidebar-item"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  UI Components
                </a>
                <a 
                  routerLink="/demo/modal" 
                  routerLinkActive="active"
                  class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg sidebar-item"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                  </svg>
                  Modal Demo
                </a>
                <a 
                  routerLink="/demo/forms" 
                  routerLinkActive="active"
                  class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg sidebar-item"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Form Examples
                </a>
                <a 
                  routerLink="/demo/tabs" 
                  routerLinkActive="active"
                  class="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg sidebar-item"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  Tab Component
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- RETAIL Section -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">RETAIL</h3>
          <div class="space-y-1">
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Orders
            </a>
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              Customers
            </a>
            <a routerLink="/products" routerLinkActive="active" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Products
            </a>
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Staff List
            </a>
          </div>
        </div>

        <!-- FINANCE Section -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">FINANCE</h3>
          <div class="space-y-1">
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              Accounts
            </a>
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Sales
            </a>
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              Purchases
            </a>
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              Payment Method
            </a>
          </div>
        </div>

        <!-- PHYSICAL ASSET Section -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">PHYSICAL ASSET</h3>
          <div class="space-y-1">
            <a routerLink="/stock" routerLinkActive="active" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              Stocks
            </a>
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
              </svg>
              Peripherals
            </a>
          </div>
        </div>

        <!-- REPORT Section -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">REPORT</h3>
          <div class="space-y-1">
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Analytics
            </a>
          </div>
        </div>

        <!-- CUSTOMER SUPPORT Section -->
        <div class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">CUSTOMER SUPPORT</h3>
          <div class="space-y-1">
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Help Center
            </a>
            <a href="#" class="sidebar-item">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Settings
            </a>
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 flex-shrink-0">
        <div class="text-xs text-gray-500">
          <p>RHBUS v1.0</p>
          <p>Built with ❤️ for retail</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      background: white;
      border-right: 1px solid #e5e7eb;
    }
    
    .sidebar-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: #6b7280;
      text-decoration: none;
      border-radius: 0.5rem;
      transition: all 0.2s;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .sidebar-item:hover {
      background-color: #f3f4f6;
      color: #374151;
    }
    
    .sidebar-item.active {
      background-color: #eff6ff;
      color: #2563eb;
    }
    
    .sidebar-item svg {
      flex-shrink: 0;
    }

    /* Custom scrollbar styling */
    .sidebar nav::-webkit-scrollbar {
      width: 0px;
      display: none;
    }
    
    .sidebar nav::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .sidebar nav::-webkit-scrollbar-thumb {
      background: transparent;
    }
    
    .sidebar nav::-webkit-scrollbar-thumb:hover {
      background: transparent;
    }
    
    /* Firefox scrollbar styling */
    .sidebar nav {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
  `]
})
export class SidebarComponent {
  isDemoMenuOpen = false;

  toggleDemoMenu(): void {
    this.isDemoMenuOpen = !this.isDemoMenuOpen;
  }
} 