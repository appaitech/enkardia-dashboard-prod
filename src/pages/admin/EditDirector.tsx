
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDirector, updateDirector } from "@/services/directorService";
import { DirectorFormData } from "@/types/director";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/AdminLayout";
import DirectorForm from "@/components/DirectorForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

const EditDirector = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: director, isLoading } = useQuery({
    queryKey: ["director", id],
    queryFn: () => getDirector(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: DirectorFormData) => updateDirector(id!, data),
    onSuccess: (updatedDirector) => {
      queryClient.invalidateQueries({ queryKey: ["director", id] });
      queryClient.invalidateQueries({ queryKey: ["directors"] });
      toast({
        title: "Success",
        description: "Director updated successfully",
      });
      navigate(`/admin/directors/${updatedDirector.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update director: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DirectorFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!director) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">Director not found</h3>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/admin/directors")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Directors
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const directorFormData: DirectorFormData = {
    full_name: director.full_name,
    date_of_birth: director.date_of_birth,
    nationality: director.nationality,
    identification_number: director.identification_number,
    residential_address: director.residential_address,
    email: director.email,
    phone: director.phone,
    position: director.position,
    date_of_appointment: director.date_of_appointment,
    date_of_resignation: director.date_of_resignation,
    director_type: director.director_type,
    tax_number: director.tax_number,
    tax_identification_number: director.tax_identification_number,
    residency_status: director.residency_status,
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/admin/directors/${id}`)} 
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Director
          </Button>
          <h1 className="text-2xl font-bold">Edit Director</h1>
        </div>

        <DirectorForm 
          initialData={directorFormData} 
          onSubmit={handleSubmit} 
          isSubmitting={mutation.isPending} 
        />
      </div>
    </AdminLayout>
  );
};

export default EditDirector;
