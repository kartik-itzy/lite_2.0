import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../header/header.component';
import { PageHeaderComponent } from '../../../components/ui/page-header/page-header.component';
import { CardComponent } from '../../../components/ui/card/card.component';
import {
  TabComponent,
  TabItem,
} from '../../../components/ui/tab/tab.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import {
  BreadcrumbItem,
  BreadcrumbComponent,
} from '../../../components/ui/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../data.service';
import { HttpHeaderResponse } from '@angular/common/http';
import { TableComponent, TableConfig,TableColumn } from '../../../components/ui/table/table.component';
import { SelectComponent, SelectOption } from "../../../components/ui/select/select.component";
import { SwitchComponent } from "../../../components/ui/switch/switch.component";
import { InputComponent } from "../../../components/ui/input/input.component";
// import { TableColumn } from '../../../shared/interfaces/common.interface';

@Component({
  selector: 'app-customer-details',
  imports: [CardComponent, TabComponent, ButtonComponent, CommonModule, TableComponent, SelectComponent, SwitchComponent, InputComponent],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css',
})
export class CustomerDetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService:DataService
  ) { }

  tennantId!: string;

  ngOnInit(): void {
    this.tennantId = this.route.snapshot.paramMap.get('id') as string;

    this.getUsersByTennantId();
  }

  usersDataSource: any;

  convertPointsOptions : SelectOption []=[
    {value:'Yes',label:'Yes'},
    {value:'NO',label:'No'},
  ]

  currentView = 'details';

    tableConfig: TableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No Brands ',
    // showInfo: false
  };

  viewTabs: TabItem[] = [
    { label: 'Details', value: 'details' },
    { label: 'App', value: 'app' },
    { label: 'Settings', value: 'settings' },
    { label: 'Brand', value: 'brand' },
    { label: 'Users', value: 'users' },
  ];

  tableColumns:TableColumn[]=[
    {key:'name',label:'Name'},
    {key:'email',label:'Email'},
    {key:'usertype',label:'User Type'},
    {key:'userstatus',label:'Status'},
    {key:'LastModifiedOn',label:'Last Updated',transform:'date'},
  ]

  get breadcrumbItems(): BreadcrumbItem[] {
    return [
      { label: 'Customers', route: 'crafted/retail/customers' },
      { label: this.tennantId || 'Tennant Id' },
    ];
  }

  getUsersByTennantId(){
    this.dataService.getMethod(`api/v1/customers/bytenantid/${this.tennantId}`).subscribe({
      next: (data: any) => {
        console.log(data)
        this.usersDataSource = data.data;
        // this.isLoading = false;
      },
      error: (error: HttpHeaderResponse) => {
        // this.toastr.warning(error.error.message, 'Please create a new Brand');
        this.usersDataSource = [];
        // this.isLoading = false;
      },
    });
  }

  onRowClick(event:any){
    
  }  

  onViewChange(view: string): void {
    this.currentView = view;
  }

  backToListScreen() {
    this.router.navigate(['/crafted/retail/customers']);
  }
}
