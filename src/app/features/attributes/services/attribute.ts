import { Injectable } from '@angular/core';
import { IAttribute } from '../models/attribute.model';

@Injectable({
  providedIn: 'root'
})
export class AttributeService {

  private attributes: IAttribute[] = [
    {
      AttributeId: 1,
      AttributeName: 'Employee Code',
      BusinessUnitName: 'Human Resources',
      CustomerLocationName: 'Mumbai',
      CompanyName: 'Amicus',
      IsActive: true,
      CreatedOn: new Date('2026-01-10'),
      CreatedBy: 'Shreya',
      UpdatedOn: null,
      UpdatedBy: null
    },
    {
      AttributeId: 2,
      AttributeName: 'Cost Center',
      BusinessUnitName: 'Finance',
      CustomerLocationName: 'Pune',
      CompanyName: 'Amicus',
      IsActive: true,
      CreatedOn: new Date('2026-02-15'),
      CreatedBy: 'Rahul',
      UpdatedOn: new Date('2026-03-01'),
      UpdatedBy: 'Priya'
    },
    {
      AttributeId: 3,
      AttributeName: 'Project Code',
      BusinessUnitName: 'Technology',
      CustomerLocationName: 'Bengaluru',
      CompanyName: 'TechNova',
      IsActive: false,
      CreatedOn: new Date('2026-03-05'),
      CreatedBy: 'Amit',
      UpdatedOn: null,
      UpdatedBy: null
    },
    {
      AttributeId: 4,
      AttributeName: 'Department',
      BusinessUnitName: 'Human Resources',
      CustomerLocationName: 'Delhi',
      CompanyName: 'TechNova',
      IsActive: true,
      CreatedOn: new Date('2026-04-12'),
      CreatedBy: 'Priya',
      UpdatedOn: new Date('2026-05-02'),
      UpdatedBy: 'Shreya'
    },
    {
      AttributeId: 5,
      AttributeName: 'Vendor Number',
      BusinessUnitName: 'Procurement',
      CustomerLocationName: 'Hyderabad',
      CompanyName: 'GlobalWorks',
      IsActive: false,
      CreatedOn: new Date('2026-05-08'),
      CreatedBy: 'Neha',
      UpdatedOn: new Date('2026-06-10'),
      UpdatedBy: 'Rahul'
    },
    {
      AttributeId: 6,
      AttributeName: 'Office Location',
      BusinessUnitName: 'Administration',
      CustomerLocationName: 'Mumbai',
      CompanyName: 'GlobalWorks',
      IsActive: true,
      CreatedOn: new Date('2026-06-18'),
      CreatedBy: 'Vikram',
      UpdatedOn: null,
      UpdatedBy: null
    },
    {
      AttributeId: 7,
      AttributeName: 'Client Reference',
      BusinessUnitName: 'Sales',
      CustomerLocationName: 'Chennai',
      CompanyName: 'Amicus',
      IsActive: false,
      CreatedOn: new Date('2026-07-04'),
      CreatedBy: 'Ananya',
      UpdatedOn: null,
      UpdatedBy: null
    },
    {
      AttributeId: 8,
      AttributeName: 'Asset Tag',
      BusinessUnitName: 'Technology',
      CustomerLocationName: 'Pune',
      CompanyName: 'TechNova',
      IsActive: true,
      CreatedOn: new Date('2026-08-20'),
      CreatedBy: 'Rahul',
      UpdatedOn: new Date('2026-09-01'),
      UpdatedBy: 'Neha'
    }
  ];

  getAttributes(): IAttribute[] {
    return this.attributes;
  }


}
