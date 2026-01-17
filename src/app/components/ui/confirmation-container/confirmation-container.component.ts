import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmationService, ConfirmationDialogConfig } from '../../../shared/services/confirmation.service';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-confirmation-container',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  template: `
    <app-confirmation-dialog
      *ngIf="showDialog"
      #confirmationDialog
      [data]="dialogConfig"
      (confirmed)="onConfirmed()"
      (cancelled)="onCancelled()"
    ></app-confirmation-dialog>
  `,
  styles: []
})
export class ConfirmationContainerComponent implements OnInit, OnDestroy {
  @ViewChild('confirmationDialog') confirmationDialog!: ConfirmationDialogComponent;
  
  showDialog = false;
  dialogConfig: ConfirmationDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'info'
  };

  private subscription: Subscription = new Subscription();

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.confirmationService.confirmation$.subscribe(config => {
        if (config) {
          console.log('Opening confirmation dialog:', config.title);
          this.dialogConfig = this.convertConfigToData(config);
          this.showDialog = true;
        } else {
          console.log('Closing confirmation dialog');
          this.showDialog = false;
        }
      })
    );
  }

  private convertConfigToData(config: ConfirmationDialogConfig): ConfirmationDialogData {
    return {
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      cancelText: config.cancelText,
      variant: config.variant || 'info',
      icon: config.icon,
      requireTextInput: config.requireTextInput,
      textInputLabel: config.textInputLabel,
      textInputPlaceholder: config.textInputPlaceholder,
      expectedText: config.expectedText,
      textInputError: config.textInputError,
      loading: config.loading,
      error: config.error
    };
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onConfirmed(): void {
    this.confirmationService.setResult(true);
  }

  onCancelled(): void {
    this.confirmationService.setResult(false);
  }

  // Methods to control dialog state
  setLoading(loading: boolean): void {
    if (this.confirmationDialog) {
      this.confirmationDialog.setLoading(loading);
    }
  }

  setError(error: string): void {
    if (this.confirmationDialog) {
      this.confirmationDialog.setError(error);
    }
  }

  clearError(): void {
    if (this.confirmationDialog) {
      this.confirmationDialog.clearError();
    }
  }

  reset(): void {
    if (this.confirmationDialog) {
      this.confirmationDialog.reset();
    }
  }
}
