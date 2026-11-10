
import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef
} from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  sortField?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css'
})
export class DataTable<T extends object = Record<string, unknown>> {

  @Input() columns: TableColumn[] = [];
  @Input() data: T[] = [];

  @Input() cellTemplates: Record<
    string,
    TemplateRef<{ $implicit: T }>
  > = {};

  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalRecords = 0;

  @Input() sortField = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Output() sortChange = new EventEmitter<{
    field: string;
    direction: 'asc' | 'desc';
  }>();

  @Output() pageChange = new EventEmitter<number>();

  getCellValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    const field = column.sortField ?? column.key;

    const direction =
      this.sortField === field && this.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    this.sortChange.emit({
      field,
      direction
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.pageChange.emit(page);
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }
}
