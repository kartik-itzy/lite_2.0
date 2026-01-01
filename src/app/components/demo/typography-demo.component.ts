import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypographyComponent } from '../ui/typography/typography.component';

@Component({
  selector: 'app-typography-demo',
  standalone: true,
  imports: [CommonModule, TypographyComponent],
  template: `
    <div class="p-8 space-y-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Typography Component Demo</h1>
        <p class="text-gray-600">Showcasing different typography variants and styles</p>
      </div>

      <!-- Headings -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Headings</h2>
        <div class="space-y-2">
          <app-typography variant="h1">Heading 1 - Main Title</app-typography>
          <app-typography variant="h2">Heading 2 - Section Title</app-typography>
          <app-typography variant="h3">Heading 3 - Subsection Title</app-typography>
          <app-typography variant="h4">Heading 4 - Card Title</app-typography>
          <app-typography variant="h5">Heading 5 - Small Title</app-typography>
          <app-typography variant="h6">Heading 6 - Tiny Title</app-typography>
        </div>
      </div>

      <!-- Body Text -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Body Text</h2>
        <div class="space-y-2">
          <app-typography variant="body-lg">Large body text for important content</app-typography>
          <app-typography variant="body">Regular body text for normal content</app-typography>
          <app-typography variant="body-sm">Small body text for secondary content</app-typography>
        </div>
      </div>

      <!-- Colors -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Colors</h2>
        <div class="space-y-2">
          <app-typography variant="body" color="primary">Primary color text</app-typography>
          <app-typography variant="body" color="secondary">Secondary color text</app-typography>
          <app-typography variant="body" color="success">Success color text</app-typography>
          <app-typography variant="body" color="warning">Warning color text</app-typography>
          <app-typography variant="body" color="danger">Danger color text</app-typography>
          <app-typography variant="body" color="muted">Muted color text</app-typography>
        </div>
      </div>

      <!-- Weights -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Font Weights</h2>
        <div class="space-y-2">
          <app-typography variant="body" weight="light">Light weight text</app-typography>
          <app-typography variant="body" weight="normal">Normal weight text</app-typography>
          <app-typography variant="body" weight="medium">Medium weight text</app-typography>
          <app-typography variant="body" weight="semibold">Semibold weight text</app-typography>
          <app-typography variant="body" weight="bold">Bold weight text</app-typography>
          <app-typography variant="body" weight="extrabold">Extrabold weight text</app-typography>
        </div>
      </div>

      <!-- Alignment -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Text Alignment</h2>
        <div class="space-y-2">
          <app-typography variant="body" align="left">Left aligned text</app-typography>
          <app-typography variant="body" align="center">Center aligned text</app-typography>
          <app-typography variant="body" align="right">Right aligned text</app-typography>
          <app-typography variant="body" align="justify">Justified text with longer content to demonstrate the justification effect on multiple lines of text.</app-typography>
        </div>
      </div>

      <!-- Text Transforms -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Text Transforms</h2>
        <div class="space-y-2">
          <app-typography variant="body" [uppercase]="true">Uppercase text</app-typography>
          <app-typography variant="body" [lowercase]="true">LOWERCASE TEXT</app-typography>
          <app-typography variant="body" [capitalize]="true">capitalized text</app-typography>
        </div>
      </div>

      <!-- Special Variants -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Special Variants</h2>
        <div class="space-y-2">
          <app-typography variant="caption">Caption text for small details</app-typography>
          <app-typography variant="overline">Overline text for labels</app-typography>
        </div>
      </div>

      <!-- Utility Classes -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Utility Classes</h2>
        <div class="space-y-2">
          <app-typography variant="body" [truncate]="true">This is a very long text that will be truncated with ellipsis when it exceeds the container width</app-typography>
          <app-typography variant="body" [noWrap]="true">This text will not wrap to multiple lines</app-typography>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TypographyDemoComponent {} 