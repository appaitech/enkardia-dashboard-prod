
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";

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

function CallToActionsPage() {
  const location = useLocation();
  const { user } = useAuth();
  
  const {
    data: callToActions,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user-call-to-actions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const businessIds = await getUserClientBusinessIds(user.id);
      return fetchCallToActionsWithViewStatus(businessIds, user.id);
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
  
  return (
    <div className="flex h-screen bg-slate-50">
      <UserSidebar activePath={location.pathname} />
      
      <div className="flex-1 overflow-auto lg:ml-64">
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h1 className="text-2xl font-bold text-slate-800">Call To Actions</h1>
            </div>
            <p className="text-slate-500 mt-1">
              View important actions and updates from your accountant
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-red-500">Error loading call to actions</p>
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
