import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { TableCellDirective, TableColumn, TableComponent } from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { Router } from '@angular/router';
import { HttpHeaderResponse } from '@angular/common/http';

@Component({
  selector: 'app-redeem-plan-by-brand',
  imports: [CommonModule, LoadingComponent, ButtonComponent, TableComponent, TableCellDirective],
  templateUrl: './redeem-plan-by-brand.component.html',
  styleUrl: './redeem-plan-by-brand.component.css'
})
export class RedeemPlanByBrandComponent implements OnInit {
  isLoading: boolean = false;


  constructor(private dataService: DataService, private router: Router) { }

  redeemPlanDataSource: any;

  tableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No Redeem Plan',
  }

  tableColumns: TableColumn[] = [
    { key: 'brand_id', label: 'Brand' },
    { key: 'Code', label: 'Code' },
    { key: 'Description', label: 'Description' },
    { key: 'ActiveDate', label: 'Active Date' },
    { key: 'ExpirayDate', label: 'Expiry Date' },
    { key: 'Actions', label: 'Actions' },
  ]

  ngOnInit(): void {
    this.getRedeemPlanDataSource();

  }

  getRedeemPlanDataSource() {
    this.dataService.getMethod('api/v1/redeem/BrandRedeemPlan/getall').subscribe({
      next: (data: any) => {
        console.log(data);
        this.redeemPlanDataSource = data.data;
        // this.isLoading = false;
        this.isLoading = false;
      },
      error: (error: HttpHeaderResponse) => {
        // this.toastr.warning(error.error.message, 'Please create a new Brand');
        this.redeemPlanDataSource = [];
        this.isLoading = false;
      },
    });
  }

  addRedeemPlan() {

  }

  onDeletePlan(row:any,event:any){}

}
