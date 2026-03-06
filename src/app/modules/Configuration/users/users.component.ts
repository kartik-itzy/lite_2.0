import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import * as crypto from 'crypto-js';
import { Buffer } from 'buffer';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

export interface User {
  email: string;
  tenant_id: string;
  name: string;
  password: string;
  usertype: string;
  userstatus: string;
  createat: string;
  menupermission?: string;
  LastModifiedOn?: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    ButtonComponent,
    TableComponent,
    TableCellDirective,
    ModalComponent,
    InputComponent,
    SelectComponent,
    BadgeComponent,
    ExportExcelComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private fb = inject(FormBuilder);

  // ─── State ─────────────────────────────────────────────────────────────────
  isLoading = false;
  isModalOpen = false;
  isSaving = false;
  userData: User[] = [];

  // ─── Dropdown ──────────────────────────────────────────────────────────────
  userTypeOptions: SelectOption[] = [
    { value: 'client', label: 'Client' },
    { value: 'provider', label: 'Provider' },
  ];

  // ─── Table ─────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'password', label: 'Password' },
    { key: 'usertype', label: 'User Type', sortable: true },
    { key: 'userstatus', label: 'Status', align: 'center' },
    { key: 'createat', label: 'Created At', sortable: true },
    { key: 'actions', label: 'Actions', align: 'center' },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No users found',
  };

  // ─── Export ────────────────────────────────────────────────────────────────
  exportColumns: ExportColumn[] = [
    { key: 'email', label: 'Email' },
    { key: 'name', label: 'Name' },
    { key: 'usertype', label: 'User Type' },
    { key: 'userstatus', label: 'Status' },
    { key: 'createat', label: 'Created At' },
    { key: 'LastModifiedOn', label: 'Last Modified On' },
    // password intentionally excluded from export
  ];

  // ─── Form ───────────────────────────────────────────────────────────────────
  form!: FormGroup;

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', Validators.required],
      usertype: ['client', Validators.required],
    });

    this.loadUsers();
  }

  // ─── Data ───────────────────────────────────────────────────────────────────

  loadUsers(): void {
    this.isLoading = true;
    this.dataService.getMethod('api/v1/customers/byid').subscribe({
      next: (data: any) => {
        this.userData = data.data || [];
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.notificationService.showError(
          'Load Failed',
          error.error?.message || 'Failed to load users'
        );
      },
    });
  }

  // ─── Modal ──────────────────────────────────────────────────────────────────

  openCreateModal(): void {
    this.form.reset({ email: '', name: '', password: '', usertype: 'client' });
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.form.reset();
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  saveUser(): void {
    if (this.isSaving) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const v = this.form.value;
    const hashedPassword = crypto.SHA1(v.password).toString();

    this.dataService
      .postMethod(
        'api/v1/customers/createuserformcust',
        JSON.stringify({
          email: v.email,
          Name: v.name,
          password: hashedPassword,
          usertype: v.usertype,
        })
      )
      .subscribe(
        (response: any) => {
          this.notificationService.showSuccess(
            'Created',
            response.message || 'User created successfully'
          );
          this.isSaving = false;
          this.closeModal();
          this.loadUsers();
        },
        (error: HttpErrorResponse) => {
          this.isSaving = false;
          this.notificationService.showError(
            'Error',
            error.error?.message || 'Error creating user'
          );
        }
      );
  }

  onDelete(row: any): void {
    this.confirmationService
      .confirmDelete(row.email, row.name || row.email)
      .then((confirmed: boolean) => {
        if (!confirmed) return;

        const emailBase64 = Buffer.from(row.email, 'utf8').toString('base64');

        this.dataService
          .deleteMethod(`api/v1/customers/delete/${row.tenant_id}/${emailBase64}`)
          .subscribe(
            (response: any) => {
              if (response.status === 409) {
                this.notificationService.showError(
                  'Cannot Delete',
                  'User exists in the system and cannot be removed'
                );
              } else {
                this.notificationService.showSuccess(
                  'Deleted',
                  response.message || 'User deleted successfully'
                );
                this.loadUsers();
              }
            },
            (error: HttpErrorResponse) => {
              this.notificationService.showError(
                'Delete Failed',
                error.error?.message || 'Error deleting user'
              );
            }
          );
      });
  }

  onRowClick(row: any): void {
    localStorage.setItem('EmailID', row.email);
    localStorage.setItem('tenant_id', row.tenant_id);
    this.router.navigate(['/crafted/retail/users_details']);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  onPageChange(page: number): void {}
}