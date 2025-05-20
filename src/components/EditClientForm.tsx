
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ClientBusiness } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  getClientFieldValues, 
  updateClientFieldValues 
} from "@/services/customFieldService";
import { CustomField, ClientFieldValueUpdate } from "@/types/customField";

interface EditClientFormProps {
  client: ClientBusiness;
  onSubmit: (values: Partial<ClientBusiness>) => Promise<void>;
  onCancel: () => void;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ client, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<Partial<ClientBusiness>>({
    defaultValues: {
      name: client.name,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone || "",
      industry: client.industry || "",
    },
  });
  
  // Load custom field values
  useEffect(() => {
    const fetchCustomFields = async () => {
      setIsLoading(true);
      try {
        const fields = await getClientFieldValues(client.id);
        setCustomFields(fields);
        
        // Initialize field values
        const initialValues: Record<string, string | null> = {};
        fields.forEach(field => {
          initialValues[field.definition.id] = field.value;
        });
        setFieldValues(initialValues);
      } catch (error) {
        console.error("Error fetching custom fields:", error);
        toast({
          title: "Error",
          description: "Failed to load custom fields",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomFields();
  }, [client.id, toast]);
  
  const handleSubmit = async (values: Partial<ClientBusiness>) => {
    try {
      // First update client basic info
      await onSubmit(values);
      
      // Then update custom field values
      const fieldUpdates: ClientFieldValueUpdate[] = Object.entries(fieldValues).map(([fieldDefId, value]) => ({
        field_definition_id: fieldDefId,
        value: value
      }));
      
      await updateClientFieldValues(client.id, fieldUpdates);
      
      toast({
        title: "Success",
        description: "Client details updated successfully",
      });
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client details",
        variant: "destructive",
      });
    }
  };

  const handleFieldValueChange = (fieldId: string, value: string | null) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderFieldInput = (field: CustomField) => {
    const { definition } = field;
    
    switch (definition.field_type) {
      case 'text':
        return (
          <Input
            value={fieldValues[definition.id] || ""}
            onChange={(e) => handleFieldValueChange(definition.id, e.target.value)}
            placeholder={`Enter ${definition.name}`}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={fieldValues[definition.id] || ""}
            onChange={(e) => handleFieldValueChange(definition.id, e.target.value)}
            placeholder={`Enter ${definition.name}`}
          />
        );
        
      case 'date':
        return (
          <Input
            type="date"
            value={fieldValues[definition.id] || ""}
            onChange={(e) => handleFieldValueChange(definition.id, e.target.value)}
          />
        );
        
      case 'boolean':
        return (
          <Select
            value={fieldValues[definition.id] || ""}
            onValueChange={(value) => handleFieldValueChange(definition.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${definition.name}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="">Not set</SelectItem>
            </SelectContent>
          </Select>
        );
        
      default:
        return (
          <Input
            value={fieldValues[definition.id] || ""}
            onChange={(e) => handleFieldValueChange(definition.id, e.target.value)}
            placeholder={`Enter ${definition.name}`}
          />
        );
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Business name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contact person's name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Email address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Industry" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
              </div>
            ) : (
              <>
                {customFields.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Custom Fields</h3>
                    <div className="space-y-4">
                      {customFields.map((field) => (
                        <div key={field.definition.id} className="space-y-2">
                          <Label htmlFor={`field-${field.definition.id}`}>
                            {field.definition.name}
                          </Label>
                          {renderFieldInput(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!form.formState.isDirty && Object.keys(fieldValues).length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default EditClientForm;
