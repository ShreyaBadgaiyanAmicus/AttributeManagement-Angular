
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, map, tap } from 'rxjs';

import { IAttribute } from '../models/attribute.model';
import { AttributeDTO } from '../dtos/attribute.dto';

import { MappingService } from './mapping';
import { StoreService } from '../../../core/services/store';
import { ActivityLogService } from '../../../core/services/activity-log';

import { environment } from '../../../../environments/environment';

export interface PagedAttributes {
  items: IAttribute[];
  totalRecords: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  private http = inject(HttpClient);
  private mappingService = inject(MappingService);
  private store = inject(StoreService);
  private activityLog = inject(ActivityLogService);

  private apiUrl = `${environment.apiBaseUrl}/attributes`;

  // GET: Fetch all attributes
  getAttributes(): Observable<IAttribute[]> {
    return this.http.get<AttributeDTO[]>(this.apiUrl).pipe(
      map(dtos =>
        dtos.map(dto => this.mappingService.toAttribute(dto))
      ),
      tap(attributes => {
        this.store.setAttributes(attributes);
      })
    );
  }

  // GET: Fetch paginated and sorted attributes from the API
  getPagedAttributes(
    page: number,
    pageSize: number,
    sortField: string,
    sortDirection: 'asc' | 'desc',
    searchTerm = ''
  ): Observable<PagedAttributes> {

    let params = new HttpParams()
      .set('_page', page)
      .set('_limit', pageSize)
      .set('_sort', sortField)
      .set('_order', sortDirection);

    if (searchTerm.trim()) {
      params = params.set('q', searchTerm.trim());
    }

    return this.http.get<AttributeDTO[]>(this.apiUrl, {
      params,
      observe: 'response'
    }).pipe(
      map(response => ({
        items: (response.body ?? []).map(dto =>
          this.mappingService.toAttribute(dto)
        ),
        totalRecords: Number(response.headers.get('X-Total-Count') ?? 0)
      }))
    );
  }

  // GET: Fetch attribute by ID
  getAttributeById(id: number): Observable<IAttribute> {
    return this.http.get<AttributeDTO>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.mappingService.toAttribute(dto))
    );
  }

  // GET: Search attributes
  searchAttributes(searchTerm: string): Observable<IAttribute[]> {
    return this.http.get<AttributeDTO[]>(this.apiUrl, {
      params: { q: searchTerm }
    }).pipe(
      map(dtos =>
        dtos.map(dto => this.mappingService.toAttribute(dto))
      ),
      tap(attributes => {
        this.store.setAttributes(attributes);
      })
    );
  }

  // POST: Add attribute
  addAttribute(attribute: IAttribute): Observable<IAttribute> {
    const dto = this.mappingService.toDTO(attribute);

    return this.http.post<AttributeDTO>(this.apiUrl, dto).pipe(
      map(response =>
        this.mappingService.toAttribute(response)
      ),
      tap(savedAttribute => {
        this.store.addAttribute(savedAttribute);

        this.activityLog.logActivity('create', {
          attributeId: savedAttribute.attributeId,
          attributeName: savedAttribute.attributeName
        });
      })
    );
  }

  // PUT: Update attribute
  updateAttribute(
    id: number,
    attribute: IAttribute
  ): Observable<IAttribute> {
    const dto = this.mappingService.toDTO(attribute);

    return this.http.put<AttributeDTO>(
      `${this.apiUrl}/${id}`,
      dto
    ).pipe(
      map(response =>
        this.mappingService.toAttribute(response)
      ),
      tap(savedAttribute => {
        this.store.updateAttribute(savedAttribute);

        this.activityLog.logActivity('edit', {
          attributeId: savedAttribute.attributeId,
          attributeName: savedAttribute.attributeName
        });
      })
    );
  }

  // DELETE: Remove attribute
  deleteAttribute(id: number): Observable<void> {
    const attribute = this.store.getState().attributes.find(
      item => item.attributeId === id
    );

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.store.removeAttribute(id);

        this.activityLog.logActivity('delete', {
          attributeId: id,
          attributeName: attribute?.attributeName ?? 'Unknown Attribute'
        });
      })
    );
  }
}
