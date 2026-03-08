import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { CardComponent } from '../../../components/ui/card/card.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { BadgeComponent } from '../../../components/ui/badge/badge.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
import { SwitchComponent } from '../../../components/ui/switch/switch.component';
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

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CardHeader {
  LineNo: number;
  CardType: string;
  description: string;
  imagepath: string | null;
  PrimaryCard: string;
  Includeinaggregarepoint: string;
}

export interface MemberCard {
  CardNumber: string;
  Pincode: string;
  CardType: string;
  CardMode: string;
  CardStatus: string;
  ExpiryDate: string | null;
  MemberName: string | null;
  SequenceNo: number | null;
}

export interface MemberCardFormData {
  CardNumber: string;
  Pincode: string;
  CardMode: string;
  ExpiryDate: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-card-details',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardComponent, ButtonComponent, BadgeComponent,
    TableComponent, TableCellDirective,
    InputComponent, SelectComponent, ModalComponent, SwitchComponent,
  ],
  providers: [DatePipe],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.css',
})
export class CardDetailsComponent implements OnInit {

  // ─── Route param ──────────────────────────────────────────────────────────
  cardType = '';

  // ─── Header ───────────────────────────────────────────────────────────────
  header: CardHeader | null = null;
  isHeaderLoading = false;
  editDescription = '';

  // Card mode options
  cardModeOptions: SelectOption[] = [
    { value: 'DIGITAL',  label: 'Digital'  },
    { value: 'PHYSICAL', label: 'Physical' },
  ];

  // ─── Member cards — server-side pagination ────────────────────────────────
  memberCards: MemberCard[] = [];
  currentPage = 1;
  totalCount = 0;
  pageCount = 0;
  isCardsLoading = false;
  cardSearchTerm = '';
  isSearchMode = false;

  memberCardColumns: TableColumn[] = [
    { key: 'CardNumber',  label: 'Card Number',  sortable: true  },
    { key: 'Pincode',     label: 'PIN',          sortable: false },
    { key: 'CardMode',    label: 'Card Mode',    sortable: true  },
    { key: 'CardStatus',  label: 'Status',       sortable: true  },
    { key: 'ExpiryDate',  label: 'Expiry Date',  sortable: true  },
    { key: 'MemberName',  label: 'Member',       sortable: false },
    { key: 'SequenceNo',  label: 'Seq No',       sortable: false },
    { key: 'actions',     label: 'Actions',      sortable: false },
  ];

  memberCardsConfig: TableConfig = {
    selectable: false,
    pagination: false,   // manual server-side
    searchable: false,
    loading: false,
    emptyMessage: 'No member cards found.',
  };

  // ─── Add card modal ───────────────────────────────────────────────────────
  showAddCardModal = false;
  isAddingCard = false;
  cardForm: MemberCardFormData = this.emptyCardForm();

  // ─── Edit card modal ──────────────────────────────────────────────────────
  showEditCardModal = false;
  isSavingCard = false;
  editingCard: MemberCard | null = null;
  editCardMode = '';
  editExpiryDate = '';

  // ─── Image modal ──────────────────────────────────────────────────────────
  showImageModal = false;
  isUploadingImage = false;
  isDeletingImage = false;

  // ─── Import modal ─────────────────────────────────────────────────────────
  showImportModal = false;
  selectedCardMode = '';
  importFile: File | null = null;
  isImporting = false;
  importStep: 'mode' | 'file' = 'mode';

  // ─── CSV export ───────────────────────────────────────────────────────────
  isExporting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
  ) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.cardType = this.route.snapshot.paramMap.get('cardType') as string;
    if (!this.cardType) {
      this.notificationService.showError('Invalid Route', 'No card type provided');
      this.router.navigate(['/crafted/retail/card']);
      return;
    }
    this.loadHeader();
    this.loadMemberCards(1);
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  loadHeader(): void {
    this.isHeaderLoading = true;
    this.dataService.getMethod('api/v1/member/cardlogo').subscribe({
      next: (res: any) => {
        const found = (res.data || []).find((c: any) => c.CardType === this.cardType);
        this.header = found ?? null;
        this.editDescription = found?.description || '';
        this.isHeaderLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isHeaderLoading = false;
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load card header');
      },
    });
  }

  saveField(column: string, value: any): void {
    if (!this.header) return;
    this.dataService.putMethod(`api/v1/member/cardlogo/${this.header.LineNo}`, JSON.stringify({ column, value })).subscribe({
      next: () => {
        this.notificationService.showSuccess('Updated', `${column} updated`);
        this.loadHeader();
      },
      error: (err: HttpErrorResponse) => {
        this.notificationService.showError('Update Failed', err.error?.message || 'Failed to update');
      },
    });
  }

  onPrimaryCardToggle(newVal: boolean): void {
    const value = newVal ? 'Yes' : 'No';
    if (value !== 'Yes') return; // only allow setting to primary, not unsetting
    this.confirmationService.confirmAction(
      'Set as Primary',
      `Set <strong>${this.cardType}</strong> as the primary card?`,
      'primary'
    ).then(confirmed => {
      if (!confirmed) {
        // revert UI toggle
        if (this.header) this.header.PrimaryCard = 'No';
        return;
      }
      this.saveField('PrimaryCard', 'Yes');
    });
  }

  onAggregateChange(value: string): void {
    if (value === this.header?.Includeinaggregarepoint) return;
    this.saveField('Includeinaggregarepoint', value);
  }

  // ─── Delete card type ─────────────────────────────────────────────────────

  deleteCardType(): void {
    if (!this.header) return;
    this.confirmationService.confirmDelete(this.cardType, 'card type').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/member/cardlogo/${this.header!.LineNo}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', `Card type "${this.cardType}" deleted`);
          this.router.navigate(['/crafted/retail/card']);
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete');
        },
      });
    });
  }

  // ─── Member cards — server-side pagination ────────────────────────────────

  loadMemberCards(page: number): void {
    this.isCardsLoading = true;
    this.memberCardsConfig = { ...this.memberCardsConfig, loading: true };
    this.currentPage = page;
    this.dataService.getMethod(`api/v1/member/cardmembers/${this.cardType}/${page}`).subscribe({
      next: (res: any) => {
        this.memberCards = res.data || [];
        this.totalCount = res.totalcount || 0;
        this.pageCount = res.pagecount || 0;
        this.isCardsLoading = false;
        this.memberCardsConfig = { ...this.memberCardsConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.isCardsLoading = false;
        this.memberCardsConfig = { ...this.memberCardsConfig, loading: false };
        this.notificationService.showError('Load Failed', err.error?.message || 'Failed to load cards');
      },
    });
  }

  searchCards(): void {
    const term = this.cardSearchTerm.trim();
    if (!term) { this.clearSearch(); return; }
    this.isSearchMode = true;
    this.memberCardsConfig = { ...this.memberCardsConfig, loading: true };
    this.dataService.getMethod(`api/v1/member/cardmembers/search/${this.cardType}/${term}`).subscribe({
      next: (res: any) => {
        this.memberCards = res.data || [];
        this.totalCount = this.memberCards.length;
        this.pageCount = 1;
        this.currentPage = 1;
        this.memberCardsConfig = { ...this.memberCardsConfig, loading: false };
      },
      error: (err: HttpErrorResponse) => {
        this.memberCardsConfig = { ...this.memberCardsConfig, loading: false };
        this.notificationService.showError('Search Failed', err.error?.message || 'Search failed');
      },
    });
  }

  clearSearch(): void {
    this.cardSearchTerm = '';
    this.isSearchMode = false;
    this.loadMemberCards(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pageCount) return;
    this.loadMemberCards(page);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const delta = 2;
    for (let i = Math.max(1, this.currentPage - delta); i <= Math.min(this.pageCount, this.currentPage + delta); i++) {
      pages.push(i);
    }
    return pages;
  }

  formatTotal(n: number): string {
    if (n >= 1e6) return (n / 1e6).toFixed(2) + ' M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + ' K';
    return String(n);
  }

  // ─── Add member card ──────────────────────────────────────────────────────

  openAddCardModal(): void {
    this.cardForm = this.emptyCardForm();
    this.cardForm.CardMode = 'DIGITAL';
    this.showAddCardModal = true;
  }

  closeAddCardModal(): void {
    this.showAddCardModal = false;
    this.cardForm = this.emptyCardForm();
  }

  createMemberCard(): void {
    if (!this.cardForm.CardNumber.trim()) {
      this.notificationService.showError('Validation', 'Card number is required');
      return;
    }
    this.isAddingCard = true;
    this.dataService.postMethod('api/v1/member/cardmembers/create', JSON.stringify({
      CardNumber: this.cardForm.CardNumber,
      Pincode:    this.cardForm.Pincode,
      CardMode:   this.cardForm.CardMode,
      CardType:   this.cardType,
      ExpiryDate: this.cardForm.ExpiryDate || null,
    })).subscribe({
      next: () => {
        this.isAddingCard = false;
        this.notificationService.showSuccess('Created', 'Card created');
        this.closeAddCardModal();
        this.loadMemberCards(1);
      },
      error: (err: HttpErrorResponse) => {
        this.isAddingCard = false;
        this.notificationService.showError('Create Failed', err.error?.message || 'Failed to create card');
      },
    });
  }

  // ─── Edit member card ─────────────────────────────────────────────────────

  openEditCard(card: MemberCard): void {
    this.editingCard = card;
    this.editCardMode = card.CardMode;
    this.editExpiryDate = card.ExpiryDate || '';
    this.showEditCardModal = true;
  }

  closeEditCard(): void {
    this.showEditCardModal = false;
    this.editingCard = null;
  }

  saveEditCard(): void {
    if (!this.editingCard) return;
    const updates: { column: string; value: any }[] = [];
    if (this.editingCard.CardMode !== this.editCardMode) updates.push({ column: 'CardMode', value: this.editCardMode });
    if ((this.editingCard.ExpiryDate || '') !== this.editExpiryDate) updates.push({ column: 'ExpiryDate', value: this.editExpiryDate });
    if (!updates.length) { this.closeEditCard(); return; }

    this.isSavingCard = true;
    const send = (idx: number) => {
      if (idx >= updates.length) {
        this.isSavingCard = false;
        this.notificationService.showSuccess('Updated', 'Card updated');
        this.closeEditCard();
        this.loadMemberCards(this.currentPage);
        return;
      }
      const { column, value } = updates[idx];
      this.dataService.putMethod(`api/v1/member/cardmembers/${this.editingCard!.CardNumber}`, JSON.stringify({ column, value })).subscribe({
        next: () => send(idx + 1),
        error: (err: HttpErrorResponse) => {
          this.isSavingCard = false;
          this.notificationService.showError('Update Failed', err.error?.message || 'Failed to update');
        },
      });
    };
    send(0);
  }

  // ─── Delete member card ───────────────────────────────────────────────────

  deleteMemberCard(card: MemberCard): void {
    if (card.CardStatus === 'ACTIVE') {
      this.notificationService.showError('Cannot Delete', 'Cannot delete an ACTIVE card');
      return;
    }
    this.confirmationService.confirmDelete(card.CardNumber, 'member card').then(confirmed => {
      if (!confirmed) return;
      this.dataService.deleteMethod(`api/v1/member/cardmembers/${card.CardNumber}`).subscribe({
        next: () => {
          this.notificationService.showSuccess('Deleted', 'Card deleted');
          this.loadMemberCards(this.currentPage);
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete');
        },
      });
    });
  }

  // ─── CSV export ───────────────────────────────────────────────────────────

  exportCSV(): void {
    this.isExporting = true;
    this.dataService.postMethod(`api/v1/member/cardmembers/linetoexport/${this.cardType}`, '').subscribe({
      next: () => { this.isExporting = false; },
      error: (err: HttpErrorResponse) => {
        this.isExporting = false;
        if (err.error?.text) {
          const blob = new Blob([err.error.text], { type: 'text/csv' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = `Cards_${this.cardType}.csv`;
          link.click();
        } else {
          this.notificationService.showError('Export Failed', err.error?.message || 'Failed to export');
        }
      },
    });
  }

  // ─── Image ────────────────────────────────────────────────────────────────

  openImageModal(): void {
    if (this.header?.imagepath) {
      this.notificationService.showError('Image Exists', 'Please delete the existing image first');
      return;
    }
    this.showImageModal = true;
  }

  closeImageModal(): void { this.showImageModal = false; }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.header) return;
    const file = input.files[0];
    const ext = file.type.split('/').pop()?.toLowerCase();
    if (!['jpeg', 'jpg', 'png'].includes(ext || '')) {
      this.notificationService.showError('Invalid File', 'Please select JPEG or PNG');
      return;
    }
    this.isUploadingImage = true;
    this.dataService.getBase64(file).then((base64: any) => {
      const data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
      this.dataService.postMethod(`api/v1/member/cardlogo/uploadimage/${this.header!.LineNo}`, JSON.stringify({
        column: 'CardLogo', filename: file.name, image: data,
      })).subscribe({
        next: () => {
          this.isUploadingImage = false;
          this.notificationService.showSuccess('Uploaded', 'Image uploaded');
          this.closeImageModal();
          this.loadHeader();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingImage = false;
          this.notificationService.showError('Upload Failed', err.error?.message || 'Failed to upload');
        },
      });
    });
  }

  deleteImage(): void {
    if (!this.header?.imagepath) return;
    this.confirmationService.confirmAction('Delete Image', 'Delete the card image?', 'danger').then(confirmed => {
      if (!confirmed) return;
      const match = this.header!.imagepath!.match(/\/([^/]+)$/);
      if (!match) return;
      const base64Name = btoa(match[1]);
      this.isDeletingImage = true;
      this.dataService.deleteImageMethod(`api/v1/member/cardlogo/image/${this.cardType}/${base64Name}`, '{}').subscribe({
        next: () => {
          this.isDeletingImage = false;
          this.notificationService.showSuccess('Deleted', 'Image deleted');
          this.loadHeader();
        },
        error: (err: HttpErrorResponse) => {
          this.isDeletingImage = false;
          this.notificationService.showError('Delete Failed', err.error?.message || 'Failed to delete image');
        },
      });
    });
  }

  // ─── Import ───────────────────────────────────────────────────────────────

  openImportModal(): void {
    this.selectedCardMode = '';
    this.importFile = null;
    this.importStep = 'mode';
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.importFile = null;
    this.selectedCardMode = '';
    this.importStep = 'mode';
  }

  confirmCardMode(): void {
    if (!this.selectedCardMode) {
      this.notificationService.showError('Validation', 'Please select a card mode');
      return;
    }
    this.confirmationService.confirmAction('Confirm Card Mode', `Selected card mode: <strong>${this.selectedCardMode}</strong>`, 'primary').then(confirmed => {
      if (!confirmed) return;
      this.importStep = 'file';
    });
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile = input.files?.[0] || null;
  }

  importCards(): void {
    if (!this.importFile || !this.selectedCardMode) return;
    this.isImporting = true;

    // Read XLSX via FileReader
    const reader = new FileReader();
    // reader.onload = (e: any) => {
    //   import('xlsx').then(XLSX => {
    //     const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
    //     const ws = wb.Sheets[wb.SheetNames[0]];
    //     const data = XLSX.utils.sheet_to_json(ws, { raw: true });

    //     if (!data.length) {
    //       this.isImporting = false;
    //       this.notificationService.showError('Empty File', 'Import file has no rows');
    //       return;
    //     }

    //     this.dataService.postMethod(
    //       `api/v1/member/cardlogo/import/${this.cardType}/${this.selectedCardMode}`,
    //       JSON.stringify({ membercards: data })
    //     ).subscribe({
    //       next: (res: any) => {
    //         this.isImporting = false;
    //         if (res?.message === 'CardNumber is Duplicate') {
    //           this.notificationService.showError('Import Failed', 'Card numbers are duplicates');
    //         } else {
    //           this.notificationService.showSuccess('Imported', 'Cards imported successfully');
    //           this.closeImportModal();
    //           this.loadMemberCards(1);
    //         }
    //       },
    //       error: (err: HttpErrorResponse) => {
    //         this.isImporting = false;
    //         this.notificationService.showError('Import Failed', err.error?.message || 'Import failed');
    //       },
    //     });
    //   });
    // };
    reader.readAsBinaryString(this.importFile);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private emptyCardForm(): MemberCardFormData {
    return { CardNumber: '', Pincode: '', CardMode: 'DIGITAL', ExpiryDate: '' };
  }

  getStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'secondary' {
    if (status === 'ACTIVE')    return 'success';
    if (status === 'AVAILABLE') return 'secondary';
    if (status === 'BLOCKED')   return 'danger';
    return 'warning';
  }

  getCardModeVariant(mode: string): 'primary' | 'secondary' {
    return mode === 'DIGITAL' ? 'primary' : 'secondary';
  }

  goBack(): void {
    this.router.navigate(['/crafted/retail/Card']);
  }
}