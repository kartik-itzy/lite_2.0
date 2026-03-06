import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
} from '../../../components/ui/table/table.component';
import {
  BadgeComponent,
  BadgeVariant,
} from '../../../components/ui/badge/badge.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { DataService } from '../../../data.service';
import { HttpHeaderResponse } from '@angular/common/http';

@Component({
  selector: 'app-coupon-plan-by-brand',
  imports: [
    CommonModule,
    ButtonComponent,
    TableComponent,
    TableCellDirective,
    BadgeComponent,
    LoadingComponent,
  ],
  templateUrl: './coupon-plan-by-brand.component.html',
  styleUrl: './coupon-plan-by-brand.component.css',
})
export class CouponPlanByBrandComponent implements OnInit {
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getCouponPlan();
  }

  couponPlanDataSource: any;
  isLoading: boolean = false;
  currentPage = 1;
  totalItems:number = 0;

  tableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 5,
    searchable: true,
    loading: false,
    emptyMessage: 'No Coupon Plan',
  };

  tableColumns: TableColumn[] = [
    { key: 'brand_id', label: 'Brand' },
    { key: 'CouponType', label: 'Coupon Type' },
    { key: 'Code', label: 'Code' },
    { key: 'Description', label: 'Description' },
    { key: 'StartingDate', label: 'Active Date' },
    { key: 'EndingDate', label: 'Expiry Date' },
    { key: 'CurrentStatus', label: 'Current Status' },
    { key: 'Actions', label: 'Actions', align: 'center' },
  ];

  onPageChange(page: number) {
    this.currentPage = page;
  }

  addCouponPlan() {}

  getCouponPlan() {
    this.isLoading = true;
    this.dataService.getMethod('api/v1/coupon/brandcoupon/all').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.couponPlanDataSource = data.data;
        // this.totalItems = data.data.length;
        // console.log(this.totalItems)
        // this.isLoading = false;
        this.isLoading = false;
      },
      error: (error: HttpHeaderResponse) => {
        // this.toastr.warning(error.error.message, 'Please create a new Brand');
        this.couponPlanDataSource = [];
        this.isLoading = false;
      },
    });
  }

  onRowClick(event: any) {
    console.log(event);
  }

  onDeleteCouponPlan(row: any, event: any) {}

  getCouponVariant(type: string): BadgeVariant {
    switch (type) {
      case 'NORMAL':
        return 'secondary';
      case 'DEAL':
        return 'success';
      case 'CAMPAIGN':
        return 'info';
      case 'TOPUP':
        return 'warning';
      case 'SPECIAL':
        return 'danger';
      default:
        return 'light';
    }
  }
}
