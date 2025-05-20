
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDirectors, deleteDirector } from "@/services/directorService";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, Trash2, Edit, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";

const DirectorsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [directorToDelete, setDirectorToDelete] = useState<string | null>(null);

  const { data: directors = [], isLoading } = useQuery({
    queryKey: ["directors"],
    queryFn: getDirectors
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDirector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["directors"] });
      toast({
        title: "Success",
        description: "Director deleted successfully",
        variant: "default"
      });
      setDirectorToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete director: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const filteredDirectors = directors.filter(director =>
    director.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (director.email && director.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteDirector = (id: string) => {
    setDirectorToDelete(id);
  };

  const confirmDelete = () => {
    if (directorToDelete) {
      deleteMutation.mutate(directorToDelete);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd MMM yyyy");
    } catch (e) {
      return date;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Directors</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search directors..."
                  className="pl-10 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => navigate("/admin/directors/new")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Director
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date of Appointment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDirectors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No directors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDirectors.map((director) => (
                      <TableRow key={director.id}>
                        <TableCell className="font-medium">{director.full_name}</TableCell>
                        <TableCell>{director.position || "-"}</TableCell>
                        <TableCell>{director.email || "-"}</TableCell>
                        <TableCell>{director.phone || "-"}</TableCell>
                        <TableCell>{formatDate(director.date_of_appointment)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/directors/${director.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/directors/${director.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDirector(director.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!directorToDelete} onOpenChange={() => setDirectorToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                director and any associations with clients.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default DirectorsList;
