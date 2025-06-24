
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, Loader2, RefreshCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import React, { useState, useEffect } from 'react';

import { useAuth } from "@/contexts/AuthContext";
import { CallToAction } from "@/types/callToAction";
import UserSidebar from "@/components/UserSidebar";
import { CallToActionList } from "@/components/CallToAction/CallToActionList";
import { 
  fetchCallToActionsWithViewStatus, 
  getUserClientBusinessIds, 
  markCallToActionAsViewed 
} from "@/services/callToActionService";
import { toast } from "sonner";
import { useSelectedBusiness } from "@/hooks/useSelectedBusiness";
import { getUserClientBusinesses, saveSelectedClientBusinessId } from "@/services/userService";
import ClientBusinessSelector from "@/components/ClientBusinessSelector";

function CallToActionsPage() {
  const location = useLocation();
  const { user } = useAuth();
  const { selectedBusinessId, handleBusinessSelect } = useSelectedBusiness();

  
  
  const { 
      data: clientBusinesses,
      isLoading: isLoadingBusinesses,
      isError: isErrorBusinesses,
      refetch: refetchBusinesses
    } = useQuery({
      queryKey: ["user-client-businesses", user?.id],
      queryFn: () => getUserClientBusinesses(user?.id || ""),
      enabled: !!user?.id,
    });

  const validBusinesses = clientBusinesses?.filter(business => business !== null) || [];

  const {
    data: callToActions,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user-call-to-actions", selectedBusinessId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // const businessIds = await getUserClientBusinessIds(user.id);
      return fetchCallToActionsWithViewStatus([selectedBusinessId], user.id);
    },
    enabled: !!user?.id,
  });
  
  const handleViewCallToAction = async (cta: CallToAction) => {
    if (!user) return;
    
    const success = await markCallToActionAsViewed(cta.id);
    if (success) {
      toast.success("Marked as viewed");
      refetch();
    }
  };

  // Hooks
  useEffect(() => {
      if (clientBusinesses?.length && !selectedBusinessId) {
        const validBusinesses = clientBusinesses.filter(business => business !== null);
        if (validBusinesses.length > 0) {
          const firstBusinessId = validBusinesses[0].id;
          handleBusinessSelect(firstBusinessId);
        }
      }
    }, [clientBusinesses, selectedBusinessId, handleBusinessSelect]);
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <UserSidebar activePath={location.pathname} />
      
      <div className="flex-1">
        <div className="p-4 md:p-8">
          {/* <div className="mb-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-navy-600" />
              <h1 className="text-2xl font-bold text-slate-800">Call To Actions</h1>
            </div>
            <p className="text-slate-500 mt-1">
              View important actions and updates from your accountant
            </p>

            {validBusinesses.length > 0 && (
              <div className="w-full md:w-auto">
                <ClientBusinessSelector 
                  clientBusinesses={validBusinesses}
                  selectedBusinessId={selectedBusinessId}
                  onBusinessSelect={handleBusinessSelect}
                />
              </div>
            )}
          </div> */}

          <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-navy-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Call To Actions</h1>
              </div>
              <p className="text-slate-500 mt-2">
                View important actions and updates from your accountant
              </p>
            </div>
            
            {validBusinesses.length > 0 && (
              <div className="w-full md:w-auto">
                <ClientBusinessSelector 
                  clientBusinesses={validBusinesses}
                  selectedBusinessId={selectedBusinessId}
                  onBusinessSelect={handleBusinessSelect}
                />
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
                <p className="mt-4 text-slate-500">Loading...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Error Loading Data</h2>
              <p className="mt-2 text-slate-500">There was a problem loading call to actions</p>
              <Button onClick={() => refetch()} className="mt-4">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : (
            <CallToActionList
              callToActions={callToActions || []}
              onViewCallToAction={handleViewCallToAction}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CallToActionsPage;
