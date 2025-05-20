
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { DirectorFormData } from "@/types/director";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

const directorSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  date_of_birth: z.string().optional(),
  nationality: z.string().optional(),
  identification_number: z.string().optional(),
  residential_address: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  date_of_appointment: z.string().optional(),
  date_of_resignation: z.string().optional(),
  director_type: z.string().optional(),
  tax_number: z.string().optional(),
  tax_identification_number: z.string().optional(),
  residency_status: z.string().optional(),
});

interface DirectorFormProps {
  initialData?: DirectorFormData;
  onSubmit: (data: DirectorFormData) => void;
  isSubmitting: boolean;
}

const DirectorForm: React.FC<DirectorFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<DirectorFormData>({
    resolver: zodResolver(directorSchema),
    defaultValues: initialData || {
      full_name: "",
      date_of_birth: "",
      nationality: "",
      identification_number: "",
      residential_address: "",
      email: "",
      phone: "",
      position: "",
      date_of_appointment: "",
      date_of_resignation: "",
      director_type: "",
      tax_number: "",
      tax_identification_number: "",
      residency_status: "",
    },
  });

  // Helper function to format dates for input fields
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Basic Personal Information</h3>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={formatDateForInput(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. American" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identification_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identification/Passport Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. AB123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residential_address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Residential Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-medium mt-8 mb-4">Contact Details</h3>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-medium mt-8 mb-4">Director Role Information</h3>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position/Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CEO" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="director_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Director Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Executive" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_appointment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Appointment</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={formatDateForInput(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_resignation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Resignation</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={formatDateForInput(field.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-medium mt-8 mb-4">Compliance & Legal</h3>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tax_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. TX12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_identification_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Identification Number (TIN)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 123-45-6789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="residency_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Residency Status</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Resident" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Director"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DirectorForm;
