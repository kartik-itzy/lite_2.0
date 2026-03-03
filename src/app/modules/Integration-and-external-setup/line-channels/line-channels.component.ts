import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
// import { DataService } from 'src/app/data.service';
// DataService
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { DataService } from '../../../data.service';

interface Channel {
  id: number;
  tenant_id: string;
  liff_id: string;
  channel_name: string;
  client_id: string;
  client_secret: string;
  created_at: string;
  LastModifiedOn?: string | null;
}

@Component({
  selector: 'app-line-channels',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, InputComponent, LoadingComponent],
  templateUrl: './line-channels.component.html',
  styleUrl: './line-channels.component.css'
})
export class LineChannelsComponent implements OnInit {
  channels: Channel[] = [];
  loadingChannels = false;
  showChannelModal = false;
  isEditMode = false;
  savingChannel = false;
  selectedChannelId: number | null = null;

  liffId = '';
  isEditingLiffId = false;
  originalLiffId = '';

  channelFormData = {
    channelName: '',
    channelId: '',
    channelSecret: ''
  };

  constructor(
    private router: Router,
    private dataService: DataService,

    private notification: NotificationService,
    private confirmation: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAllChannels();
    this.fetchLineId();
  }

  fetchLineId(): void {
    this.dataService.getMethod('api/v1/customers').subscribe({
      next: (res: any) => {
        this.liffId = res.data.customer[0].LineLIFFID;
        this.originalLiffId = this.liffId;
      }
    });
  }

  loadAllChannels(): void {
    this.loadingChannels = true;
    this.dataService.getMethod('api/v1/member/line/Allchannels').subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.channels = response.data || [];
        }
        this.loadingChannels = false;
      },
      error: () => {
        this.notification.showError('Failed to load channels', 'Error');
        this.loadingChannels = false;
      }
    });
  }

  toggleLiffIdEdit(): void {
    if (this.isEditingLiffId) {
      if (!this.liffId.trim()) {
        this.notification.showError('LIFF ID cannot be empty', 'Validation');
        return;
      }
      this.isEditingLiffId = false;
      this.notification.showSuccess('LIFF ID saved', 'Success');
    } else {
      this.originalLiffId = this.liffId;
      this.isEditingLiffId = true;
    }
  }

  openCreateChannelModal(): void {
    if (!this.liffId.trim()) {
      this.notification.showError('Please enter a LIFF ID first', 'Validation');
      return;
    }
    this.isEditMode = false;
    this.showChannelModal = true;
    this.selectedChannelId = null;
    this.channelFormData = { channelName: '', channelId: '', channelSecret: '' };
  }

  openEditChannelModal(channel: Channel, event: Event): void {
    event.stopPropagation();
    if (!this.liffId.trim()) {
      this.notification.showError('Please enter a LIFF ID first', 'Validation');
      return;
    }
    this.isEditMode = true;
    this.showChannelModal = true;
    this.selectedChannelId = channel.id;
    this.channelFormData = {
      channelName: channel.channel_name || '',
      channelId: channel.client_id,
      channelSecret: channel.client_secret
    };
  }

  closeChannelModal(): void {
    this.showChannelModal = false;
    this.channelFormData = { channelName: '', channelId: '', channelSecret: '' };
    this.isEditMode = false;
    this.savingChannel = false;
    this.selectedChannelId = null;
  }

  saveChannel(): void {
    if (!this.channelFormData.channelId.trim() || !this.channelFormData.channelSecret.trim()) {
      this.notification.showError('Channel ID and Secret are required', 'Validation');
      return;
    }
    if (!this.liffId.trim()) {
      this.notification.showError('LIFF ID is missing', 'Validation');
      return;
    }

    const payload = {
      liff_id: this.liffId,
      channel_name: this.channelFormData.channelName,
      client_id: this.channelFormData.channelId,
      client_secret: this.channelFormData.channelSecret
    };

    this.savingChannel = true;

    if (this.isEditMode && this.selectedChannelId) {
      this.dataService.putMethod(`api/v1/member/line/updatechannel/${this.selectedChannelId}`, payload).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.notification.showSuccess('Channel updated successfully', 'Success');
            this.closeChannelModal();
            this.loadAllChannels();
          }
          this.savingChannel = false;
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showError(error.error?.message || 'Failed to update channel', 'Error');
          this.savingChannel = false;
        }
      });
    } else {
      this.dataService.postMethod('api/v1/member/line/createchannel', payload).subscribe({
        next: (response: any) => {
          if (response.status === 200 || response.status === 201) {
            this.notification.showSuccess('Channel created successfully', 'Success');
            this.closeChannelModal();
            this.loadAllChannels();
          }
          this.savingChannel = false;
        },
        error: (error: HttpErrorResponse) => {
          this.notification.showError(error.error?.message || 'Failed to create channel', 'Error');
          this.savingChannel = false;
        }
      });
    }
  }

  confirmDeleteChannel(channel: Channel, event: Event): void {
    event.stopPropagation();
    this.confirmation.confirm({
      message: `Are you sure you want to delete "${channel.channel_name}" (${channel.client_id})? This action cannot be undone.`,
      title: 'Delete Channel'
    }).then((confirmed) => {
      if (confirmed) this.deleteChannel(channel.client_id);
    });
  }

  deleteChannel(channelId: string): void {
    this.dataService.deleteMethod(`api/v1/member/line/deletechannel/${channelId}`).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.notification.showSuccess('Channel deleted', 'Success');
          this.loadAllChannels();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showError(error.error?.message || 'Failed to delete channel', 'Error');
      }
    });
  }

  navigateToTemplates(channel: Channel): void {
    this.router.navigate(['/crafted/retail/LineIntegration', channel.client_id]);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}