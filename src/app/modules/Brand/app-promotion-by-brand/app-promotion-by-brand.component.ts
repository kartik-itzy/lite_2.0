import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { TableCellDirective, TableColumn, TableComponent } from '../../../components/ui/table/table.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { DataService } from '../../../data.service';
import { HttpHeaderResponse } from '@angular/common/http';


@Component({
  selector: 'app-app-promotion-by-brand',
  imports: [CommonModule, ButtonComponent, TableComponent, TableCellDirective, BadgeComponent, LoadingComponent],
  templateUrl: './app-promotion-by-brand.component.html',
  styleUrl: './app-promotion-by-brand.component.css'
})
export class AppPromotionByBrandComponent implements OnInit {

  constructor(private dataService: DataService) { }

  isLoading: boolean = false;
  tableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No App Promotion',
  };

  appPromotionDataSource: any;

  tableColumns: TableColumn[] = [
    { key: 'displaysequence', label: 'Sequence' ,align:'left'},
    { key: 'brand_id', label: 'Brand' },
    { key: 'imagepath', label: 'Image',align:'center' },
    { key: 'displaytext', label: 'Display Text' },
    // { key: 'displaytext', label: 'Display Text' },
    { key: 'startdate', label: 'Start Date',transform:'date' },
    { key: 'enddate', label: 'End Date',transform:'date' },
    { key: 'adurl', label: 'Ad Url' },
    { key: 'actions', label: 'Actions',align:'center' },
  ]


  ngOnInit(): void {

    this.getAppPromotion();
  }

  onRowClick(event: any) {
    console.log(event)
  }

  getAppPromotion() {
    this.dataService.getMethod('api/v1/member/brandapppromo/all').subscribe({
      next: (data: any) => {
        console.log(data);
        this.appPromotionDataSource = data.data;
        // this.isLoading = false;
        this.isLoading = false;
      },
      error: (error: HttpHeaderResponse) => {
        // this.toastr.warning(error.error.message, 'Please create a new Brand');
        this.appPromotionDataSource = [];
        this.isLoading = false;
      },
    });
  }


  addAppPromotion() {

  }

  onEdit(row:any){

  }

  onDeleteAppPromotion(row: any, event: any) {

  }


}
