import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';

interface Channel {
  id: number;
  tenant_id: string;
  liff_id: string;
  channel_name: string;
  client_id: string;
  client_secret: string;
  created_at: string;
}

interface Template {
  id: number;
  tenant_id: string;
  template_id: string;
  name: string;
  type: string;
  payload: string;
  imagepath: string | null;
  imagename: string | null;
  redirect_url: string | null;
  created_at: string;
  updated_at: string;
  client_id: string;
}

@Component({
  selector: 'app-line-integration',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, ModalComponent, InputComponent, LoadingComponent],
  templateUrl: './line-integration.component.html',
  styleUrl: './line-integration.component.css'
})
export class LineIntegrationComponent implements OnInit {
  channels: Channel[] = [];
  templates: Template[] = [];
  loadingChannels = false;
  loadingTemplates = false;
  showChannelModal = false;
  creatingTemplate = false;
  deletingTemplateId: string | null = null;
  isEditMode = false;
  savingChannel = false;
  channelId: string = '';

  channelFormData = {
    channelId: '',
    channelSecret: '',
    channelName: '',
    liffId: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private notification: NotificationService,
    private confirmation: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelId = params['channelId'];
      if (this.channelId) {
        this.loadChannel();
        this.loadTemplates();
      }
    });
  }

  loadChannel(): void {
    this.loadingChannels = true;
    this.dataService.getMethod(`api/v1/member/line/channel/${this.channelId}`).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.channels = response.data;
        }
        this.loadingChannels = false;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to load channel');
        this.loadingChannels = false;
      }
    });
  }

  loadTemplates(): void {
    this.loadingTemplates = true;
    this.dataService.getMethod(`api/v1/member/line/templates/bychannel/${this.channelId}`).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.templates = response.data || [];
        }
        this.loadingTemplates = false;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to load templates');
        this.loadingTemplates = false;
      }
    });
  }

  openCreateChannelModal(): void {
    this.isEditMode = false;
    this.showChannelModal = true;
    this.channelFormData = { channelId: '', channelSecret: '', channelName: '', liffId: '' };
  }

  openEditChannelModal(): void {
    if (this.channels.length === 0) {
      this.notification.showInfo('Info', 'No channel found to edit');
      return;
    }
    const channel = this.channels[0];
    this.isEditMode = true;
    this.showChannelModal = true;
    this.channelFormData = {
      channelId: channel.client_id,
      channelSecret: channel.client_secret,
      channelName: channel.channel_name || '',
      liffId: channel.liff_id || ''
    };
  }

  closeChannelModal(): void {
    this.showChannelModal = false;
    this.channelFormData = { channelId: '', channelSecret: '', channelName: '', liffId: '' };
    this.isEditMode = false;
    this.savingChannel = false;
  }

  saveChannel(): void {
    if (!this.channelFormData.channelId.trim() || !this.channelFormData.channelSecret.trim()) {
      this.notification.showError('Validation', 'Please fill in all required fields');
      return;
    }

    const payload = {
      client_id: this.channelFormData.channelId,
      client_secret: this.channelFormData.channelSecret,
      channel_name: this.channelFormData.channelName,
      liff_id: this.channelFormData.liffId
    };

    this.savingChannel = true;
    const apiCall = this.isEditMode
      ? this.dataService.putMethod('api/v1/member/line/updatechannel', payload)
      : this.dataService.postMethod('api/v1/member/line/createchannel', payload);

    apiCall.subscribe({
      next: (response: any) => {
        if (response.status === 200 || response.status === 201) {
          this.notification.showSuccess('Success', `Channel ${this.isEditMode ? 'updated' : 'created'} successfully`);
          this.closeChannelModal();
          this.loadChannel();
        }
        this.savingChannel = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showError('Error', error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} channel`);
        this.savingChannel = false;
      }
    });
  }

  generateTemplateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'T-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  createTemplate(): void {
    this.creatingTemplate = true;
    const templateId = this.generateTemplateId();

    const defaultPayload = {
      messages: [{
        type: 'flex',
        altText: 'New Template',
        contents: {
          type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://images.pexels.com/photos/13006757/pexels-photo-13006757.jpeg',
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'cover'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [{ type: 'text', text: 'Start editing your template...', wrap: true }]
          }
        }
      }]
    };

    const payload = {
      template_id: templateId,
      name: 'New Template',
      type: 'flex',
      payload: JSON.stringify(defaultPayload),
      imagepath: 'path/to/image.png',
      imagename: 'image.png',
      redirect_url: 'https://example.com',
      client_id: this.channelId
    };

    this.dataService.postMethod('api/v1/member/line/createtemplate', payload).subscribe({
      next: (response: any) => {
        if (response.status === 200 || response.status === 201) {
          this.notification.showSuccess('Success', 'Template created successfully');
          const createdTemplate = response.data || payload;
          setTimeout(() => {
            this.router.navigate(
              ['/crafted/retail/LineIntegrationTemplates', this.channelId, templateId],
              { state: { template: createdTemplate, isNewTemplate: true } }
            );
          }, 500);
        }
        this.creatingTemplate = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showError('Error', error.error?.message || 'Failed to create template');
        this.creatingTemplate = false;
      }
    });
  }

  confirmDeleteTemplate(template: Template): void {
    this.confirmation.confirm({
      message: `Are you sure you want to delete "${template.name}" (${template.template_id})? This action cannot be undone.`,
      title: 'Delete Template'
    }).then((confirmed) => {
      if (confirmed) this.deleteTemplate(template);
    });
  }

  deleteTemplate(template: Template): void {
    this.deletingTemplateId = template.template_id;
    this.dataService.deleteMethod(`api/v1/member/line/deletetemplate/${template.template_id}/${this.channelId}`).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.notification.showSuccess('Success', `Template "${template.name}" deleted successfully`);
          this.templates = this.templates.filter(t => t.id !== template.id);
          this.loadTemplates();
        }
        this.deletingTemplateId = null;
      },
      error: (error: HttpErrorResponse) => {
        const msg = error.status === 404 ? 'Template not found'
          : error.status === 403 ? 'You do not have permission to delete this template'
          : error.error?.message || 'Failed to delete template';
        this.notification.showError('Delete Failed', msg);
        this.deletingTemplateId = null;
      }
    });
  }

  viewTemplateDetails(template: Template): void {
    this.router.navigate(
      ['/crafted/retail/LineIntegrationTemplates', template.client_id, template.template_id],
      { state: { template } }
    );
  }

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  BacktoListScreen(): void {
    this.router.navigate(['/crafted/retail/LineChannels']);
  }
}