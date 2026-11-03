
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { IAttribute } from '../models/attribute.model';
import { MappingService } from './mapping';
import { environment } from '../../../../environments/environment';
import { AttributeDTO } from '../dtos/attribute.dto';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  private http = inject(HttpClient);
  private mappingService = inject(MappingService);

  private apiUrl = `${environment.apiBaseUrl}/attributes`;

  // Get all attributes
  getAttributes(): Observable<IAttribute[]> {
    return this.http.get<AttributeDTO[]>(this.apiUrl).pipe(
      map(dtos => dtos.map(dto => this.mappingService.toAttribute(dto)))
    );
  }

  // Get attribute by ID
  getAttributeById(id: number): Observable<IAttribute> {
    return this.http.get<AttributeDTO>(`${this.apiUrl}/${id}`).pipe(
      map(dto => this.mappingService.toAttribute(dto))
    );
  }

  // Add an attribute
  addAttribute(attribute: IAttribute): Observable<IAttribute> {
    const dto = this.mappingService.toDTO(attribute);

    return this.http.post<AttributeDTO>(this.apiUrl, dto).pipe(
      map(response => this.mappingService.toAttribute(response))
    );
  }

  // Update an attribute
  updateAttribute(
    id: number,
    attribute: IAttribute
  ): Observable<IAttribute> {
    const dto = this.mappingService.toDTO(attribute);

    return this.http.put<AttributeDTO>(
      `${this.apiUrl}/${id}`,
      dto
    ).pipe(
      map(response => this.mappingService.toAttribute(response))
    );
  }

  // Delete an attribute
  deleteAttribute(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchAttributes(searchTerm: string): Observable<IAttribute[]> {
  return this.http.get<AttributeDTO[]>(this.apiUrl, {
    params: { q: searchTerm }
  }).pipe(
    map(dtos => dtos.map(dto => this.mappingService.toAttribute(dto)))
  );
}
}
