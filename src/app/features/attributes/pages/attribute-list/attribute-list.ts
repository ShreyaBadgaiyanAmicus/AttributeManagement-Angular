
import {
  Component,
  ChangeDetectorRef,
  DestroyRef,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';

import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  startWith,
  of,
  map
} from 'rxjs';

import { AttributeService } from '../../services/attribute';
import { IAttribute } from '../../models/attribute.model';

import {
  StoreService,
  UserRole
} from '../../../../core/services/store';

import { AuthService } from '../../../../core/services/auth';
import { AttributeCardComponent } from '../../components/attribute-card/attribute-card';

import { ActiveStatus } from '../../../../shared/directives/active-status';
import { RoleBadge } from '../../../../shared/directives/role-badge';
import { RelativeTimePipe } from '../../../../shared/pipes/relative-time-pipe';

import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

import {
  DataTable,
  TableColumn
} from '../../../../shared/components/data-table/data-table';

@Component({
  selector: 'app-attribute-list',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    AttributeCardComponent,
    ActiveStatus,
    RoleBadge,
    RelativeTimePipe,
    ConfirmDialog,
    DataTable
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attribute-list.html',
  styleUrl: './attribute-list.css'
})
export class AttributeListComponent {

  private destroyRef = inject(DestroyRef);
  private store = inject(StoreService);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Search control
  searchControl = new FormControl('', { nonNullable: true });

  // Complete attribute collection from Store
  attributes$ = this.store.attributes$;

  // Filtered collection for Card View
  cardAttributes$ = combineLatest([
    this.attributes$,
    this.searchControlValue()
  ]).pipe(
    map(([attributes, searchTerm]) => {
      const term = searchTerm.trim().toLowerCase();

      if (!term) return attributes;

      return attributes.filter(attribute =>
        attribute.attributeName.toLowerCase().includes(term) ||
        attribute.businessUnitName.toLowerCase().includes(term) ||
        attribute.customerLocationName.toLowerCase().includes(term) ||
        attribute.companyName.toLowerCase().includes(term)
      );
    })
  );

  viewMode: 'table' | 'card' = 'table';
  isSearching = false;

  successMessage = '';

  // Server-side pagination state
  pagedAttributes: IAttribute[] = [];
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  // Virtual scrolling demo data
  showMockData = false;

  private currentAttributes: IAttribute[] = [];

  tableData: IAttribute[] = [];

  private readonly mockAttributes: IAttribute[] =
    this.generateMockAttributes();

  // Server-side sorting state
  sortField = 'attribute_id';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Track table rows using their unique Attribute ID
  trackAttributeById = (
    _index: number,
    attribute: IAttribute
  ): number => attribute.attributeId;

  // Table column configuration
  columns: TableColumn[] = [
    {
      key: 'attributeId',
      label: 'ID',
      sortable: true,
      sortField: 'attribute_id'
    },
    {
      key: 'attributeName',
      label: 'Attribute Name',
      sortable: true,
      sortField: 'attribute_name'
    },
    {
      key: 'businessUnitName',
      label: 'Business Unit',
      sortable: true,
      sortField: 'business_unit_name'
    },
    {
      key: 'customerLocationName',
      label: 'Location',
      sortable: true,
      sortField: 'customer_location_name'
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
      sortField: 'company_name'
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      sortField: 'is_active'
    },
    {
      key: 'createdBy',
      label: 'Created By',
      sortable: true,
      sortField: 'created_by'
    },
    {
      key: 'createdOn',
      label: 'Created On',
      sortable: true,
      sortField: 'created_on'
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false
    }
  ];

  // Confirmation dialog state
  showConfirmDialog = false;
  pendingDeleteAttribute: IAttribute | null = null;

  // Check whether current user is Admin
  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  // Logged-in username
  get username(): string {
    return this.authService.username ?? 'User';
  }

  // Logged-in user's role
  get role(): UserRole | null {
    return this.authService.role;
  }

  constructor(
    private attributeService: AttributeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    // Keep the table collection synchronized with Store
    this.attributes$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(attributes => {
        this.currentAttributes = attributes;
        this.updateTableData();
      });

    this.loadAllAttributes();
    this.setupSearch();
  }

  // Search control observable for Card View
  private searchControlValue() {
    return this.searchControl.valueChanges.pipe(
      startWith(this.searchControl.value)
    );
  }

  // Generate 200 mock attributes for virtual scrolling demonstration
  private generateMockAttributes(): IAttribute[] {
    const businessUnits = [
      'Administration',
      'Sales',
      'Technology'
    ];

    const locations = [
      'Mumbai',
      'Chennai',
      'Pune'
    ];

    const companies = [
      'Amicus',
      'GlobalWorks',
      'TechNova'
    ];

    return Array.from({ length: 200 }, (_, index) => {
      const id = 1001 + index;

      return {
        attributeId: id,
        attributeName: `Mock Attribute ${index + 1}`,

        businessUnitId: (index % 3) + 1,
        businessUnitName: businessUnits[index % 3],

        customerLocationId: (index % 3) + 1,
        customerLocationName: locations[index % 3],

        companyId: (index % 3) + 1,
        companyName: companies[index % 3],

        isActive: index % 2 === 0,

        createdOn: new Date(
          Date.now() - index * 24 * 60 * 60 * 1000
        ),

        createdBy: 'Mock User',

        updatedOn: null,
        updatedBy: null
      };
    });
  }

  // Update the collection displayed in Table View
  private updateTableData(): void {
    if (this.showMockData) {
      this.tableData = [
        ...this.currentAttributes,
        ...this.mockAttributes
      ];
    } else if (this.currentAttributes.length > 50) {
      this.tableData = this.currentAttributes;
    } else {
      this.tableData = this.pagedAttributes;
    }

    this.cdr.markForCheck();
  }

  // Switch between API data and mock data
  toggleMockData(): void {
    this.showMockData = !this.showMockData;
    this.updateTableData();
  }

  // Load complete collection into Store
  loadAllAttributes(): void {
    this.attributeService.getAttributes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: error => {
          console.error('Failed to load all attributes:', error);

          this.toastService.showError(
            'Unable to load attributes. Please try again.'
          );
        }
      });
  }

  // Search and load the first API page
  setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      startWith(''),

      tap(() => {
        this.isSearching = true;
        this.currentPage = 1;
        this.cdr.markForCheck();
      }),

      debounceTime(300),
      distinctUntilChanged(),

      switchMap(searchTerm =>
        this.attributeService.getPagedAttributes(
          this.currentPage,
          this.pageSize,
          this.sortField,
          this.sortDirection,
          searchTerm
        ).pipe(
          catchError(error => {
            console.error('Failed to load attributes:', error);

            this.toastService.showError(
              'Unable to load attributes. Please try again.'
            );

            return of({
              items: [],
              totalRecords: 0
            });
          })
        )
      ),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe(result => {
      this.pagedAttributes = result.items;
      this.totalRecords = result.totalRecords;

      if (!this.showMockData && this.currentAttributes.length <= 50) {
        this.tableData = this.pagedAttributes;
      }

      this.isSearching = false;
      this.cdr.markForCheck();
    });
  }

  // Load a requested page from the API
  loadPagedAttributes(): void {
    this.isSearching = true;
    this.cdr.markForCheck();

    this.attributeService.getPagedAttributes(
      this.currentPage,
      this.pageSize,
      this.sortField,
      this.sortDirection,
      this.searchControl.value
    ).pipe(
      catchError(error => {
        console.error('Failed to load attributes:', error);

        this.toastService.showError(
          'Unable to load attributes. Please try again.'
        );

        return of({
          items: [],
          totalRecords: 0
        });
      }),

      takeUntilDestroyed(this.destroyRef)

    ).subscribe(result => {
      this.pagedAttributes = result.items;
      this.totalRecords = result.totalRecords;

      if (!this.showMockData && this.currentAttributes.length <= 50) {
        this.tableData = this.pagedAttributes;
      }

      this.isSearching = false;
      this.cdr.markForCheck();
    });
  }

  // Refresh complete collection and current table page
  refreshAttributes(): void {
    this.loadAllAttributes();
    this.loadPagedAttributes();
  }

  // Handle sorting from DataTable
  onSortChange(event: {
    field: string;
    direction: 'asc' | 'desc';
  }): void {
    this.sortField = event.field;
    this.sortDirection = event.direction;
    this.currentPage = 1;

    this.loadPagedAttributes();
  }

  // Handle pagination from DataTable
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPagedAttributes();
  }

  // Switch between table and card views
  setView(mode: 'table' | 'card'): void {
    this.viewMode = mode;
  }

  // Navigate to Add Attribute
  openAddAttribute(): void {
    this.successMessage = '';
    this.router.navigate(['/attributes/add']);
  }

  // Navigate to Edit Attribute
  openEditAttribute(attribute: IAttribute): void {
    if (!this.isAdmin) return;

    this.successMessage = '';

    this.router.navigate([
      '/attributes',
      attribute.attributeId,
      'edit'
    ]);
  }

  // Open confirmation dialog (Admin only)
  requestDelete(attribute: IAttribute): void {
    if (!this.isAdmin) return;

    this.pendingDeleteAttribute = attribute;
    this.showConfirmDialog = true;
  }

  // Delete attribute after confirmation
  confirmDelete(): void {
    if (!this.isAdmin || !this.pendingDeleteAttribute) return;

    const attributeId = this.pendingDeleteAttribute.attributeId;

    this.closeConfirmDialog();

    this.attributeService
      .deleteAttribute(attributeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            'Attribute deleted successfully.'
          );

          this.loadAllAttributes();
          this.loadPagedAttributes();
        },
        error: error => {
          console.error('Failed to delete attribute:', error);

          this.toastService.showError(
            'Unable to delete attribute. Please try again.'
          );
        }
      });
  }

  // Cancel deletion
  cancelDelete(): void {
    this.closeConfirmDialog();
  }

  // Reset confirmation dialog state
  private closeConfirmDialog(): void {
    this.showConfirmDialog = false;
    this.pendingDeleteAttribute = null;
  }

  // Logout current user
  logout(): void {
    this.authService.logout();

    this.toastService.showSuccess(
      'Logged out successfully.'
    );

    this.router.navigate(['/login']);
  }
}
