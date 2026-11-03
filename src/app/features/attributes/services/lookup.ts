
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, finalize } from 'rxjs';

import {
  IBusinessUnit,
  ICustomerLocation,
  ICompany
} from '../models/attribute.model';

import { BusinessUnitDTO } from '../dtos/business-unit.dto';
import { CustomerLocationDTO } from '../dtos/customer-location.dto';
import { CompanyDTO } from '../dtos/company.dto';

import { StoreService } from '../../../core/services/store';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  private http = inject(HttpClient);
  private store = inject(StoreService);

  private apiUrl = environment.apiBaseUrl;

  // Get all business units
  getBusinessUnits(): Observable<IBusinessUnit[]> {
    this.store.setLoading(true);

    return this.http.get<BusinessUnitDTO[]>(
      `${this.apiUrl}/businessUnits`
    ).pipe(
      map(dtos => dtos.map(dto => ({
        businessId: dto.business_id,
        businessName: dto.business_name
      }))),

      tap(businessUnits => {
        this.store.setLookups({
          ...this.store.getState().lookups,
          businessUnits
        });
      }),

      finalize(() => this.store.setLoading(false))
    );
  }

  // Get all customer locations
  getCustomerLocations(): Observable<
    (ICustomerLocation & { businessUnitId: number })[]
  > {
    this.store.setLoading(true);

    return this.http.get<CustomerLocationDTO[]>(
      `${this.apiUrl}/customerLocations`
    ).pipe(
      map(dtos => dtos.map(dto => ({
        customerLocationId: dto.customer_location_id,
        customerLocationName: dto.customer_location_name,
        businessUnitId: dto.business_unit_id
      }))),

      tap(customerLocations => {
        this.store.setLookups({
          ...this.store.getState().lookups,
          customerLocations
        });
      }),

      finalize(() => this.store.setLoading(false))
    );
  }

  // Get locations belonging to a selected business unit
  getLocationsByBusinessUnit(
    businessId: number
  ): Observable<ICustomerLocation[]> {
    return this.getCustomerLocations().pipe(
      map(locations =>
        locations.filter(
          location => location.businessUnitId === businessId
        )
      )
    );
  }

  // Get all companies
  getCompanies(): Observable<ICompany[]> {
    this.store.setLoading(true);

    return this.http.get<CompanyDTO[]>(
      `${this.apiUrl}/companies`
    ).pipe(
      map(dtos => dtos.map(dto => ({
        companyId: dto.company_id,
        companyName: dto.company_name
      }))),

      tap(companies => {
        this.store.setLookups({
          ...this.store.getState().lookups,
          companies
        });
      }),

      finalize(() => this.store.setLoading(false))
    );
  }
}
