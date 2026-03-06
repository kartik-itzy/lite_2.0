import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ExportColumn {
  /** Must match the key in your data rows */
  key: string;
  /** Header label shown in the Excel sheet */
  label: string;
}

export interface ExportConfig {
  /** Excel file name (without .xlsx) */
  fileName?: string;
  /** Sheet name inside the workbook */
  sheetName?: string;
  /** Button label */
  buttonLabel?: string;
  /** Button variant styling: 'primary' | 'secondary' | 'outline' */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Button size: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** Show icon next to label */
  showIcon?: boolean;
}

@Component({
  selector: 'app-export-excel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      [class]="getButtonClasses()"
      [disabled]="isExporting || !data || data.length === 0"
      (click)="exportToExcel()"
      [title]="!data || data.length === 0 ? 'No data to export' : 'Export to Excel'"
    >
      <!-- Spinner while exporting -->
      <svg
        *ngIf="isExporting"
        class="animate-spin h-4 w-4 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>

      <!-- Excel / download icon when idle -->
      <svg
        *ngIf="!isExporting && resolvedConfig.showIcon !== false"
        class="h-4 w-4 shrink-0"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 10v6m0 0-3-3m3 3 3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>

      <span>{{ isExporting ? 'Exporting...' : resolvedConfig.buttonLabel }}</span>
    </button>
  `,
  styles: [],
})
export class ExportExcelComponent {
  /** Data rows to export — same array you pass to app-table */
  @Input() data: any[] = [];

  /**
   * Column definitions. If omitted all keys from the first row are used.
   * Providing this lets you control order, labels, and which keys to include.
   */
  @Input() columns: ExportColumn[] = [];

  /** Optional configuration */
  @Input() config: ExportConfig = {};

  isExporting = false;

  get resolvedConfig(): Required<ExportConfig> {
    return {
      fileName: this.config.fileName ?? 'export',
      sheetName: this.config.sheetName ?? 'Sheet1',
      buttonLabel: this.config.buttonLabel ?? 'Export to Excel',
      variant: this.config.variant ?? 'outline',
      size: this.config.size ?? 'sm',
      showIcon: this.config.showIcon ?? true,
    };
  }

  // ─── Styling ─────────────────────────────────────────────────────────────────

  getButtonClasses(): string {
    const base = `
      inline-flex items-center gap-2 font-medium rounded-lg
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-offset-1
    `;

    const sizeMap: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };

    const variantMap: Record<string, string> = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent',
      secondary:
        'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-transparent',
      outline:
        'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-300',
    };

    const size = sizeMap[this.resolvedConfig.size] ?? sizeMap['sm'];
    const variant = variantMap[this.resolvedConfig.variant] ?? variantMap['outline'];

    return `${base} ${size} ${variant}`.replace(/\s+/g, ' ').trim();
  }

  // ─── Export logic ─────────────────────────────────────────────────────────────

  exportToExcel(): void {
    if (!this.data || this.data.length === 0 || this.isExporting) return;

    this.isExporting = true;

    // Defer to next tick so the spinner renders before the (potentially heavy) work
    setTimeout(() => {
      try {
        const cols = this.resolveColumns();
        const csvContent = this.buildCsv(cols);
        this.downloadFile(csvContent);
      } finally {
        this.isExporting = false;
      }
    }, 50);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private resolveColumns(): ExportColumn[] {
    if (this.columns && this.columns.length > 0) {
      return this.columns;
    }
    // Auto-derive from first row, exclude common non-data keys
    const exclude = new Set(['actions', 'imagepath', 'image']);
    return Object.keys(this.data[0] || {})
      .filter(k => !exclude.has(k))
      .map(k => ({ key: k, label: k }));
  }

  /**
   * Builds a UTF-8 CSV string.
   * We use CSV because it opens natively in Excel on all platforms
   * without any third-party library dependency.
   */
  private buildCsv(cols: ExportColumn[]): string {
    const escape = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Wrap in quotes if value contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const header = cols.map(c => escape(c.label)).join(',');
    const rows = this.data.map(row =>
      cols.map(c => escape(row[c.key])).join(',')
    );

    return [header, ...rows].join('\r\n');
  }

  private downloadFile(csvContent: string): void {
    // BOM ensures Excel opens the file with correct UTF-8 encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.resolvedConfig.fileName}.csv`;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}