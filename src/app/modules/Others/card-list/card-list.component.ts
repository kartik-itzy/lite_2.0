import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

export interface CardLogo {
  LineNo: number;
  CardType: string;
  description: string;
  imagepath: string | null;
  imagename: string | null;
  PrimaryCard: string;
  Includeinaggregarepoint: string;
}

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardComponent, ButtonComponent, BadgeComponent,
    TableComponent, TableCellDirective,
    InputComponent, ModalComponent,
  ],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css',
})
export class CardListComponent implements OnInit {

  cards: CardLogo[] = [];

  showAddModal = false;
  newCardType = '';
  newDescription = '';
  isCreating = false;

  tableColumns: TableColumn[] = [
    { key: 'CardType',    label: 'Card Type',   sortable: true  },
    { key: 'imagepath',   label: 'Card Image',       sortable: false },
    { key: 'description', label: 'Description', sortable: true  },
    { key: 'PrimaryCard', label: 'Primary',     sortable: true  },
    { key: 'actions',     label: 'Actions',     sortable: false },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: true,
    pageSize: 10,
    searchable: true,
    loading: false,
    emptyMessage: 'No card types found.',
  };

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.tableConfig = { ...this.tableConfig, loading: true };
    this.dataService.getMethod('api/v1/member/cardlogo').subscribe({
      next: (res: any) => {
        this.cards = res.data || res || [];
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load cards');
      },
    });
  }

  onDelete(card: CardLogo): void {
    this.confirmationService.confirmDelete(card.CardType, 'card type').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/member/cardlogo/${card.LineNo}`).subscribe({
        next: (res: any) => {
          if (res?.status === 409) {
            this.notificationService.showError('Cannot Delete', "Card's exist in the system");
          } else {
            this.notificationService.showSuccess('Deleted', `Card "${card.CardType}" deleted`);
            this.loadCards();
          }
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.status === 409 ? "Card's exist in the system" : err.error?.message || 'Failed to delete';
          this.notificationService.showError('Delete Failed', msg);
        },
      });
    });
  }

  openAddModal(): void {
    this.newCardType = '';
    this.newDescription = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newCardType = '';
    this.newDescription = '';
  }

  createCard(): void {
    if (!this.newCardType.trim()) {
      this.notificationService.showError('Validation', 'Card type is required');
      return;
    }
    this.isCreating = true;
    this.dataService.postMethod('api/v1/member/cardlogo/create', JSON.stringify({
      CardType:    this.newCardType.trim(),
      description: this.newDescription.trim(),
    })).subscribe({
      next: () => {
        this.isCreating = false;
        this.notificationService.showSuccess('Created', `Card "${this.newCardType}" created`);
        this.closeAddModal();
        this.loadCards();
      },
      error: (err: HttpErrorResponse) => {
        this.isCreating = false;
        this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create card');
      },
    });
  }

  onRowClick(card: any): void {
    this.router.navigate(['/crafted/retail/Card', card.CardType]);
  }

  getPrimaryVariant(val: string): 'success' | 'secondary' {
    return val === 'Yes' ? 'success' : 'secondary';
  }

  onPageChange(_page: number): void {}
}