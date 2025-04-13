
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { fetchCallToActions } from "@/services/callToActionService";
import { CallToActionList } from "./CallToActionList";
import { CreateCallToActionForm } from "./CreateCallToActionForm";

interface CallToActionTabProps {
  clientId: string;
  clientName: string;
}

export function CallToActionTab({ clientId, clientName }: CallToActionTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const {
    data: callToActions,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["call-to-actions", clientId],
    queryFn: () => fetchCallToActions(clientId),
  });
  
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Error loading call to actions</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Call To Actions</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Call To Action
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <CreateCallToActionForm
              clientBusinessId={clientId}
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <CallToActionList
        callToActions={callToActions || []}
        isConsoleView={true}
      />
    </div>
  );
}
