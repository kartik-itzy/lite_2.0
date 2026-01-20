import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../components/ui/page-header/page-header.component';
import { TabComponent } from '../../../components/ui/tab/tab.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { CardComponent } from '../../../components/ui/card/card.component';
import { BreadcrumbItem } from '../../../components/ui/breadcrumb/breadcrumb.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';

// import Breadcrumb from 'echarts/types/src/chart/treemap/Breadcrumb.js';

@Component({
  selector: 'app-topup-promotion-by-brand-details',
  imports: [
    PageHeaderComponent,
    CardComponent,
    TableComponent,
    LoadingComponent,
    CommonModule,
    TableCellDirective,
    BadgeComponent,
  ],
  templateUrl: './topup-promotion-by-brand-details.component.html',
  styleUrl: './topup-promotion-by-brand-details.component.css',
})
export class TopupPromotionByBrandDetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
  ) {}
  brandId!: string;
  code!: string;

  isLoading: boolean = false;

  topupPromotionDataSource: any;

  tableColumns: TableColumn[] = [
    { key: 'Minimun_Amount', label: 'Minimum Amt' },
    { key: 'Maximun_Amount', label: 'Maximum Amt' },
    { key: 'CouponCode', label: 'Coupon Code' },
    { key: 'CouponExpiryDay', label: 'Coupon Expiry Date' },
    { key: 'Activate', label: 'Activate' },
    { key: 'ActiveDate', label: 'Active Date' },
    { key: 'ExpiryDate', label: 'Expiry Date' },
    { key: 'OtherInfo', label: 'Other Info', align: 'center' },
    { key: 'Actions', label: 'Actions', align: 'center' },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No Topup Promotions ',
    // showInfo: false
  };

  get breadcrumbItems(): BreadcrumbItem[] {
    return [
      {
        label: 'Topup Promotion by Brand',
        route: 'crafted/retail/TopupPromotionByBrand',
      },
      { label: this.code || 'Code' },
      // { label: this.brandId  || 'Brand Id' },
    ];
  }

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code') as string;
    this.brandId = this.route.snapshot.paramMap.get('brandId') as string;

    console.log('Code:', this.code);
    console.log('Brand ID:', this.brandId);

    this.getAllTopupPromotions();
  }

  getAllTopupPromotions() {
    this.isLoading = true;

    this.dataService
      .getMethod(`api/v1/redeem/BrandTopupLine/${this.code}/${this.brandId}`)
      .subscribe({
        next: (getData: any) => {
          console.log(getData);
          this.topupPromotionDataSource = getData.data;
          this.isLoading = false;
        },
      });
  }

  onDeleteBrand(row: any, event: any) {
    console.log(row);
  }
}
