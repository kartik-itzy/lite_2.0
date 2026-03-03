import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DataService } from '../../../data.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent } from '../../../components/ui/select/select.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
// import { MultiselectComponent } from '../../../components/ui/multiselect/multiselect.component';
import { SelectOption } from '../../../components/ui/select/select.component';
import { MultiselectComponent,MultiSelectOption } from '../../../components/ui/multi-select/multi-select.component';
// import { MultiSelectOption } from '../../../components/ui/multiselect/multiselect.component';
// MultiselectComponent

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

interface LineMember {
  LineUserId: string;
  FirstName: string;
  LastName: string;
  RefPhoneNo: string;
}

interface FormData {
  name: string;
  type: string;
  altText: string;
  textMessage: string;
  heroImageSize: string;
  heroAspectRatio: string;
  heroAspectMode: string;
  bodyTexts: string[];
  couponLink: string;
  redirect_url: string;
  buttonLabel: string;
  buttonColor: string;
}

@Component({
  selector: 'app-line-integration-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    LoadingComponent,
    MultiselectComponent
  ],
  templateUrl: './line-integration-templates.component.html',
  styleUrl: './line-integration-templates.component.css'
})
export class LineIntegrationTemplatesComponent implements OnInit {
  template: Template | null = null;
  loading = false;
  saving = false;
  sendingMessage = false;
  uploadingImage = false;
  deletingImage = false;

  channelId = '';
  templateId = '';

  imagePreviewUrl = '';
  messagePreview: any = null;

  isEditingHeaderName = false;
  isEditingHeaderType = false;
  tempHeaderName = '';
  tempHeaderType = '';

  selectedUsers: string[] = [];
  lineMembers: LineMember[] = [];
  lineMemberOptions: MultiSelectOption[] = [];

  formData: FormData = {
    name: '',
    type: 'flex',
    altText: '',
    textMessage: '',
    heroImageSize: 'full',
    heroAspectRatio: '20:13',
    heroAspectMode: 'cover',
    bodyTexts: [''],
    couponLink: 'No',
    redirect_url: '',
    buttonLabel: 'Visit Website',
    buttonColor: '#06C755'
  };

  // Select options
  messageTypeOptions: SelectOption[] = [
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image' },
    { value: 'flex', label: 'Flex' },
    { value: 'carousel', label: 'Carousel' }
  ];

  imageSizeOptions: SelectOption[] = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: 'full', label: 'Full' }
  ];

  aspectRatioOptions: SelectOption[] = [
    { value: '20:13', label: '20:13' },
    { value: '20:9', label: '20:9' },
    { value: '1:1', label: '1:1' },
    { value: '4:3', label: '4:3' }
  ];

  aspectModeOptions: SelectOption[] = [
    { value: 'cover', label: 'Cover' },
    { value: 'fit', label: 'Fit' }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelId = params['channelId'];
      this.templateId = params['id'];
      if (this.templateId) {
        const nav = this.router.getCurrentNavigation();
        const state = nav?.extras?.state || history.state;
        if (state?.template) {
          this.initFromTemplate(state.template);
        } else {
          this.loadTemplate();
        }
        this.loadLineMembers();
      }
    });
  }

  loadTemplate(): void {
    this.loading = true;
    this.dataService.getMethod(`api/v1/member/line/template/${this.templateId}`).subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.data) {
          this.initFromTemplate(response.data);
        }
        this.loading = false;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to load template');
        this.loading = false;
      }
    });
  }

  initFromTemplate(tmpl: Template): void {
    this.template = tmpl;
    try {
      const parsed = typeof tmpl.payload === 'string' ? JSON.parse(tmpl.payload) : tmpl.payload;
      const msg = parsed?.messages?.[0] || parsed;
      const body = msg?.contents?.body?.contents || [];
      const footer = msg?.contents?.footer?.contents || [];

      this.formData = {
        name: tmpl.name || '',
        type: tmpl.type || 'flex',
        altText: msg?.altText || '',
        textMessage: msg?.text || '',
        heroImageSize: msg?.contents?.hero?.size || 'full',
        heroAspectRatio: msg?.contents?.hero?.aspectRatio || '20:13',
        heroAspectMode: msg?.contents?.hero?.aspectMode || 'cover',
        bodyTexts: body.filter((c: any) => c.type === 'text').map((c: any) => c.text) || [''],
        couponLink: tmpl.redirect_url ? 'No' : 'Yes',
        redirect_url: tmpl.redirect_url || '',
        buttonLabel: footer[0]?.action?.label || 'Visit Website',
        buttonColor: footer[0]?.style === 'primary' ? '#06C755' : (footer[0]?.color || '#06C755')
      };

      if (tmpl.imagepath) {
        this.imagePreviewUrl = tmpl.imagepath;
      }
    } catch {
      this.formData.name = tmpl.name;
      this.formData.type = tmpl.type;
    }

    this.updatePreview();
  }

  loadLineMembers(): void {
    this.dataService.getMethod('api/v1/member/line/getLineMembers').subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.lineMembers = response.data || [];
          this.lineMemberOptions = this.lineMembers.map((m: any) => ({
            value: m.LineUserId,
            label: `${m.FirstName} ${m.LastName} (${m.RefPhoneNo})`
          }));
        }
      },
      error: () => {}
    });
  }

  // Header name editing
  toggleEditHeaderName(): void {
    this.tempHeaderName = this.formData.name;
    this.isEditingHeaderName = true;
    setTimeout(() => document.getElementById('headerNameInput')?.focus(), 0);
  }

  saveHeaderName(): void {
    if (this.tempHeaderName.trim()) {
      this.formData.name = this.tempHeaderName.trim();
      this.updatePreview();
    }
    this.isEditingHeaderName = false;
  }

  cancelEditHeaderName(): void {
    this.isEditingHeaderName = false;
  }

  getMessageTypeLabel(): string {
    return this.messageTypeOptions.find(o => o.value === this.formData.type)?.label || this.formData.type;
  }

  // Form helpers
  shouldShowImageSettings(): boolean {
    return this.formData.type === 'image' || this.formData.type === 'flex';
  }

  shouldShowImageUpload(): boolean {
    return this.formData.type === 'image' || this.formData.type === 'flex';
  }

  hasValidImage(): boolean {
    return !!this.imagePreviewUrl && !this.imagePreviewUrl.includes('placeholder');
  }

  addBodyText(): void {
    this.formData.bodyTexts.push('');
  }

  removeBodyText(index: number): void {
    this.formData.bodyTexts.splice(index, 1);
    this.updatePreview();
  }

  onFormChange(): void {
    this.updatePreview();
  }

  onUserSelectionChanged(): void {}

  // Preview
  updatePreview(): void {
    if (this.formData.type === 'text') {
      this.messagePreview = { type: 'text', text: this.formData.textMessage || 'Your message...' };
      return;
    }

    if (this.formData.type === 'flex') {
      const bodyContents = this.formData.bodyTexts
        .filter(t => t.trim())
        .map(t => ({ type: 'text', text: t, wrap: true }));

      const footer: any[] = [];
      if (this.formData.couponLink === 'No' && this.formData.redirect_url?.trim()) {
        footer.push({
          type: 'button',
          style: 'primary',
          color: this.formData.buttonColor,
          action: { type: 'uri', label: this.formData.buttonLabel || 'Visit Website', uri: this.formData.redirect_url }
        });
      }

      this.messagePreview = {
        type: 'flex',
        altText: this.formData.altText,
        contents: {
          type: 'bubble',
          hero: this.imagePreviewUrl ? {
            type: 'image',
            url: this.imagePreviewUrl,
            size: this.formData.heroImageSize,
            aspectRatio: this.formData.heroAspectRatio,
            aspectMode: this.formData.heroAspectMode
          } : null,
          body: { type: 'box', layout: 'vertical', contents: bodyContents },
          footer: footer.length > 0 ? { type: 'box', layout: 'vertical', contents: footer } : null
        }
      };
    }
  }

  getHeroImageStyles(): any {
    const ratioMap: Record<string, string> = {
      '20:13': '65%', '20:9': '45%', '1:1': '100%', '4:3': '75%'
    };
    return {
      'padding-top': ratioMap[this.formData.heroAspectRatio] || '65%',
      'position': 'relative',
      'width': '100%'
    };
  }

  onPreviewImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // Image upload
  triggerFileInput(): void {
    document.getElementById('imageUpload')?.click();
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      this.notification.showError('Validation', 'Image must be less than 1MB');
      return;
    }

    this.uploadingImage = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('template_id', this.templateId);

    this.dataService.postMethod('api/v1/member/line/uploadimage', formData).subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.data?.url) {
          this.imagePreviewUrl = response.data.url;
          this.updatePreview();
          this.notification.showSuccess('Success', 'Image uploaded successfully');
        }
        this.uploadingImage = false;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to upload image');
        this.uploadingImage = false;
      }
    });
  }

  deleteImage(): void {
    this.deletingImage = true;
    this.dataService.deleteMethod(`api/v1/member/line/deleteimage/${this.templateId}`).subscribe({
      next: () => {
        this.imagePreviewUrl = '';
        this.updatePreview();
        this.notification.showSuccess('Success', 'Image deleted');
        this.deletingImage = false;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to delete image');
        this.deletingImage = false;
      }
    });
  }

  // Save template
  saveTemplate(): void {
    if (!this.formData.name.trim()) {
      this.notification.showError('Validation', 'Please enter a template name');
      return;
    }

    this.saving = true;
    const payload = this.buildPayload();

    this.dataService.putMethod(`api/v1/member/line/updatetemplate/${this.templateId}/${this.channelId}`, payload).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.notification.showSuccess('Success', 'Template saved successfully');
        }
        this.saving = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showError('Error', error.error?.message || 'Failed to save template');
        this.saving = false;
      }
    });
  }

  buildPayload(): any {
    let messagePayload: any;

    if (this.formData.type === 'text') {
      messagePayload = { messages: [{ type: 'text', text: this.formData.textMessage }] };
    } else {
      const bodyContents = this.formData.bodyTexts
        .filter(t => t.trim())
        .map(t => ({ type: 'text', text: t, wrap: true }));

      const footer: any[] = [];
      if (this.formData.couponLink === 'No' && this.formData.redirect_url?.trim()) {
        footer.push({
          type: 'button',
          style: 'primary',
          color: this.formData.buttonColor,
          action: { type: 'uri', label: this.formData.buttonLabel || 'Visit Website', uri: this.formData.redirect_url }
        });
      }

      messagePayload = {
        messages: [{
          type: 'flex',
          altText: this.formData.altText || this.formData.name,
          contents: {
            type: 'bubble',
            hero: this.imagePreviewUrl ? {
              type: 'image',
              url: this.imagePreviewUrl,
              size: this.formData.heroImageSize,
              aspectRatio: this.formData.heroAspectRatio,
              aspectMode: this.formData.heroAspectMode
            } : undefined,
            body: { type: 'box', layout: 'vertical', contents: bodyContents },
            ...(footer.length > 0 ? { footer: { type: 'box', layout: 'vertical', contents: footer } } : {})
          }
        }]
      };
    }

    return {
      name: this.formData.name,
      type: this.formData.type,
      payload: JSON.stringify(messagePayload),
      redirect_url: this.formData.redirect_url || null,
      imagepath: this.imagePreviewUrl || null,
      client_id: this.channelId
    };
  }

  // Send message
  sendMessage(): void {
    if (!this.selectedUsers || this.selectedUsers.length === 0) {
      this.notification.showError('Validation', 'Please select at least one user');
      return;
    }

    this.sendingMessage = true;
    const payload = this.buildPayload();
    const sendPayload = { ...payload, user_ids: this.selectedUsers };

    this.dataService.postMethod('api/v1/member/line/sendmessage', sendPayload).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.notification.showSuccess('Success', 'Message sent successfully');
          this.selectedUsers = [];
        }
        this.sendingMessage = false;
      },
      error: (error: HttpErrorResponse) => {
        this.notification.showError('Error', error.error?.message || 'Failed to send message');
        this.sendingMessage = false;
      }
    });
  }

  BacktoListScreen(): void {
    this.router.navigate(['/crafted/retail/LineIntegration', this.channelId]);
  }
}