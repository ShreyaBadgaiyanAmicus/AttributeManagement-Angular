
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, map, tap } from 'rxjs';

import { IAttribute } from '../models/attribute.model';
import { AttributeDTO } from '../dtos/attribute.dto';

import { MappingService } from './mapping';
import { StoreService } from '../../../core/services/store';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  private http = inject(HttpClient);
  private mappingService = inject(MappingService);
  private store = inject(StoreService);

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
      })
    );
  }

  // DELETE: Remove attribute
  deleteAttribute(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.store.removeAttribute(id);
      })
    );
  }
}
