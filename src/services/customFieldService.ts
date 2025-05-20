
import { supabase } from "@/integrations/supabase/client";
import { 
  ClientFieldDefinition, 
  NewClientFieldDefinition, 
  ClientFieldValue, 
  ClientFieldValueUpdate,
  CustomField
} from "@/types/customField";

// Field Definition functions
export async function getFieldDefinitions(): Promise<ClientFieldDefinition[]> {
  const { data, error } = await supabase
    .from('client_field_definitions')
    .select('*')
    .order('name');
  
  if (error) {
    console.error("Error fetching field definitions:", error);
    throw error;
  }
  
  return data.map(item => ({
    id: item.id,
    name: item.name,
    field_type: item.field_type,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));
}

export async function createFieldDefinition(fieldDef: NewClientFieldDefinition): Promise<ClientFieldDefinition> {
  const { data, error } = await supabase
    .from('client_field_definitions')
    .insert({
      name: fieldDef.name,
      field_type: fieldDef.field_type,
    })
    .select('*')
    .single();
  
  if (error) {
    console.error("Error creating field definition:", error);
    throw error;
  }
  
  return {
    id: data.id,
    name: data.name,
    field_type: data.field_type,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export async function deleteFieldDefinition(id: string): Promise<void> {
  const { error } = await supabase
    .from('client_field_definitions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting field definition:", error);
    throw error;
  }
}

// Field Value functions
export async function getClientFieldValues(clientId: string): Promise<CustomField[]> {
  // First get all field definitions
  const definitions = await getFieldDefinitions();
  
  // Get existing values for this client
  const { data: values, error } = await supabase
    .from('client_field_values')
    .select('*')
    .eq('client_business_id', clientId);
  
  if (error) {
    console.error("Error fetching client field values:", error);
    throw error;
  }
  
  // Create a map for quick lookup of values by definition ID
  const valueMap = new Map();
  values?.forEach(value => {
    valueMap.set(value.field_definition_id, value.value);
  });
  
  // Return all definitions with their values (or null if not set)
  return definitions.map(definition => ({
    definition,
    value: valueMap.get(definition.id) || null
  }));
}

export async function setClientFieldValue(
  clientId: string,
  fieldDefId: string,
  value: string | null
): Promise<ClientFieldValue> {
  // First, check if a value already exists
  const { data: existingValue } = await supabase
    .from('client_field_values')
    .select('*')
    .eq('client_business_id', clientId)
    .eq('field_definition_id', fieldDefId)
    .maybeSingle();
  
  let result;
  
  if (existingValue) {
    // Update existing value
    const { data, error } = await supabase
      .from('client_field_values')
      .update({ value })
      .eq('id', existingValue.id)
      .select('*')
      .single();
    
    if (error) {
      console.error("Error updating field value:", error);
      throw error;
    }
    
    result = data;
  } else {
    // Insert new value
    const { data, error } = await supabase
      .from('client_field_values')
      .insert({
        client_business_id: clientId,
        field_definition_id: fieldDefId,
        value
      })
      .select('*')
      .single();
    
    if (error) {
      console.error("Error creating field value:", error);
      throw error;
    }
    
    result = data;
  }
  
  return {
    id: result.id,
    client_business_id: result.client_business_id,
    field_definition_id: result.field_definition_id,
    value: result.value,
    created_at: result.created_at,
    updated_at: result.updated_at
  };
}

export async function updateClientFieldValues(
  clientId: string,
  updates: ClientFieldValueUpdate[]
): Promise<void> {
  // Process each update one by one
  for (const update of updates) {
    await setClientFieldValue(clientId, update.field_definition_id, update.value);
  }
}

export async function deleteClientFieldValue(
  clientId: string,
  fieldDefId: string
): Promise<void> {
  const { error } = await supabase
    .from('client_field_values')
    .delete()
    .eq('client_business_id', clientId)
    .eq('field_definition_id', fieldDefId);
  
  if (error) {
    console.error("Error deleting field value:", error);
    throw error;
  }
}
