import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { dataservice } from 'src/app/data.service';
// DataService
import { NotificationService } from '../../../shared/services/notification.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { TabComponent, TabItem } from '../../../components/ui/tab/tab.component';
import { ButtonComponent } from '../../../components/ui/button/button.component';
import { ModalComponent } from '../../../components/ui/modal/modal.component';
import { InputComponent } from '../../../components/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../components/ui/select/select.component';
// import { MultiSelectComponent, MultiSelectOption } from '../../../components/ui/multi-select/multi-select.component';
import { MultiSelectOption,MultiselectComponent } from '../../../components/ui/multi-select/multi-select.component';
import { TableComponent, TableColumn, TableConfig } from '../../../components/ui/table/table.component';
import { LoadingComponent } from '../../../components/ui/loading/loading.component';
import { DataService } from '../../../data.service';

@Component({
  selector: 'app-rfm-segmentation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabComponent,
    ButtonComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
    MultiselectComponent,
    TableComponent,
    LoadingComponent,
    TabComponent
  ],
  templateUrl: './rfm-segmentation.component.html',
  styleUrls: [],
})
export class RfmSegmentationComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataservice: DataService,
    private notification: NotificationService,
    private confirmation: ConfirmationService,
  ) {}

  isLoading = false;
  targetId: any;
  currentTabId: string = 'campaigns';

  tabs: TabItem[] = [
    { label: 'Campaigns', value: 'campaigns' },
    { label: 'Members', value: 'members' },
    { label: 'Logs', value: 'logs' },
  ];

  // Target Details
  targetDetails: any = null;
  targetName = '';
  targetCategories: any = [];
  targetParameters: { key: string; value: any }[] = [];
  targetHumanDescription = '';

  // Dialogs
  showCampaignDialog = false;
  showDeleteConfirm = false;
  showSendDialog = false;
  deletingCampaign: any = null;
  sendingCampaign: any = null;
  isEditMode = false;
  editingCampaignId: string | null = null;

  // Campaign Form
  campaignForm: any = { campaignName: '', channel: null, template: null, couponCodes: [] };

  // Send Form
  sendForm: any = { sendType: 'sendnow', scheduleDate: null, scheduleTime: null };

  // Data
  allChannels: any[] = [];
  allTemplates: any[] = [];
  allCoupons: any[] = [];
  targetMembersData: any[] = [];
  allCampaigns: any[] = [];
  campaignLogs: any[] = [];

  analyticsData = { sendMessage: 0, scheduleLater: 0, opened: 2, clicked: 4 };

  // Derived select options
  get channelOptions(): SelectOption[] {
    return this.allChannels.map(ch => ({ value: ch.id, label: ch.channel_name }));
  }
  get templateOptions(): SelectOption[] {
    return this.allTemplates.map(t => ({ value: t.template_id, label: t.name }));
  }
  get couponOptions(): MultiSelectOption[] {
    return this.allCoupons.map(c => ({ value: c.code, label: c.displayText }));
  }

  // Member Table
  memberTableColumns: TableColumn[] = [
    { key: 'memberid', label: 'Member ID' },
    { key: 'firstname', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'level', label: 'Level' },
  ];
  memberTableConfig: TableConfig = { searchable: true, pagination: true, pageSize: 10, emptyMessage: 'No members found' };

  // Logs Table
  logsTableColumns: TableColumn[] = [
    { key: 'campaignName', label: 'Campaign' },
    { key: 'channelName', label: 'Channel' },
    { key: 'status', label: 'Status' },
    { key: 'senttime', label: 'Sent At' },
    { key: 'created_at', label: 'Created' },
  ];
  logsTableConfig: TableConfig = { searchable: true, pagination: true, pageSize: 10, emptyMessage: 'No logs found' };

  // Chip colors (mapped to Tailwind via ngClass)
  private chipColorMap: Record<string, string> = {
    'chip-blue': 'bg-blue-100 text-blue-800 border-blue-300',
    'chip-pink': 'bg-pink-100 text-pink-700 border-pink-300',
    'chip-green': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'chip-purple': 'bg-violet-100 text-violet-800 border-violet-300',
    'chip-orange': 'bg-orange-100 text-orange-700 border-orange-300',
    'chip-yellow': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'chip-teal': 'bg-teal-100 text-teal-800 border-teal-300',
    'chip-red': 'bg-red-100 text-red-700 border-red-300',
    'chip-gray': 'bg-gray-100 text-gray-600 border-gray-300',
    'chip-indigo': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'chip-cyan': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  };
  private chipKeys = Object.keys(this.chipColorMap);

  getChipColor(index: number): string {
    const key = this.chipKeys[index % this.chipKeys.length];
    return this.chipColorMap[key];
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.targetId = params['targetId'];
    });
    this.getAllChannels();
    this.getTargetMembers();
    this.getAllCoupons();
    this.getTargetDetails();
    this.getCampaignLogs();
  }

  onTabChange(tabValue: string): void {
    this.currentTabId = tabValue;
  }

  // ==================== TARGET DATA ====================

  getTargetDetails(): void {
    this.dataservice.getMethod(`api/v1/member/rfm/getTarget/${this.targetId}`).subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.data) {
          this.targetDetails = response.data;
          this.targetName = response.data.targetname || '';
          try {
            const query = JSON.parse(response.data.targetquery || '{}');
            this.targetCategories = query.category || [];
            this.targetParameters = Object.entries(query)
              .filter(([key]) => key !== 'category')
              .map(([key, value]) => ({ key, value }));
          } catch {
            this.targetCategories = [];
            this.targetParameters = [];
          }
          this.targetHumanDescription = this.getHumanReadableDescription(response.data);
        }
      },
      error: (err:any) => console.error('Error fetching target details:', err),
    });
  }

  getTargetMembers(): void {
    this.dataservice.getMethod(`api/v1/member/rfm/getmemberdetails/${this.targetId}`).subscribe({
      next: (response: any) => { this.targetMembersData = response.data || []; },
      error: (err:any) => console.error('Error fetching members:', err),
    });
  }

  getCampaignLogs(): void {
    this.dataservice.getMethod(`api/v1/member/getTargetlogs/${this.targetId}?page=1&limit=100`).subscribe({
      next: (response: any) => { this.campaignLogs = response.data || []; },
      error: (err:any) => console.error('Error fetching logs:', err),
    });
  }

  // ==================== CHANNEL / TEMPLATE / COUPON ====================

  getAllChannels(): void {
    this.dataservice.getMethod('api/v1/member/line/Allchannels').subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.allChannels = response.data;
          this.getAllCampaigns();
        }
      },
      error: (err:any) => console.error('Error fetching channels:', err),
    });
  }

  getAllCoupons(): void {
    this.dataservice.getMethod('api/v1/coupon/all').subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.allCoupons = response.data
            .filter((c: any) => c.CouponType?.toLowerCase() === 'special')
            .map((c: any) => ({
              code: c.Code,
              description: c.Description || c.Code,
              type: c.CouponType,
              value: c.ValueFormula,
              status: c.CurrentStatus,
              displayText: `${c.Code} - ${c.Description || 'No description'} (${c.ValueFormula || 'N/A'})`,
            }));
        }
      },
      error: (err:any) => console.error('Error fetching coupons:', err),
    });
  }

  onChannelChangeByValue(channelId: string): void {
    this.campaignForm.channel = channelId;
    this.campaignForm.template = null;
    const selected = this.allChannels.find(ch => ch.id === channelId);
    if (selected) this.getTemplatesByChannel(selected.client_id);
  }

  getTemplatesByChannel(clientId: string): void {
    this.dataservice.getMethod(`api/v1/member/line/templates/bychannel/${clientId}`).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.allTemplates = response.data.map((t: any) => ({
            ...t,
            imageUrl: this.extractImageFromPayload(t.payload),
          }));
        }
      },
      error: (err:any) => console.error('Error fetching templates:', err),
    });
  }

  // ==================== CAMPAIGNS CRUD ====================

  getAllCampaigns(): void {
    this.dataservice.getMethod(`api/v1/member/rfm/Campaignbytarget/${this.targetId}`).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.allCampaigns = response.data.map((campaign: any) => {
            const channel = this.allChannels.find(ch => ch.client_id === campaign.client_id);
            return {
              id: campaign.id,
              campaignId: campaign.campaignID,
              campaignName: campaign.campaignName,
              targetID: campaign.targetID,
              templateID: campaign.templateID,
              client_id: campaign.client_id,
              channelName: channel ? channel.channel_name : campaign.client_id,
              templateName: '',
              couponCodes: this.parseCouponCodes(campaign.CouponCode),
              status: this.getCampaignStatus(campaign),
              scheduleType: campaign.scheduled_time ? 'sendlater' : 'sendnow',
              scheduleDate: campaign.scheduled_time?.split(' ')[0] ?? null,
              scheduleTime: campaign.scheduled_time?.split(' ')[1] ?? null,
              createdDate: campaign.created_at,
              sentDate: campaign.senttime,
              sent: campaign.sent,
              scheduled_time: campaign.scheduled_time,
            };
          });
          this.fetchTemplateNamesForCampaigns();
          this.updateAnalytics();
        }
      },
      error: (err:any) => {
        console.error('Error fetching campaigns:', err);
        this.notification.showError('Error', 'Failed to load campaigns');
      },
    });
  }

  fetchTemplateNamesForCampaigns(): void {
    const uniqueClientIds = [...new Set(this.allCampaigns.map(c => c.client_id))];
    uniqueClientIds.forEach(clientId => {
      this.dataservice.getMethod(`api/v1/member/line/templates/bychannel/${clientId}`).subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.allCampaigns.forEach(campaign => {
              if (campaign.client_id === clientId) {
                const t = response.data.find((t: any) => t.template_id === campaign.templateID);
                campaign.templateName = t ? t.name : campaign.templateID;
              }
            });
          }
        },
      });
    });
  }

  createCampaign(): void {
    this.isEditMode = false;
    this.editingCampaignId = null;
    this.campaignForm = { campaignName: '', channel: null, template: null, couponCodes: [] };
    this.allTemplates = [];
    this.showCampaignDialog = true;
  }

  editCampaign(campaign: any, e: Event): void {
    e.stopPropagation();
    this.isEditMode = true;
    this.editingCampaignId = campaign.campaignId;
    const channel = this.allChannels.find(ch => ch.client_id === campaign.client_id);
    this.campaignForm = {
      campaignName: campaign.campaignName,
      channel: channel?.id ?? null,
      template: campaign.templateID,
      couponCodes: campaign.couponCodes || [],
    };
    if (campaign.client_id) this.getTemplatesByChannel(campaign.client_id);
    this.showCampaignDialog = true;
  }

  saveCampaign(): void {
    if (!this.campaignForm.campaignName?.trim()) {
      this.notification.showError('Validation', 'Please enter a campaign name');
      return;
    }
    if (!this.campaignForm.channel) {
      this.notification.showError('Validation', 'Please select a channel');
      return;
    }
    if (!this.campaignForm.template) {
      this.notification.showError('Validation', 'Please select a template');
      return;
    }
    const selectedChannel = this.allChannels.find(ch => ch.id === this.campaignForm.channel);
    if (!selectedChannel) {
      this.notification.showError('Error', 'Invalid channel selected');
      return;
    }
    const payload: any = {
      client_id: selectedChannel.client_id,
      campaignName: this.campaignForm.campaignName,
      targetID: this.targetId,
      templateID: this.campaignForm.template,
      scheduled_time: null,
      CouponCode: this.campaignForm.couponCodes || [],
      targetName: this.targetName,
    };
    if (this.isEditMode && this.editingCampaignId) {
      this.dataservice.putMethod(`api/v1/member/rfm/updateCampaign/${this.editingCampaignId}`, payload).subscribe({
        next: () => {
          this.notification.showSuccess('Success', 'Campaign updated');
          this.getAllCampaigns();
          this.cancelCampaignDialog();
        },
        error: () => this.notification.showError('Error', 'Failed to update campaign'),
      });
    } else {
      payload.campaignID = this.generateUniqueId('CMP');
      this.dataservice.postMethod('api/v1/member/rfm/createCampaign', payload).subscribe({
        next: () => {
          this.notification.showSuccess('Success', 'Campaign created');
          this.getAllCampaigns();
          this.cancelCampaignDialog();
        },
        error: () => this.notification.showError('Error', 'Failed to create campaign'),
      });
    }
  }

  cancelCampaignDialog(): void {
    this.showCampaignDialog = false;
    this.isEditMode = false;
    this.editingCampaignId = null;
    this.campaignForm = { campaignName: '', channel: null, template: null, couponCodes: [] };
    this.allTemplates = [];
  }

  async confirmDeleteCampaign(campaign: any, e: Event): Promise<void> {
    e.stopPropagation();
    const confirmed = await this.confirmation.confirmDelete(campaign.campaignName, 'campaign');
    if (confirmed) {
      this.deletingCampaign = campaign;
      this.deleteCampaign();
    }
  }

  deleteCampaign(): void {
    if (!this.deletingCampaign) return;
    this.dataservice.deleteMethod(`api/v1/member/rfm/targetcampaign/delete/${this.deletingCampaign.campaignId}`).subscribe({
      next: () => {
        this.notification.showSuccess('Success', 'Campaign deleted');
        this.getAllCampaigns();
        this.showDeleteConfirm = false;
        this.deletingCampaign = null;
      },
      error: () => {
        this.notification.showError('Error', 'Failed to delete campaign');
        this.showDeleteConfirm = false;
        this.deletingCampaign = null;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletingCampaign = null;
  }

  // ==================== SEND / SCHEDULE ====================

  openSendDialog(campaign: any, e: Event): void {
    e.stopPropagation();
    this.sendingCampaign = campaign;
    this.sendForm = {
      sendType: campaign.scheduleDate ? 'sendlater' : 'sendnow',
      scheduleDate: campaign.scheduleDate ?? null,
      scheduleTime: campaign.scheduleTime ?? null,
    };
    this.showSendDialog = true;
  }

  cancelSendDialog(): void {
    this.showSendDialog = false;
    this.sendingCampaign = null;
    this.sendForm = { sendType: 'sendnow', scheduleDate: null, scheduleTime: null };
  }

  executeSendCampaign(): void {
    if (!this.sendingCampaign) return;
    if (this.sendForm.sendType === 'sendlater') {
      this.handleScheduleLater();
    } else {
      this.executeSendNow();
    }
  }

  executeSendNow(): void {
    if (!this.sendingCampaign) return;
    const doSend = () => {
      this.dataservice.postMethod(`api/v1/member/rfm/targetcampaign/send/${this.sendingCampaign.campaignId}`, {}).subscribe({
        next: (response: any) => {
          const msg = response.status === 200 ? 'Campaign sent successfully' : (response.message || 'Campaign send initiated');
          this.notification.showSuccess('Success', msg);
          this.getAllCampaigns();
          this.showSendDialog = false;
          this.sendingCampaign = null;
        },
        error: (err: any) => {
          this.notification.showError('Error', err.error?.message || 'Failed to send campaign');
          this.showSendDialog = false;
        },
      });
    };

    if (this.sendingCampaign.status?.toLowerCase() === 'delivered') {
      const resetPayload = {
        client_id: this.sendingCampaign.client_id,
        campaignName: this.sendingCampaign.campaignName,
        targetID: this.sendingCampaign.targetID,
        templateID: this.sendingCampaign.templateID,
        scheduled_time: null,
        CouponCode: this.sendingCampaign.couponCodes || [],
        sent: 'No',
      };
      this.dataservice.putMethod(`api/v1/member/rfm/updateCampaign/${this.sendingCampaign.campaignId}`, resetPayload).subscribe({
        next: () => doSend(),
        error: () => this.notification.showError('Error', 'Failed to reset campaign status'),
      });
    } else {
      doSend();
    }
  }

  handleScheduleLater(): void {
    if (!this.sendForm.scheduleDate || !this.sendForm.scheduleTime) {
      this.notification.showError('Validation', 'Please select schedule date and time');
      return;
    }
    const scheduled_time = `${this.sendForm.scheduleDate} ${this.sendForm.scheduleTime}`;
    const payload: any = {
      client_id: this.sendingCampaign.client_id,
      campaignName: this.sendingCampaign.campaignName,
      targetID: this.sendingCampaign.targetID,
      templateID: this.sendingCampaign.templateID,
      scheduled_time,
      CouponCode: this.sendingCampaign.couponCodes || [],
    };
    if (this.sendingCampaign.status?.toLowerCase() === 'delivered') payload.sent = 'No';

    this.dataservice.putMethod(`api/v1/member/rfm/updateCampaign/${this.sendingCampaign.campaignId}`, payload).subscribe({
      next: () => {
        const action = this.isDeliveredOrScheduled() ? 'rescheduled' : 'scheduled';
        this.notification.showSuccess('Success', `Campaign ${action} successfully`);
        this.getAllCampaigns();
        this.showSendDialog = false;
        this.sendingCampaign = null;
      },
      error: () => this.notification.showError('Error', 'Failed to schedule campaign'),
    });
  }

  // ==================== HELPERS ====================

  getCampaignStatus(campaign: any): string {
    if (campaign.sent === 'Yes') return 'Delivered';
    if (campaign.sent === 'No') {
      return (campaign.scheduled_time?.trim()) ? 'Scheduled' : 'Unscheduled';
    }
    return 'Unscheduled';
  }

  updateAnalytics(): void {
    this.analyticsData.sendMessage = this.allCampaigns.filter(c => c.status === 'Delivered').length;
    this.analyticsData.scheduleLater = this.allCampaigns.filter(c => c.status === 'Scheduled').length;
  }

  isDeliveredOrScheduled(): boolean {
    const s = this.sendingCampaign?.status?.toLowerCase();
    return s === 'delivered' || s === 'scheduled';
  }
  isScheduled(): boolean { return this.sendingCampaign?.status?.toLowerCase() === 'scheduled'; }
  isDelivered(): boolean { return this.sendingCampaign?.status?.toLowerCase() === 'delivered'; }

  onCampaignCardClick(campaign: any): void {}

  getCouponDescription(code: string): string {
    return this.allCoupons.find(c => c.code === code)?.description ?? code;
  }
  getCouponDescriptions(codes: string[]): string {
    if (!codes?.length) return '';
    return codes.map(c => this.getCouponDescription(c)).join(', ');
  }

  parseCouponCodes(couponData: any): string[] {
    if (!couponData) return [];
    if (Array.isArray(couponData)) return couponData;
    if (typeof couponData === 'string') {
      try {
        const parsed = JSON.parse(couponData);
        return Array.isArray(parsed) ? parsed : [couponData];
      } catch { return couponData.trim() ? [couponData] : []; }
    }
    return [];
  }

  extractImageFromPayload(payload: string): string {
    try {
      const p = JSON.parse(payload);
      return p?.messages?.[0]?.contents?.hero?.url || '';
    } catch { return ''; }
  }

  generateUniqueId(prefix: string, length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return `${prefix}-` + Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  formatTime(time: any): string {
    if (!time) return '';
    const d = new Date(time);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  }

  BacktoListScreen(): void {
    this.router.navigate(['/crafted/retail/rfm-segmentation']);
  }

  // ==================== HUMAN-READABLE DESCRIPTION ====================

  getHumanReadableDescription(data: any): string {
    let query: any;
    try { query = typeof data.targetquery === 'string' ? JSON.parse(data.targetquery) : data.targetquery; }
    catch { return 'Custom target segment'; }
    if (!query) return 'Custom target segment';
    const parts: string[] = [];
    if (query.level?.length) parts.push(`Users with ${query.level.join(' and ')} level`);
    if (query.gender?.length) parts.push(`${query.gender.join(' and ')} users`);
    if (query.age) parts.push(this.getAgeDescription(query.age));
    if (query.joined) parts.push(`Joined between ${this.formatDateLabel(query.joined.from)} and ${this.formatDateLabel(query.joined.to)}`);
    if (query.birthday) parts.push(`Birthday in ${query.birthday.months?.join(', ')}`);
    if (query.pointsbalance) parts.push(this.getPointsDescription(query.pointsbalance));
    const exp = query.PointsExpired || query.pointsexpiry;
    if (exp) {
      const pm: any = { quarter: 'this quarter', half: 'this half', year: 'this year' };
      parts.push(`Points expiring ${pm[exp.period] || exp.period}`);
    }
    if (query.repurchase) parts.push(`Repurchase within ${query.repurchase.value} ${query.repurchase.type}`);
    if (query.brandreceived) {
      const b = query.brandreceived;
      const bp: string[] = [];
      if (b.brand_id) bp.push(`brand ${b.brand_id}`);
      if (b.times) bp.push(`${b.times} times`);
      if (b.from && b.to) bp.push(`from ${this.formatDateLabel(b.from)} to ${this.formatDateLabel(b.to)}`);
      if (bp.length) parts.push(`Received ${bp.join(', ')}`);
    }
    return parts.length ? parts.join('. ') + '.' : 'Custom target segment';
  }

  getAgeDescription(age: any): string {
    const opMap: any = { '<=': 'at most', '>=': 'at least', '<': 'under', '>': 'over', '=': 'exactly', between: 'between' };
    if (age.operator === 'between') return `Age between ${age.from} and ${age.to}`;
    return `Age ${opMap[age.operator] || age.operator} ${age.value}`;
  }

  getPointsDescription(points: any): string {
    const opMap: any = { '<=': 'at most', '>=': 'at least', '<': 'less than', '>': 'more than', '=': 'equal to' };
    return `Points balance ${opMap[points.operator] || points.operator} ${points.value}`;
  }

  formatDateLabel(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
