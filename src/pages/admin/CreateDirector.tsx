
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createDirector } from "@/services/directorService";
import { DirectorFormData } from "@/types/director";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/AdminLayout";
import DirectorForm from "@/components/DirectorForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CreateDirector = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: createDirector,
    onSuccess: (director) => {
      toast({
        title: "Success",
        description: "Director created successfully",
      });
      navigate(`/admin/directors/${director.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create director: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DirectorFormData) => {
    mutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/admin/directors")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directors
          </Button>
          <h1 className="text-2xl font-bold">Create New Director</h1>
        </div>

        <DirectorForm 
          onSubmit={handleSubmit} 
          isSubmitting={mutation.isPending} 
        />
      </div>
    </AdminLayout>
  );
};

export default CreateDirector;
