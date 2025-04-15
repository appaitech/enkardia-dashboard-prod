import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Settings,
  User,
  Users,
  Building2,
  Calendar,
  Wallet,
  FileText,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { updateUserMetadata } from "@/services/authService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
});

interface UserSidebarProps {
  isCollapsed: boolean;
}

const UserSidebar: React.FC<UserSidebarProps> = ({ isCollapsed }) => {
  const { user, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProfileSheetOpen, setIsProfileSheetOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsSaving(true);
    try {
      if (!user?.id) {
        throw new Error("User ID is missing");
      }

      await updateUserMetadata(user.id, values);
      await refreshUserData();

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile.",
      });
    } finally {
      setIsSaving(false);
      setIsProfileSheetOpen(false);
    }
  }

  return (
    <div
      className={`flex flex-col h-full bg-white border-r shadow-sm`}
    >
      <div className="flex-1">
        <div className="px-6 py-4">
          <NavLink to="/user/dashboard" className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-gray-500" />
            <span className="text-lg font-bold text-gray-800">Enkardia</span>
          </NavLink>
        </div>
        <nav className="px-3 py-2">
          <NavLink
            to="/user/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 mb-1 rounded-md ${isActive
                ? "bg-navy-500/10 text-navy-700"
                : "text-gray-600 hover:bg-navy-500/5 hover:text-navy-600"
              }`
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/user/clients"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 mb-1 rounded-md ${isActive
                ? "bg-navy-500/10 text-navy-700"
                : "text-gray-600 hover:bg-navy-500/5 hover:text-navy-600"
              }`
            }
          >
            <Users className="h-5 w-5" />
            <span>Clients</span>
          </NavLink>
          <NavLink
            to="/user/projects"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 mb-1 rounded-md ${isActive
                ? "bg-navy-500/10 text-navy-700"
                : "text-gray-600 hover:bg-navy-500/5 hover:text-navy-600"
              }`
            }
          >
            <FileText className="h-5 w-5" />
            <span>Projects</span>
          </NavLink>
          <NavLink
            to="/user/invoices"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 mb-1 rounded-md ${isActive
                ? "bg-navy-500/10 text-navy-700"
                : "text-gray-600 hover:bg-navy-500/5 hover:text-navy-600"
              }`
            }
          >
            <Wallet className="h-5 w-5" />
            <span>Invoices</span>
          </NavLink>
          <NavLink
            to="/user/calendar"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 mb-1 rounded-md ${isActive
                ? "bg-navy-500/10 text-navy-700"
                : "text-gray-600 hover:bg-navy-500/5 hover:text-navy-600"
              }`
            }
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </NavLink>
          <NavLink
            to="/user/help"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 mb-1 rounded-md ${isActive
                ? "bg-navy-500/10 text-navy-700"
                : "text-gray-600 hover:bg-navy-500/5 hover:text-navy-600"
              }`
            }
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
          </NavLink>
          <NavLink
            to="/user/account/linking"
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 mb-1 rounded-md ${isActive
                ? "bg-navy-500/10 text-navy-700"
                : "text-gray-600 hover:bg-navy-500/5 hover:text-navy-600"
              }`
            }
          >
            <Settings className="h-5 w-5" />
            <span>Account Settings</span>
          </NavLink>
        </nav>
      </div>
      <div className="p-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 w-full justify-start">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user?.name || user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsProfileSheetOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => {
              await logout();
              navigate("/login");
            }}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={isProfileSheetOpen} onOpenChange={setIsProfileSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UserSidebar;
