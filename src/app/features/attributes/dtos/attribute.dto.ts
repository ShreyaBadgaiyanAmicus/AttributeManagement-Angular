
export interface AttributeDTO {
  attribute_id: number;
  attribute_name: string;
  business_unit_id: number;
  customer_location_id: number;
  company_id: number;
  business_unit_name: string;
  customer_location_name: string;
  company_name: string;
  is_active: boolean;
  created_on: string;
  created_by: string;
  updated_on: string | null;
  updated_by: string | null;
}
