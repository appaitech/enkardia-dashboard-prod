
export interface ClientFieldDefinition {
  id: string;
  client_business_id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  created_at: string;
  updated_at: string;
}

export interface ClientFieldValue {
  id: string;
  client_business_id: string;
  field_definition_id: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  definition: ClientFieldDefinition;
  value: string | null;
}

export interface NewClientFieldDefinition {
  name: string;
  field_type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  client_business_id: string;
}

export interface ClientFieldValueUpdate {
  field_definition_id: string;
  value: string | null;
}
