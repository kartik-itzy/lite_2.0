import { Component, inject, OnInit } from '@angular/core';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { HttpHeaderResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
// import { TableCellDirective } from '../table/table.component';

@Component({
  selector: 'app-brand',
  imports: [
    TableComponent,
    ButtonComponent,
    ModalComponent,
    InputComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableCellDirective,LoadingComponent
  ],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.css',
})
export class BrandComponent implements OnInit {
  brandDataSource: any;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isModalOpen: boolean = false;

  private fb = inject(FormBuilder);
  brandDetailsForm!: FormGroup;

  constructor(
    private dataServices: DataService,
    private router: Router,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.getAllBrands();
    this.brandDetailsForm = this.fb.group({
      brand_id: '',
      name: '',
    });
  }

  openAddBrandModal() {
    this.isModalOpen = true;
    // this.newCompanyName = '';
  }

  addBrand() {
    // if (this.BrandDataDetails.code != null) {
    // this.BrandCreationPopup = false;
    this.dataServices
      .postMethod('api/v1/member/createBrand', this.brandDetailsForm.value)
      .subscribe(
        (data: any) => {
          console.log(data, 'success');
          if (data.status == 201) {
            this.router.navigate([
              '/crafted/retail/Brand-details',
              this.brandDetailsForm.value.brand_id,
            ]);
            this.notificationService.showSuccess('Brand added', data.message);
          }
        },
        (error: any) => {}
      );
  }

  onDeleteBrand(row: any, event: MouseEvent): void {
    event.stopPropagation(); //
    console.log('Delete clicked for brand:', row);
    this.confirmationService
      .confirmDelete(row.name, row.name)
      .then((confirmed) => {
        if (confirmed) {
          console.log('Delete confirmed!');
        } else {
          console.log('Delete cancelled.');
        }
      });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  tableColumns: TableColumn[] = [
    { key: 'imagepath', label: 'Brand Logo', align:'left' },
    { key: 'name', label: 'Brand' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'pointsratio', label: 'Points Ratio' },
    { key: 'actions', label: 'Actions' },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: false,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No Brands ',
    // showInfo: false
  };

  getAllBrands(): void {
    this.isLoading = true;
    this.dataServices.getMethod('api/v1/member/getAllBrands').subscribe({
      next: (data: any) => {
        this.brandDataSource = data?.data || [];
        // this.isLoading = false;
      },
      error: (error: HttpHeaderResponse) => {
        // this.toastr.warning(error.error.message, 'Please create a new Brand');
        this.brandDataSource = [];
      },
    });
    this.isLoading = false;
  }

  onRowClick(event: any) {
    console.log(event);
    this.router.navigate(['/crafted/retail/Brand-details', event.brand_id]);
  }
}
