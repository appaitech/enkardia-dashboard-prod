
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getDirector } from "@/services/directorService";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, ArrowLeft, Loader2 } from "lucide-react";

const DirectorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: director, isLoading, error } = useQuery({
    queryKey: ["director", id],
    queryFn: () => getDirector(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !director) {
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Error loading director details</h3>
                <p className="text-muted-foreground mt-2">
                  {error instanceof Error ? error.message : "Director not found"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/admin/directors")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Directors
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMMM yyyy");
    } catch (e) {
      return date;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/admin/directors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directors
          </Button>
          <Button onClick={() => navigate(`/admin/directors/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Director
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{director.full_name}</CardTitle>
            <div className="text-muted-foreground">{director.position || "No position specified"}</div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Personal Information</h3>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Full Name</div>
                    <div className="font-medium">{director.full_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">{formatDate(director.date_of_birth)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Nationality</div>
                    <div className="font-medium">{director.nationality || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Identification/Passport Number</div>
                    <div className="font-medium">{director.identification_number || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Residential Address</div>
                    <div className="font-medium">{director.residential_address || "-"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Contact Details</h3>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Email Address</div>
                    <div className="font-medium">{director.email || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone Number</div>
                    <div className="font-medium">{director.phone || "-"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Director Role Information</h3>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Position/Title</div>
                    <div className="font-medium">{director.position || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Appointment</div>
                    <div className="font-medium">{formatDate(director.date_of_appointment)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Resignation</div>
                    <div className="font-medium">{formatDate(director.date_of_resignation)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Director Type</div>
                    <div className="font-medium">{director.director_type || "-"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Compliance & Legal</h3>
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Tax Number</div>
                    <div className="font-medium">{director.tax_number || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Tax Identification Number (TIN)</div>
                    <div className="font-medium">{director.tax_identification_number || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Residency Status</div>
                    <div className="font-medium">{director.residency_status || "-"}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DirectorDetail;
