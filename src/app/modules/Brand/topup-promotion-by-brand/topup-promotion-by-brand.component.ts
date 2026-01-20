import { Component, OnInit } from '@angular/core';
// import { TableColumn } from '../../../shared/interfaces/common.interface';
import { TableCellDirective, TableComponent ,TableColumn} from '../../../components/ui/table/table.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { DataService } from '../../../data.service';
import { HttpHeaderResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
// import { NgIf } from "../../../../../node_modules/@angular/common/common_module.d-NEF7UaHr";

@Component({
  selector: 'app-topup-promotion-by-brand',
  imports: [TableComponent, ButtonComponent, TableCellDirective, LoadingComponent, CommonModule,BadgeComponent],
  templateUrl: './topup-promotion-by-brand.component.html',
  styleUrl: './topup-promotion-by-brand.component.css',
})
export class TopupPromotionByBrandComponent implements OnInit {

  constructor(private dataService: DataService,private router:Router) { }

  isLoading: boolean = false;
  topupDataSource = [];

  ngOnInit(): void {
    this.isLoading = true;
   this.getAllBrandTopup();
  }


  getAllBrandTopup(){
     this.dataService.getMethod('api/v1/redeem/BrandTopup/getall').subscribe({
      next: (data: any) => {
        console.log(data);
        this.topupDataSource = data.data;
        // this.isLoading = false;
        this.isLoading = false;
      },
      error: (error: HttpHeaderResponse) => {
        // this.toastr.warning(error.error.message, 'Please create a new Brand');
        this.topupDataSource = [];
        this.isLoading = false;
      },
    });
  }

  tableColumns: TableColumn[] = [
    { key: 'Code', label: 'Code' },
    { key: 'brand_id', label: 'Brand' },
    { key: 'Description', label: 'Description' },
    { key: 'ActiveDate', label: 'Active Date' },
    // { key: 'DisplayText', label: 'Display Text' },
    { key: 'ExpirayDate', label: 'Expiry Date',transform:'date' },
    { key: 'PlanStatus', label: 'Plan Status',transform:'date' },
    { key: 'fortier', label: 'For tier' },
    { key: 'action', label: 'Action' },
  ];

  tableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No topup Promotion',
  };

  addTopupPromotion() { }

  onRowClick(event: any) {
    console.log(event);
    // console.log(event);
    this.router.navigate(['crafted/retail/TopupPromotionByBrand',event.Code ,event.brand_id]);
  }

  onDeletePromtion(row:any,event:any){}
}
