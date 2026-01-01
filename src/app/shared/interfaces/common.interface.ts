export type Size = 'sm' | 'md' | 'lg' | 'xl';

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark';

export type Position = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type Alignment = 'start' | 'center' | 'end' | 'justify' | 'between' | 'around' | 'evenly';

export type State = 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading' | 'error' | 'success';

export interface BaseComponent {
  id?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export interface ClickableComponent extends BaseComponent {
  onClick?: (event: Event) => void;
  onFocus?: (event: Event) => void;
  onBlur?: (event: Event) => void;
}

export interface FormControl extends BaseComponent {
  value?: any;
  required?: boolean;
  readonly?: boolean;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
}

export interface IconConfig {
  name?: string;
  path?: string;
  size?: Size;
  color?: ColorVariant;
  position?: 'left' | 'right';
}

export interface EventEmitter<T = any> {
  emit: (value: T) => void;
  subscribe: (fn: (value: T) => void) => void;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
  status?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Filter {
  field: string;
  value: any;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'notIn';
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  disabled?: boolean;
  divider?: boolean;
}

export interface Notification {
  id: string;
  type: ColorVariant;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: ColorVariant;
}

export interface Modal {
  id: string;
  title?: string;
  content: any;
  size?: Size;
  closable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
}

export interface Tooltip {
  content: string;
  position?: Position;
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  maxWidth?: string;
}

export interface BreadcrumbItem {
  label: string;
  url?: string;
  active?: boolean;
  icon?: string;
}

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  content: any;
}

export interface AccordionItem {
  id: string;
  title: string;
  content: any;
  icon?: string;
  disabled?: boolean;
  expanded?: boolean;
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  icon?: string;
  group?: string;
}

export interface TreeNode {
  id: string;
  label: string;
  icon?: string;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean | string;
}

export interface FormField extends FormControl {
  type: string;
  validation?: ValidationRule[];
  options?: SelectOption[];
  multiple?: boolean;
  accept?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  cols?: number;
}

export interface Form {
  id: string;
  title?: string;
  fields: FormField[];
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
} 