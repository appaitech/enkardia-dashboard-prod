import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, 
  UserPlus, 
  Mail, 
  AlertTriangle, 
  Loader2,
  UserX,
  Search,
  Check
} from "lucide-react";
import { removeUserFromClientBusiness } from "@/services/invitationService";
import { toast } from "sonner";

interface ClientDetailUsersProps {
  clientId: string;
  clientName: string;
}

interface AssignedUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AvailableUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const ClientDetailUsers: React.FC<ClientDetailUsersProps> = ({ clientId, clientName }) => {
  const [isAssignUserDialogOpen, setIsAssignUserDialogOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [isRemoveUserDialogOpen, setIsRemoveUserDialogOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<AssignedUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  
  const { 
    data: assignedUsers,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ["client-users", clientId],
    queryFn: async () => {
      try {
        const { data: userClientData, error: userClientError } = await supabase
          .from("user_client_businesses")
          .select("user_id")
          .eq("client_business_id", clientId);
        
        if (userClientError) throw userClientError;
        
        if (!userClientData || userClientData.length === 0) {
          return [] as AssignedUser[];
        }
        
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
  
  const {
    data: availableUsers,
    isLoading: isLoadingAvailableUsers,
    isError: isErrorAvailableUsers,
    refetch: refetchAvailableUsers
  } = useQuery({
    queryKey: ["available-users", clientId, searchQuery],
    queryFn: async () => {
      try {
        const { data: userClientData, error: userClientError } = await supabase
          .from("user_client_businesses")
          .select("user_id")
          .eq("client_business_id", clientId);
        
        if (userClientError) throw userClientError;
        
        const assignedUserIds = userClientData?.map(item => item.user_id) || [];
        
        let query = supabase
          .from("profiles")
          .select("id, email, name, role")
          .neq("account_type", "CONSOLE");
          
        if (assignedUserIds.length > 0) {
          query = query.not("id", "in", `(${assignedUserIds.join(",")})`);
        }
          
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
        }
        
        const { data: availableUsersData, error: availableUsersError } = await query;
        
        if (availableUsersError) throw availableUsersError;
        
        return (availableUsersData || []) as AvailableUser[];
      } catch (error) {
        console.error("Error fetching available users:", error);
        throw error;
      }
    },
    enabled: isAssignUserDialogOpen
  });
  
  const openRemoveUserDialog = (user: AssignedUser) => {
    setUserToRemove(user);
    setIsRemoveUserDialogOpen(true);
  };
  
  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    
    setRemovingUserId(userToRemove.id);
    
    try {
      const result = await removeUserFromClientBusiness(userToRemove.id, clientId);
      
      if (result.success) {
        toast.success(result.message);
        refetchUsers();
        setIsRemoveUserDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error removing user:", error);
      toast.error("An unexpected error occurred while removing the user");
    } finally {
      setRemovingUserId(null);
      setUserToRemove(null);
    }
  };
  
  const handleAssignUser = async (userId: string) => {
    setAssigningUserId(userId);
    
    try {
      const { error } = await supabase
        .from("user_client_businesses")
        .insert({
          user_id: userId,
          client_business_id: clientId
        });
      
      if (error) {
        throw error;
      }
      
      toast.success("User successfully assigned to client");
      refetchUsers();
      refetchAvailableUsers();
      setIsAssignUserDialogOpen(false);
    } catch (error) {
      console.error("Error assigning user:", error);
      toast.error("An unexpected error occurred while assigning the user");
    } finally {
      setAssigningUserId(null);
    }
  };
  
  const filteredAvailableUsers = availableUsers || [];
  
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
            onClick={() => setIsAssignUserDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign User
          </Button>
        </div>
      );
    }
    
    return (
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignedUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-1 text-slate-400" />
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openRemoveUserDialog(user)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
              Users
            </CardTitle>
            <CardDescription>
              Manage users associated with this client
            </CardDescription>
          </div>
          <Button onClick={() => setIsAssignUserDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign User
          </Button>
        </CardHeader>
        
        <CardContent>
          {renderUsersList()}
        </CardContent>
      </Card>
      
      <Dialog open={isAssignUserDialogOpen} onOpenChange={setIsAssignUserDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
            <DialogDescription>
              Assign an existing user to access {clientName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users by name or email"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto border rounded-md">
            {isLoadingAvailableUsers ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : filteredAvailableUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[80px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvailableUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleAssignUser(user.id)}
                          disabled={assigningUserId === user.id}
                        >
                          {assigningUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-slate-500">No matching users found</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignUserDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isRemoveUserDialogOpen} onOpenChange={setIsRemoveUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.name}'s access to {clientName}?
              This action will not delete the user account, but will revoke their access to this client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveUser}
              disabled={!!removingUserId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removingUserId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                "Remove Access"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClientDetailUsers;
