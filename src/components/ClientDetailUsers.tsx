
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Mail, 
  AlertTriangle, 
  Loader2 
} from "lucide-react";
import InviteUserForm from "./InviteUserForm";

interface ClientDetailUsersProps {
  clientId: string;
  clientName: string;
}

// Interface for users assigned to a client business
interface AssignedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Interface for pending invitations
interface Invitation {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
}

const ClientDetailUsers: React.FC<ClientDetailUsersProps> = ({ clientId, clientName }) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "invitations">("users");
  
  // Fetch users associated with this client business
  const { 
    data: assignedUsers,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ["client-users", clientId],
    queryFn: async () => {
      try {
        // First, get the user_ids connected to this client business
        const { data: userClientData, error: userClientError } = await supabase
          .from("user_client_businesses")
          .select("user_id")
          .eq("client_business_id", clientId);
        
        if (userClientError) throw userClientError;
        
        if (!userClientData || userClientData.length === 0) {
          return [] as AssignedUser[];
        }
        
        // Then, get the profiles for these user IDs
        const userIds = userClientData.map(item => item.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, email, name, role")
          .in("id", userIds);
          
        if (profilesError) throw profilesError;
        
        return (profilesData || []) as AssignedUser[];
      } catch (error) {
        console.error("Error fetching client users:", error);
        throw error;
      }
    }
  });
  
  // Fetch pending invitations for this client business
  const {
    data: invitations,
    isLoading: isLoadingInvitations,
    isError: isErrorInvitations,
    refetch: refetchInvitations
  } = useQuery({
    queryKey: ["client-invitations", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitations")
        .select("id, email, created_at, expires_at")
        .eq("client_business_id", clientId)
        .eq("accepted", false)
        .gt("expires_at", "now()") // Fixed: Changed from lt to gt to get unexpired invitations
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data as Invitation[];
    }
  });
  
  const handleInviteSuccess = () => {
    setIsInviteDialogOpen(false);
    refetchUsers();
    refetchInvitations();
  };
  
  // Render users list
  const renderUsersList = () => {
    if (isLoadingUsers) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mb-2" />
          <p className="text-slate-500">Loading users...</p>
        </div>
      );
    }
    
    if (isErrorUsers) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
          <p className="text-slate-500">Error loading users</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchUsers()}>
            Try again
          </Button>
        </div>
      );
    }
    
    if (!assignedUsers || assignedUsers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <Users className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-slate-500">No users assigned to this client yet</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setIsInviteDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      );
    }
    
    return (
      <div className="divide-y">
        {assignedUsers.map(user => (
          <div key={user.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-slate-500 flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {user.email}
              </div>
            </div>
            <Badge variant="outline">{user.role}</Badge>
          </div>
        ))}
      </div>
    );
  };
  
  // Render invitations list
  const renderInvitationsList = () => {
    if (isLoadingInvitations) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mb-2" />
          <p className="text-slate-500">Loading invitations...</p>
        </div>
      );
    }
    
    if (isErrorInvitations) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-6 w-6 text-amber-500 mb-2" />
          <p className="text-slate-500">Error loading invitations</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchInvitations()}>
            Try again
          </Button>
        </div>
      );
    }
    
    if (!invitations || invitations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <Mail className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-slate-500">No pending invitations</p>
        </div>
      );
    }
    
    return (
      <div className="divide-y">
        {invitations.map(invitation => (
          <div key={invitation.id} className="py-3">
            <div className="font-medium">{invitation.email}</div>
            <div className="text-xs text-slate-500 mt-1">
              Sent: {new Date(invitation.created_at).toLocaleDateString()}
              <span className="mx-1">•</span>
              Expires: {new Date(invitation.expires_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Users & Invitations
            </CardTitle>
            <CardDescription>
              Manage users associated with this client
            </CardDescription>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as "users" | "invitations")}
          >
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="users">
                Assigned Users
              </TabsTrigger>
              <TabsTrigger value="invitations">
                Pending Invitations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-1">
              {renderUsersList()}
            </TabsContent>
            
            <TabsContent value="invitations" className="mt-1">
              {renderInvitationsList()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Invite a user to access this client business dashboard
            </DialogDescription>
          </DialogHeader>
          <InviteUserForm 
            clientId={clientId} 
            clientName={clientName} 
            onSuccess={handleInviteSuccess}
            onCancel={() => setIsInviteDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientDetailUsers;
