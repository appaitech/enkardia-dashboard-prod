
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, X, Trash, Save } from "lucide-react";
import {
  getFieldDefinitions,
  createFieldDefinition,
  deleteFieldDefinition,
  getClientFieldValues,
  setClientFieldValue,
} from "@/services/customFieldService";
import { 
  ClientFieldDefinition, 
  NewClientFieldDefinition,
  CustomField
} from "@/types/customField";

interface CustomFieldsManagerProps {
  clientId: string;
}

export function CustomFieldsManager({ clientId }: CustomFieldsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<NewClientFieldDefinition>({
    name: "",
    field_type: "text",
    client_business_id: clientId
  });

  console.log('CustomFieldsManager clientId', clientId);

  // Get all custom fields with the client's values
  const { data: customFields, isLoading: isLoadingFields } = useQuery({
    queryKey: ["client-custom-fields", clientId],
    queryFn: () => getClientFieldValues(clientId),
  });

  // Create a new field definition
  const createFieldMutation = useMutation({
    mutationFn: createFieldDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-custom-fields", clientId] });
      toast({
        title: "Success",
        description: "Custom field created successfully",
      });
      setIsAddingField(false);
      setNewField({ name: "", field_type: "text", client_business_id: clientId });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create custom field: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete a field definition
  const deleteFieldMutation = useMutation({
    mutationFn: deleteFieldDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-custom-fields", clientId] });
      toast({
        title: "Success",
        description: "Custom field deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete custom field: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update a field value
  const updateFieldValueMutation = useMutation({
    mutationFn: ({ fieldDefId, value }: { fieldDefId: string; value: string | null }) => 
      setClientFieldValue(clientId, fieldDefId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-custom-fields", clientId] });
      toast({
        title: "Success",
        description: "Field value updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update field value: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateField = () => {
    if (!newField.name) {
      toast({
        title: "Error",
        description: "Field name is required",
        variant: "destructive",
      });
      return;
    }
    
    createFieldMutation.mutate(newField);
  };

  const handleDeleteField = (fieldId: string) => {
    deleteFieldMutation.mutate(fieldId);
  };

  const handleValueChange = (fieldDefId: string, value: string) => {
    updateFieldValueMutation.mutate({ 
      fieldDefId, 
      value: value.trim() === "" ? null : value 
    });
  };

  const renderFieldInput = (customField: CustomField) => {
    const { definition, value } = customField;
    
    switch (definition.field_type) {
      case 'text':
        return (
          <Input
            id={`field-${definition.id}`}
            defaultValue={value || ""}
            onBlur={(e) => handleValueChange(definition.id, e.target.value)}
            placeholder={`Enter ${definition.name}`}
          />
        );
        
      case 'number':
        return (
          <Input
            id={`field-${definition.id}`}
            type="number"
            defaultValue={value || ""}
            onBlur={(e) => handleValueChange(definition.id, e.target.value)}
            placeholder={`Enter ${definition.name}`}
          />
        );
        
      case 'date':
        return (
          <Input
            id={`field-${definition.id}`}
            type="date"
            defaultValue={value || ""}
            onBlur={(e) => handleValueChange(definition.id, e.target.value)}
          />
        );
        
      case 'boolean':
        return (
          <Select
            defaultValue={value || ""}
            onValueChange={(value) => handleValueChange(definition.id, value)}
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
            id={`field-${definition.id}`}
            defaultValue={value || ""}
            onBlur={(e) => handleValueChange(definition.id, e.target.value)}
            placeholder={`Enter ${definition.name}`}
          />
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Custom Fields</CardTitle>
          <CardDescription>
            Add and manage custom fields for this client
          </CardDescription>
        </div>
        <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Field</DialogTitle>
              <DialogDescription>
                Create a new custom field for client information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Field Name</Label>
                <Input
                  id="field-name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                  placeholder="e.g. Tax Number, Registration Date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field-type">Field Type</Label>
                <Select
                  value={newField.field_type}
                  onValueChange={(value: any) => setNewField({ ...newField, field_type: value })}
                >
                  <SelectTrigger id="field-type">
                    <SelectValue placeholder="Select field type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Yes/No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingField(false);
                  setNewField({ name: "", field_type: "text" });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleCreateField} disabled={createFieldMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Create Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoadingFields ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          </div>
        ) : !customFields || customFields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No custom fields have been created yet.
            <br />
            Use the "Add Field" button to create your first custom field.
          </div>
        ) : (
          <div className="space-y-4">
            {customFields.map((customField) => (
              <div key={customField.definition.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor={`field-${customField.definition.id}`}>
                    {customField.definition.name}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteField(customField.definition.id)}
                    className="h-8 w-8 p-0"
                    title="Delete this field"
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Delete field</span>
                  </Button>
                </div>
                {renderFieldInput(customField)}
                <p className="text-xs text-muted-foreground">
                  Field type: {customField.definition.field_type.charAt(0).toUpperCase() + customField.definition.field_type.slice(1)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
