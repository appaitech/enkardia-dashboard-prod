
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Globe } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCallToAction } from "@/services/callToActionService";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  urls: z.array(
    z.object({
      url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
      label: z.string().optional(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCallToActionFormProps {
  clientBusinessId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateCallToActionForm({
  clientBusinessId,
  onSuccess,
  onCancel,
}: CreateCallToActionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      urls: [],
    },
  });

  const urls = form.watch("urls");

  const addUrl = () => {
    form.setValue("urls", [...urls, { url: "", label: "" }]);
  };

  const removeUrl = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    form.setValue("urls", newUrls);
  };

  const handleSubmit = async () => {
    // Validate form data
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }
    
    const values = form.getValues();
    setIsSubmitting(true);
    
    try {
      // Filter out any empty URLs
      const filteredUrls = values.urls.filter(url => url.url && url.url.trim() !== "");
      
      // Convert to required format for API call
      const urlsForApi = filteredUrls.map(url => ({
        url: url.url || "",
        label: url.label || null
      }));
      
      const result = await createCallToAction(
        clientBusinessId,
        values.title,
        values.description || null,
        urlsForApi
      );

      if (result) {
        toast.success("Call To Action created successfully");
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating Call To Action:", error);
      toast.error("Failed to create Call To Action");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <CardTitle className="text-slate-800">Create Call To Action</CardTitle>
      </CardHeader>
      <Form {...form}>
        <CardContent className="space-y-4 pt-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a description (optional)"
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel className="text-slate-700">URLs</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUrl}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add URL
              </Button>
            </div>

            {urls.length === 0 && (
              <div className="text-center py-4 text-muted-foreground bg-slate-50 rounded-md">
                No URLs added yet. Click "Add URL" to add one.
              </div>
            )}

            {urls.map((_, index) => (
              <div key={index} className="flex gap-3 items-start p-3 border border-slate-200 rounded-md">
                <div className="space-y-2 flex-1">
                  <FormField
                    control={form.control}
                    name={`urls.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <Input placeholder="https://example.com" {...field} />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`urls.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <Input placeholder="Label (optional)" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrl(index)}
                  className="mt-1 text-slate-500 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-700"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {isSubmitting ? "Creating..." : "Create Call To Action"}
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}
