import { Injectable } from '@angular/core';
import {
  IBusinessUnit,
  ICustomerLocation,
  ICompany
} from '../models/attribute.model';

@Injectable({
  providedIn: 'root'
})
export class LookupService {

  private businessUnits: IBusinessUnit[] = [
    { BusinessId: 1, BusinessName: 'Engineering' },
    { BusinessId: 2, BusinessName: 'Finance' },
    { BusinessId: 3, BusinessName: 'Human Resources' },
    { BusinessId: 4, BusinessName: 'Operations' }
  ];

  private customerLocations: (ICustomerLocation & {
    BusinessId: number;
  })[] = [
    { CustomerLocationId: 1, CustomerLocationName: 'Delhi', BusinessId: 1 },
    { CustomerLocationId: 2, CustomerLocationName: 'Bengaluru', BusinessId: 1 },
    { CustomerLocationId: 3, CustomerLocationName: 'Mumbai', BusinessId: 2 },
    { CustomerLocationId: 4, CustomerLocationName: 'Pune', BusinessId: 2 },
    { CustomerLocationId: 5, CustomerLocationName: 'Hyderabad', BusinessId: 3 },
    { CustomerLocationId: 6, CustomerLocationName: 'Chennai', BusinessId: 3 },
    { CustomerLocationId: 7, CustomerLocationName: 'Gurugram', BusinessId: 4 },
    { CustomerLocationId: 8, CustomerLocationName: 'Noida', BusinessId: 4 }
  ];

  private companies: ICompany[] = [
    { CompanyId: 1, CompanyName: 'Amicus' },
    { CompanyId: 2, CompanyName: 'Contoso' },
    { CompanyId: 3, CompanyName: 'Fabrikam' }
  ];

  getBusinessUnits(): IBusinessUnit[] {
    return this.businessUnits;
  }

  getCustomerLocations(): ICustomerLocation[] {
    return this.customerLocations;
  }

  getLocationsByBusinessUnit(
    businessId: number
  ): ICustomerLocation[] {
    return this.customerLocations.filter(
      location => location.BusinessId === businessId
    );
  }

  getCompanies(): ICompany[] {
    return this.companies;
  }
}
