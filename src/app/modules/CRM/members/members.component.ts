import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { ExportExcelComponent, ExportColumn } from '../../../components/ui/export-excel/export-excel.component';
import {
  TableCellDirective,
  TableColumn,
  TableComponent,
  TableConfig,
} from '../../../components/ui/table/table.component';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Member {
  MemberShipID: string;
  FirstName: string;
  LastName: string;
  email: string;
  RefPhoneNo: string;
  CurrentStatus: string;
  CardType: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    TableComponent,
    TableCellDirective,
    ExportExcelComponent,
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  members: Member[] = [];
  totalCount = 0;
  currentPage = 1;
  pageCount = 1;
  searchTerm = '';
  isLoading = false;
  isExporting = false;
  isSearchMode = false;

  // ─── Table ────────────────────────────────────────────────────────────────
  tableColumns: TableColumn[] = [
    { key: 'FirstName',     label: 'First Name',     sortable: true },
    { key: 'LastName',      label: 'Last Name',      sortable: true },
    { key: 'email',         label: 'Email',          sortable: true },
    { key: 'RefPhoneNo',    label: 'Phone',          sortable: true },
    { key: 'CurrentStatus', label: 'Status',         sortable: true },
    { key: 'CardType',      label: 'Card Type',      sortable: true },
  ];

  tableConfig: TableConfig = {
    selectable: false,
    pagination: false,   // server-side paging — we render our own controls
    searchable: false,   // search is in the sticky header via onSearch()
    loading: false,
    emptyMessage: 'No members found.',
  };

  exportColumns: ExportColumn[] = [
    { key: 'FirstName',     label: 'First Name'  },
    { key: 'LastName',      label: 'Last Name'   },
    { key: 'email',         label: 'Email'       },
    { key: 'RefPhoneNo',    label: 'Phone'       },
    { key: 'CurrentStatus', label: 'Status'      },
    { key: 'CardType',      label: 'Card Type'   },
  ];

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadMembers();
  }

  // ─── API ───────────────────────────────────────────────────────────────────

  loadMembers(page = 1): void {
    this.isLoading = true;
    this.tableConfig = { ...this.tableConfig, loading: true };

    this.dataService.getMethod(`api/v1/member/pages/${page}`).subscribe({
      next: (res: any) => {
        this.members     = res.data || [];
        this.totalCount  = res.totalcount ?? this.members.length;
        this.pageCount   = res.pagecount  ?? 1;
        this.currentPage = page;
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load members');
      },
    });
  }

  onSearch(term: string): void {
    if (!term.trim()) {
      this.isSearchMode = false;
      this.loadMembers(1);
      return;
    }
    this.isSearchMode = true;
    this.isLoading = true;
    this.tableConfig = { ...this.tableConfig, loading: true };

    this.dataService.getMethod(`api/v1/member/all/search/${term.trim()}`).subscribe({
      next: (res: any) => {
        this.members    = res.data || [];
        this.totalCount = this.members.length;
        this.pageCount  = 1;
        this.currentPage = 1;
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.tableConfig = { ...this.tableConfig, loading: false };
        this.notificationService.showError('Search Failed', err.error?.message || 'Search failed');
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pageCount || page === this.currentPage) return;
    this.loadMembers(page);
  }

  onDelete(member: Member): void {
    this.confirmationService.confirmDelete(
      `${member.FirstName} ${member.LastName}`,
      'member'
    ).then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/member/delete/${member.MemberShipID}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', 'Member deleted successfully');
          this.loadMembers(this.currentPage);
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete member');
        },
      });
    });
  }

  onExportAll(): void {
    this.isExporting = true;
    this.dataService.postMethod('api/v1/member/export', '').subscribe({
      next: () => { this.isExporting = false; },
      error: (err: any) => {
        this.isExporting = false;
        // API returns CSV as error.error.text (legacy pattern)
        if (err?.error?.text) {
          const blob = new Blob([err.error.text], { type: 'text/csv' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'Member Export.csv';
          link.click();
        }
      },
    });
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  onRowClick(member: any): void {
    const isManual = this.router.url.includes('memberslistmanual');
    if (isManual) {
      this.router.navigate(['/crafted/retail/memberslistmanual', member.MemberShipID]);
    } else {
      this.router.navigate(['/crafted/retail/memberslist', member.MemberShipID]);
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'secondary' {
    const map: Record<string, 'success' | 'danger' | 'warning' | 'secondary'> = {
      Active:   'success',
      Inactive: 'danger',
      Pending:  'warning',
    };
    return map[status] ?? 'secondary';
  }

  getPageNumbers(): number[] {
    const delta = 2;
    const start = Math.max(1, this.currentPage - delta);
    const end   = Math.min(this.pageCount, this.currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  onPageChange(_page: number): void {}
}