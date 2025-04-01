
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, UserPlus, Pencil, Trash2, Search, ShieldAlert, Shield, UserCog } from "lucide-react";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  account_type: string;
  role: string;
  created_at: string;
}

const UsersManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(lowerSearchTerm) ||
          user.email?.toLowerCase().includes(lowerSearchTerm) ||
          user.role.toLowerCase().includes(lowerSearchTerm) ||
          user.account_type.toLowerCase().includes(lowerSearchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching users from profiles table");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched users:", data);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error: any) {
      toast.error("Failed to fetch users: " + error.message);
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    if (!isAdmin) {
      toast.error("Only administrators can create new users");
      return;
    }
    setCreateDialogOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    console.log("Editing user:", user);
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: UserData) => {
    if (!isAdmin) {
      toast.error("Only administrators can delete users");
      return;
    }
    console.log("Attempting to delete user:", user);
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const onUserCreated = () => {
    fetchUsers();
    setCreateDialogOpen(false);
  };

  const onUserEdited = () => {
    fetchUsers();
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  const onUserDeleted = () => {
    fetchUsers();
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <AdminSidebar activePath={location.pathname} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Users Management</h1>
              <p className="text-slate-500">Manage console and client users</p>
            </div>
            
            {isAdmin && (
              <Button onClick={handleCreateUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            )}
          </div>
          
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Users</CardTitle>
                  <CardDescription>
                    Total users: {users.length}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Account Type</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((userData) => (
                          <TableRow key={userData.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-slate-400" />
                                {userData.name || "Unnamed User"}
                                {userData.id === user?.id && (
                                  <span className="text-xs text-slate-500">(you)</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{userData.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={userData.account_type === "CONSOLE" ? "default" : "outline"}
                                className={userData.account_type === "CONSOLE" ? "bg-blue-500" : "bg-slate-100"}
                              >
                                {userData.account_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={userData.role === "ADMIN" ? "default" : "outline"}
                                className={userData.role === "ADMIN" ? "bg-purple-500" : "bg-slate-100"}
                              >
                                <div className="flex items-center gap-1">
                                  {userData.role === "ADMIN" ? (
                                    <ShieldAlert className="h-3 w-3" />
                                  ) : (
                                    <Shield className="h-3 w-3" />
                                  )}
                                  {userData.role}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(userData.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditUser(userData)}
                                  title="Edit User"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                
                                {isAdmin && userData.id !== user?.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteUser(userData)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    title="Delete User"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onUserCreated={onUserCreated}
      />
      
      {selectedUser && (
        <>
          <EditUserDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            user={selectedUser}
            onUserEdited={onUserEdited}
            isAdmin={isAdmin}
          />
          
          <DeleteUserDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            user={selectedUser}
            onUserDeleted={onUserDeleted}
          />
        </>
      )}
    </div>
  );
};

export default UsersManagement;
