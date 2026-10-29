export interface IAttribute {
    AttributeId: number;
    AttributeName: string;
    BusinessUnitName: string;
    CustomerLocationName: string;
    CompanyName: string;
    IsActive: boolean;
    CreatedOn: Date;
    CreatedBy: string;
    UpdatedOn: Date|null;
    UpdatedBy: string|null;
}

export interface IBusinessUnit {
    BusinessId:number;
    BusinessName:string;
}

export interface ICustomerLocation {
    CustomerLocationId:number;
    CustomerLocationName:string;
}

export interface ICompany {
    CompanyId:number;
    CompanyName:string;
}