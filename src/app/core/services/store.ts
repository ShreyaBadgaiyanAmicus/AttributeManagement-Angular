
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

import {
  IAttribute,
  IBusinessUnit,
  ICustomerLocation,
  ICompany
} from '../../features/attributes/models/attribute.model';

export interface AppState {
  attributes: IAttribute[];

  lookups: {
    businessUnits: IBusinessUnit[];
    customerLocations: (ICustomerLocation & {
      businessUnitId: number;
    })[];
    companies: ICompany[];
  };

  isLoading: boolean;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private initialState: AppState = {
    attributes: [],

    lookups: {
      businessUnits: [],
      customerLocations: [],
      companies: []
    },

    isLoading: false,
    isAuthenticated: false
  };

  private stateSubject = new BehaviorSubject<AppState>(
    this.initialState
  );

  // Expose the complete application state
  state$ = this.stateSubject.asObservable();

  // Expose individual state slices
  attributes$ = this.state$.pipe(
    map(state => state.attributes)
  );

  lookups$ = this.state$.pipe(
    map(state => state.lookups)
  );

  isLoading$ = this.state$.pipe(
    map(state => state.isLoading)
  );

  isAuthenticated$ = this.state$.pipe(
    map(state => state.isAuthenticated)
  );

  // Get the current state
  getState(): AppState {
    return this.stateSubject.value;
  }

  // Update the complete state
  private updateState(newState: AppState): void {
    this.stateSubject.next(newState);
  }

  // Update attributes immutably
  setAttributes(attributes: IAttribute[]): void {
    this.updateState({
      ...this.getState(),
      attributes: [...attributes]
    });
  }

  // Add an attribute
  addAttribute(attribute: IAttribute): void {
    this.updateState({
      ...this.getState(),
      attributes: [
        ...this.getState().attributes,
        attribute
      ]
    });
  }

  // Update an existing attribute
  updateAttribute(attribute: IAttribute): void {
    this.updateState({
      ...this.getState(),
      attributes: this.getState().attributes.map(item =>
        item.attributeId === attribute.attributeId
          ? attribute
          : item
      )
    });
  }

  // Remove an attribute
  removeAttribute(id: number): void {
    this.updateState({
      ...this.getState(),
      attributes: this.getState().attributes.filter(
        item => item.attributeId !== id
      )
    });
  }

  // Update lookup data
  setLookups(lookups: AppState['lookups']): void {
    this.updateState({
      ...this.getState(),
      lookups: {
        ...lookups,
        businessUnits: [...lookups.businessUnits],
        customerLocations: [...lookups.customerLocations],
        companies: [...lookups.companies]
      }
    });
  }

  // Update loading status
  setLoading(isLoading: boolean): void {
    this.updateState({
      ...this.getState(),
      isLoading
    });
  }

  // Update authentication status
  setAuthenticated(isAuthenticated: boolean): void {
    this.updateState({
      ...this.getState(),
      isAuthenticated
    });
  }
}
