import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { DataService } from '../data.service';
import { HEROICONS } from './icons-map';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';

@Component({
  selector: 'app-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrl: 'sidebar.component.scss',
  imports: [CommonModule, RouterModule, SanitizeHtmlPipe],
  animations: [
    trigger('slideDown', [
      state(
        'void',
        style({
          height: '0',
          opacity: '0',
          overflow: 'hidden',
        })
      ),
      state(
        '*',
        style({
          height: '*',
          opacity: '1',
        })
      ),
      transition('void <=> *', [animate('200ms ease-in-out')]),
    ]),
  ],
})
export class SidebarComponent implements OnInit {
  constructor(private dataServices: DataService) { }

  dynamicMenu!: { title: any; items: any; }[];
  isDemoMenuOpen = false;

  sidebarGroups:
    | {
      groupKey: string;
      groupName: any;
      groupThaiName: any;
      items: any;
    }[]
    | undefined;
  
  ngOnInit(): void {
    this.loadSidebarMenu();
  }

  loadSidebarMenu() {
    this.dataServices
      .getMethod('api/v1/customers/appmenulist').subscribe({
        next: (res: any) => {
          const groups = res?.data?.groups;
          const menu = res?.data?.menu;

          const manualIntegrationItem = {
            id: 9999,
            name: 'Line Integration',
            url: 'crafted/retail/LineIntegration',
            ThaiName: 'Line การเชื่อมต่อ & การตั้งค่า ภายนอก',
          };

          const manualIntegrationItem3 = {
            id: 83,
            name: 'Brand Points',
            url: 'crafted/retail/BrandPointsByMember',
            ThaiName: 'Brand Points',
          };

          const manualIntegrationItem5 = {
            id: 84,
            name: 'Transactions History',
            url: 'crafted/retail/TransactionsHistory',
            ThaiName: 'Transactions History',
          };

          menu['integration'].push(manualIntegrationItem);
          menu['brand'].push(manualIntegrationItem3);
          menu['crm'].push(manualIntegrationItem5);

          if (!groups || !menu) return;

          this.dynamicMenu = Object.keys(groups).map(key => ({
            title: groups[key],
            items: (menu[key] || []).map((item: any) => ({
              name: item.name,
              url: item.url,
              icon: this.getIcon(item.name)
            }))
          }));
          
          console.log('Dynamic Menu:', this.dynamicMenu);
        }
      });
  }

  getIcon(name: string): string {
    const formatted = name.toLowerCase().replace(/\s+/g, '');
    const icon = HEROICONS[formatted] || HEROICONS['default'];
    console.log(`Icon for "${name}" (${formatted}):`, icon ? 'Found' : 'Using default');
    return icon;
  }

  getStaticIcon(iconName: string): string {
    return HEROICONS[iconName] || HEROICONS['default'];
  }

  toggleDemoMenu(): void {
    this.isDemoMenuOpen = !this.isDemoMenuOpen;
  }
}