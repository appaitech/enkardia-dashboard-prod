
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon, Edit, Save, X, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  getClientActivities,
  createClientActivity,
  updateClientActivity,
  ClientActivity
} from "@/services/clientActivityService";

interface ClientActivitiesProps {
  clientId: string;
}

interface ActivityForm {
  content: string;
  activityDate: Date;
}

export function ClientActivities({ clientId }: ClientActivitiesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<ActivityForm>({
    defaultValues: {
      content: "",
      activityDate: new Date(),
    }
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ["client-activities", clientId],
    queryFn: () => getClientActivities(clientId),
  });

  const createMutation = useMutation({
    mutationFn: (data: ActivityForm) => createClientActivity({
      clientBusinessId: clientId,
      content: data.content,
      activityDate: data.activityDate,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-activities", clientId] });
      toast({
        title: "Activity created",
        description: "The activity has been created successfully",
      });
      reset();
      setIsCreating(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create activity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; form: ActivityForm }) =>
      updateClientActivity(data.id, {
        content: data.form.content,
        activityDate: data.form.activityDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-activities", clientId] });
      toast({
        title: "Activity updated",
        description: "The activity has been updated successfully",
      });
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update activity: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateSubmit = (data: ActivityForm) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: ActivityForm) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, form: data });
    }
  };

  const startEditing = (activity: ClientActivity) => {
    setEditingId(activity.id);
    setValue("content", activity.content);
    setValue("activityDate", new Date(activity.activityDate));
  };

  const cancelEditing = () => {
    setEditingId(null);
    reset();
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingId(null);
    reset({
      content: "",
      activityDate: new Date(),
    });
  };

  const cancelCreating = () => {
    setIsCreating(false);
    reset();
  };

  const selectedDate = watch("activityDate");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Activities</CardTitle>
            <CardDescription>
              Record interactions and notes about this client
            </CardDescription>
          </div>
          {!isCreating && (
            <Button onClick={startCreating}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Activity
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isCreating && (
            <Card className="mb-6 border-primary/50">
              <CardHeader>
                <CardTitle className="text-base">New Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <form id="create-form" onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="activityDate" className="text-sm font-medium">
                      Activity Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setValue("activityDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Activity Notes
                    </label>
                    <Textarea
                      id="content"
                      placeholder="Enter details about the client interaction..."
                      rows={5}
                      {...register("content", { required: true })}
                    />
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={cancelCreating}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" form="create-form" disabled={createMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Activity
                </Button>
              </CardFooter>
            </Card>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id} className="overflow-hidden">
                  {editingId === activity.id ? (
                    <form id={`edit-form-${activity.id}`} onSubmit={handleSubmit(handleUpdateSubmit)}>
                      <CardHeader>
                        <div className="space-y-2">
                          <label htmlFor="editActivityDate" className="text-sm font-medium">
                            Activity Date
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !selectedDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setValue("activityDate", date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <label htmlFor="editContent" className="text-sm font-medium">
                            Activity Notes
                          </label>
                          <Textarea
                            id="editContent"
                            placeholder="Enter details about the client interaction..."
                            rows={5}
                            {...register("content", { required: true })}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={cancelEditing} type="button">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          form={`edit-form-${activity.id}`} 
                          disabled={updateMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Update
                        </Button>
                      </CardFooter>
                    </form>
                  ) : (
                    <>
                      <CardHeader className="flex flex-row items-start justify-between py-3">
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {format(new Date(activity.activityDate), "PPP")}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Created by {activity.createdByName} &bull; {format(new Date(activity.createdAt), "PPp")}
                            {activity.updatedAt !== activity.createdAt && (
                              <> &bull; Updated by {activity.updatedByName} on {format(new Date(activity.updatedAt), "PPp")}</>
                            )}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(activity)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap">{activity.content}</div>
                      </CardContent>
                    </>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No activities recorded for this client.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
