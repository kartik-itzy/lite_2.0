import { Component, OnInit } from '@angular/core';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { DataService } from '../../../data.service';
import { HttpHeaderResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// import { NgIf } from "../../../../../node_modules/@angular/common/common_module.d-NEF7UaHr";

@Component({
  selector: 'app-customers',
  imports: [TableComponent, LoadingComponent, CommonModule, TableCellDirective],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent implements OnInit {
  constructor(
    private dataServices: DataService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getCustomers();
  }

  customersDataSource: any;

  isLoading = false;

  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Customer Name' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'apphomebannerpath', label: 'Image' },
    { key: 'action', label: 'Action', align: 'center' },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No Customers ',
    // showInfo: false
  };

  getCustomers() {
    this.isLoading = true;
    this.dataServices.getMethod('api/v1/customers').subscribe({
      next: (data: any) => {
        this.customersDataSource = data.data.customer || [];
        this.isLoading = false;
      },
      error: (error: HttpHeaderResponse) => {
        // this.toastr.warning(error.error.message, 'Please create a new Brand');
        this.customersDataSource = [];
        this.isLoading = false;
      },
    });
  }

  onRowClick(event: any) {
    console.log(event);
    this.router.navigate(['/crafted/retail/customers', event.tenant_id]);
  }

  onDeleteCustomer(row: any, event: any) {}

}
