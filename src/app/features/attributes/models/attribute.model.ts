export interface IAttribute {
  attributeId: number;
  attributeName: string;
  businessUnitId: number;
  customerLocationId: number;
  companyId: number;
  businessUnitName: string;
  customerLocationName: string;
  companyName: string;
  isActive: boolean;
  createdOn: Date;
  createdBy: string;
  updatedOn: Date | null;
  updatedBy: string | null;
}

export interface IBusinessUnit {
  businessId: number;
  businessName: string;
}

export interface ICustomerLocation {
  customerLocationId: number;
  customerLocationName: string;
}

export interface ICompany {
  companyId: number;
  companyName: string;
}
