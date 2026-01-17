import { Injectable, ComponentRef, ViewContainerRef, TemplateRef } from '@angular/core';
// import { ConfirmationDialogComponent } from '../../components/ui/confirmation-dialog/confirmation-dialog.component';


export interface ConfirmationDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  icon?: string;
  requireTextInput?: boolean;
  textInputLabel?: string;
  textInputPlaceholder?: string;
  expectedText?: string;
  textInputError?: string;
  loading?: boolean;
  error?: string;
}
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationResult {
  confirmed: boolean;
  cancelled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationSubject = new BehaviorSubject<ConfirmationDialogConfig | null>(null);
  private resultSubject = new BehaviorSubject<ConfirmationResult | null>(null);

  public confirmation$ = this.confirmationSubject.asObservable();
  public result$ = this.resultSubject.asObservable();

  private currentConfig: ConfirmationDialogConfig | null = null;

  confirm(config: ConfirmationDialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      this.currentConfig = config;
      this.confirmationSubject.next(config);

      // Listen for result
      const subscription = this.result$.subscribe(result => {
        if (result) {
          subscription.unsubscribe();
          this.confirmationSubject.next(null);
          this.resultSubject.next(null);
          this.currentConfig = null;
          resolve(result.confirmed);
        }
      });
    });
  }

  // Convenience methods for common confirmation types
  confirmDelete(itemName: string, itemType: string = 'item'): Promise<boolean> {
    return this.confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      size: 'md',
      showIcon: true,
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
    });
  }

  confirmSensitiveDelete(itemName: string, itemType: string = 'item'): Promise<boolean> {
    return this.confirm({
      title: 'Delete Confirmation',
      message: `This action cannot be undone. This will permanently delete the ${itemType} and remove all associated data.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      size: 'md',
      showIcon: true,
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      requireTextInput: true,
      textInputLabel: `Please type "${itemName}" to confirm deletion`,
      textInputPlaceholder: `Type ${itemName} here`,
      expectedText: itemName,
      textInputError: 'The text does not match. Please type the exact name to confirm deletion.'
    });
  }

  confirmAction(title: string, message: string, variant: 'danger' | 'warning' | 'info' | 'primary' = 'primary'): Promise<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      variant,
      size: 'md',
      showIcon: true
    });
  }

  // Method to be called by the confirmation dialog component
  setResult(confirmed: boolean): void {
    this.resultSubject.next({
      confirmed,
      cancelled: !confirmed
    });
  }

  getCurrentConfig(): ConfirmationDialogConfig | null {
    return this.currentConfig;
  }

  // Method to manually close the dialog
  closeDialog(): void {
    console.log('Closing confirmation dialog...');
    this.confirmationSubject.next(null);
    this.resultSubject.next(null);
    this.currentConfig = null;
  }

  // Async confirmation methods that handle loading states
  confirmAsync<T>(
    config: ConfirmationDialogConfig,
    asyncOperation: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.currentConfig = config;
      this.confirmationSubject.next(config);

      // Listen for result
      const subscription = this.result$.subscribe(result => {
        if (result) {
          subscription.unsubscribe();
          
          if (result.confirmed) {
            // Set loading state
            this.setDialogLoading(true);
            
            // Execute the async operation
            asyncOperation()
              .then((response) => {
                this.setDialogLoading(false);
                // Close the dialog after successful operation
                this.confirmationSubject.next(null);
                this.resultSubject.next(null);
                this.currentConfig = null;
                resolve(response);
              })
              .catch((error) => {
                this.setDialogLoading(false);
                this.setDialogError(error.message || 'An error occurred');
                // Don't close dialog on error, let user retry or cancel
                reject(error);
              });
          } else {
            // User cancelled - close the dialog
            this.confirmationSubject.next(null);
            this.resultSubject.next(null);
            this.currentConfig = null;
            reject(new Error('Operation cancelled by user'));
          }
        }
      });
    });
  }

  private setDialogLoading(loading: boolean): void {
    // This would need to be implemented with a reference to the dialog component
    // For now, we'll emit loading state changes
    this.confirmationSubject.next({
      ...this.currentConfig!,
      loading: loading
    } as any);
  }

  private setDialogError(error: string): void {
    // This would need to be implemented with a reference to the dialog component
    // For now, we'll emit error state changes
    this.confirmationSubject.next({
      ...this.currentConfig!,
      error: error
    } as any);
  }

  confirmDeleteAsync<T>(
    itemName: string,
    asyncOperation: () => Promise<T>,
    itemType: string = 'item'
  ): Promise<T> {
    return this.confirmAsync(
      {
        title: 'Delete Confirmation',
        message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
        size: 'md',
        showIcon: true,
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
      },
      asyncOperation
    );
  }

  confirmSensitiveDeleteAsync<T>(
    itemName: string,
    asyncOperation: () => Promise<T>,
    itemType: string = 'item'
  ): Promise<T> {
    return this.confirmAsync(
      {
        title: 'Delete Confirmation',
        message: `This action cannot be undone. This will permanently delete the ${itemType} and remove all associated data.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
        size: 'md',
        showIcon: true,
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
        requireTextInput: true,
        textInputLabel: `Please type "${itemName}" to confirm deletion`,
        textInputPlaceholder: `Type ${itemName} here`,
        expectedText: itemName,
        textInputError: 'The text does not match. Please type the exact name to confirm deletion.'
      },
      asyncOperation
    );
  }
}
