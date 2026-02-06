import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
} from '../../../components/ui/table/table.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { DataService } from '../../../data.service';
import { HttpHeaderResponse } from '@angular/common/http';

@Component({
  selector: 'app-loyalty-plan-by-brand',
  imports: [
    CommonModule,
    ButtonComponent,
    TableComponent,
    TableCellDirective,
    LoadingComponent,
  ],
  templateUrl: './loyalty-plan-by-brand.component.html',
  styleUrl: './loyalty-plan-by-brand.component.css',
})
export class LoyaltyPlanByBrandComponent implements OnInit {
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getLoyaltyPlan();
  }

  loyaltyPlanDataSource: any;
  isLoading: boolean = false;

  tableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No App Promotion',
  };

  tableColumns: TableColumn[] = [
    { key: 'brand_id', label: 'Brand' },
    { key: 'Code', label: 'Code' },
    { key: 'Description', label: 'Description' },
    { key: 'ActiveDate', label: 'Active Date', transform: 'date' },
    { key: 'ExpiryDate', label: 'Expiry Date', transform: 'date' },
    { key: 'Actions', label: 'Actions', align: 'center' },
  ];

  onRowClick(event: any) {
    console.log(event);
  }

  addLoyaltyPlan() {}

  getLoyaltyPlan() {
    this.isLoading = true;
    this.dataService.getMethod('api/v1/member/BrandLoyalty/all').subscribe({
      next: (data: any) => {
        console.log(data);
        this.loyaltyPlanDataSource = data.data;
        // this.isLoading = false;
        this.isLoading = false;
      },
      error: (error: HttpHeaderResponse) => {
        // this.toastr.warning(error.error.message, 'Please create a new Brand');
        this.loyaltyPlanDataSource = [];
        this.isLoading = false;
      },
    });
  }

  onEdit(row: any) {}

  onDeleteLoyaltyPlan(row: any, event: any) {}
}
