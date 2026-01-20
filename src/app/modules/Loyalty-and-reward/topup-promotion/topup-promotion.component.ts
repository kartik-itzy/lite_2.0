import { Component, OnInit } from '@angular/core';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { TableColumn, TableComponent } from '../../../components/ui/table/table.component';

@Component({
  selector: 'app-topup-promotion',
  imports: [ButtonComponent, TableComponent],
  templateUrl: './topup-promotion.component.html',
  styleUrl: './topup-promotion.component.css'
})
export class TopupPromotionComponent implements OnInit {


  ngOnInit(): void {

  }

  tableColumns: TableColumn[] = []

  topupDataSource = [];
  
  tableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No topup Promtion',
  }

  addTopupPromotion() {

  }

  onRowClick(event: any) {
    console.log(event)
  }

}
