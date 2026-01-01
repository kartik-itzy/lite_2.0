import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'body-lg' | 'caption' | 'overline';
export type TypographyColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'white' | 'black';
export type TypographyWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export interface TypographyConfig {
  variant?: TypographyVariant;
  color?: TypographyColor;
  weight?: TypographyWeight;
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
  noWrap?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
}

@Component({
  selector: 'app-typography',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container [ngSwitch]="variant">
      <!-- Headings -->
      <h1 *ngSwitchCase="'h1'" [class]="typographyClasses">
        <ng-content></ng-content>
      </h1>
      <h2 *ngSwitchCase="'h2'" [class]="typographyClasses">
        <ng-content></ng-content>
      </h2>
      <h3 *ngSwitchCase="'h3'" [class]="typographyClasses">
        <ng-content></ng-content>
      </h3>
      <h4 *ngSwitchCase="'h4'" [class]="typographyClasses">
        <ng-content></ng-content>
      </h4>
      <h5 *ngSwitchCase="'h5'" [class]="typographyClasses">
        <ng-content></ng-content>
      </h5>
      <h6 *ngSwitchCase="'h6'" [class]="typographyClasses">
        <ng-content></ng-content>
      </h6>
      
      <!-- Body text -->
      <p *ngSwitchCase="'body'" [class]="typographyClasses">
        <ng-content></ng-content>
      </p>
      <p *ngSwitchCase="'body-sm'" [class]="typographyClasses">
        <ng-content></ng-content>
      </p>
      <p *ngSwitchCase="'body-lg'" [class]="typographyClasses">
        <ng-content></ng-content>
      </p>
      
      <!-- Special text -->
      <span *ngSwitchCase="'caption'" [class]="typographyClasses">
        <ng-content></ng-content>
      </span>
      <span *ngSwitchCase="'overline'" [class]="typographyClasses">
        <ng-content></ng-content>
      </span>
      
      <!-- Default to span -->
      <span *ngSwitchDefault [class]="typographyClasses">
        <ng-content></ng-content>
      </span>
    </ng-container>
  `,
  styles: []
})
export class TypographyComponent {
  @Input() variant: TypographyVariant = 'body';
  @Input() color: TypographyColor = 'black';
  @Input() weight: TypographyWeight = 'normal';
  @Input() align: 'left' | 'center' | 'right' | 'justify' = 'left';
  @Input() truncate = false;
  @Input() noWrap = false;
  @Input() uppercase = false;
  @Input() lowercase = false;
  @Input() capitalize = false;

  get typographyClasses(): string {
    const baseClasses = 'font-sans';
    
    const sizeWeightClasses = {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-bold',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold',
      h5: 'text-lg font-medium',
      h6: 'text-base font-medium',
      body: 'text-base font-normal',
      'body-sm': 'text-sm font-normal',
      'body-lg': 'text-lg font-normal',
      caption: 'text-xs font-normal',
      overline: 'text-xs font-medium uppercase tracking-wider'
    };

    const weightClasses = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold'
    };

    const colorClasses = {
      primary: 'text-primary-600',
      secondary: 'text-gray-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600',
      info: 'text-blue-600',
      muted: 'text-gray-500',
      white: 'text-white',
      black: 'text-gray-900'
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify'
    };

    const transformClasses = [];
    if (this.uppercase) transformClasses.push('uppercase');
    if (this.lowercase) transformClasses.push('lowercase');
    if (this.capitalize) transformClasses.push('capitalize');

    const utilityClasses = [];
    if (this.truncate) utilityClasses.push('truncate');
    if (this.noWrap) utilityClasses.push('whitespace-nowrap');

    return [
      baseClasses,
      sizeWeightClasses[this.variant],
      weightClasses[this.weight],
      colorClasses[this.color],
      alignClasses[this.align],
      ...transformClasses,
      ...utilityClasses
    ].filter(Boolean).join(' ');
  }
} 