
import { Injectable } from '@angular/core';
import { IAttribute, } from '../models/attribute.model';
import { AttributeDTO } from '../dtos/attribute.dto';

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  toAttribute(dto: AttributeDTO): IAttribute {
    return {
      attributeId: dto.attribute_id,
      attributeName: dto.attribute_name,
      businessUnitId: dto.business_unit_id,
      customerLocationId: dto.customer_location_id,
      companyId: dto.company_id,
      businessUnitName: dto.business_unit_name,
      customerLocationName: dto.customer_location_name,
      companyName: dto.company_name,
      isActive: dto.is_active,
      createdOn: new Date(dto.created_on),
      createdBy: dto.created_by,
      updatedOn: dto.updated_on ? new Date(dto.updated_on) : null,
      updatedBy: dto.updated_by
    };
  }

  toDTO(attribute: IAttribute): AttributeDTO {
    return {
      attribute_id: attribute.attributeId,
      attribute_name: attribute.attributeName,
      business_unit_id: attribute.businessUnitId,
      customer_location_id: attribute.customerLocationId,
      company_id: attribute.companyId,
      business_unit_name: attribute.businessUnitName,
      customer_location_name: attribute.customerLocationName,
      company_name: attribute.companyName,
      is_active: attribute.isActive,
      created_on: attribute.createdOn.toISOString(),
      created_by: attribute.createdBy,
      updated_on: attribute.updatedOn
        ? attribute.updatedOn.toISOString()
        : null,
      updated_by: attribute.updatedBy
    };
  }
}
