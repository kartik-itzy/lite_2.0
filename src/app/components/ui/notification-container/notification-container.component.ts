import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationMessage } from '../../../shared/services/notification.service';
import { AlertComponent, AlertVariant } from '../alert/alert.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <app-alert
        *ngFor="let notification of notifications"
        [variant]="getAlertVariant(notification.type)"
        [title]="notification.title"
        [message]="notification.message"
        [dismissible]="notification.dismissible ?? true"
        (dismissed)="dismissNotification(notification.id)"
        class="transform transition-all duration-300 ease-in-out"
        [class.animate-in]="true"
        [class.slide-in-from-right]="true"
      ></app-alert>
    </div>
  `,
  styles: [`
    .animate-in {
      animation: slideInFromRight 0.3s ease-out;
    }
    
    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getAlertVariant(type: string): AlertVariant {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  }

  dismissNotification(id: string): void {
    this.notificationService.dismissNotification(id);
  }
}
