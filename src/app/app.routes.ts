import { Routes } from '@angular/router';
import { DemoComponent } from './components/demo/demo.component';
import { ComponentsDemoComponent } from './components/demo/components-demo.component';
import { ModalDemoComponent } from './components/demo/modal-demo.component';
import { FormsDemoComponent } from './components/demo/forms-demo.component';
import { TabDemoComponent } from './components/demo/tab-demo.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StockComponent } from './stock/stock.component';
import { ProductsComponent } from './products/products.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'demo', 
    component: DemoComponent,
    // canActivate: [AuthGuard]
  },
  { 
    path: 'demo/components', 
    component: ComponentsDemoComponent,
    // canActivate: [AuthGuard]
  },
  { 
    path: 'demo/modal', 
    component: ModalDemoComponent,
    // canActivate: [AuthGuard]
  },
  { 
    path: 'demo/forms', 
    component: FormsDemoComponent,
    // canActivate: [AuthGuard]
  },
  { 
    path: 'demo/tabs', 
    component: TabDemoComponent,
    // canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    // canActivate: [AuthGuard]
  },
  { 
    path: 'stock', 
    component: StockComponent,
    // canActivate: [AuthGuard]
  },
  { 
    path: 'products', 
    component: ProductsComponent,
    // canActivate: [AuthGuard]
  },
  { 
    path: 'sales-order-detail', 
    loadComponent: () => import('./sales-order-detail/sales-order-detail.component').then(m => m.SalesOrderDetailComponent),
    // canActivate: [AuthGuard]
  }
];
