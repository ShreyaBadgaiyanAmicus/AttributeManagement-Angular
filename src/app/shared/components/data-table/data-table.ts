
import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ChangeDetectionStrategy,
  TrackByFunction
} from '@angular/core';

import { NgTemplateOutlet } from '@angular/common';

import { ScrollingModule } from '@angular/cdk/scrolling';

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  sortField?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    ScrollingModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  // Allows the parent to provide a stable identity for each row.
  @Input() trackByFn: TrackByFunction<T> =
    (_index, item) => item;

  // Enable virtual scrolling when the collection exceeds 50 records.
  get useVirtualScroll(): boolean {
    return this.data.length > 50;
  }

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
