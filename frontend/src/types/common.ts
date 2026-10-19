export type StatusTone = 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'slate';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface FilterOptions {
  search?: string;
  clientId?: string;
  status?: string;
  category?: string;
  severity?: string;
  dateRange?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
