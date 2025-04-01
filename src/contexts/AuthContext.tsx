
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export type AccountType = "CONSOLE" | "CLIENT";
export type UserRole = "ADMIN" | "STANDARD";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, accountType: AccountType, role: UserRole) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  session: Session | null;
  updateUserProfile: (userId: string, updates: { name?: string; role?: UserRole }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize authentication and set up listener
  useEffect(() => {
    console.log("Auth provider initialized");
    setIsLoading(true);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event);
        setSession(currentSession);
        
        if (currentSession && currentSession.user) {
          // Defer fetching profile to avoid potential deadlocks
          setTimeout(async () => {
            try {
              // Fetch user profile from the profiles table
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
                
              if (error) throw error;
              
              if (profile) {
                setUser({
                  id: currentSession.user.id,
                  email: currentSession.user.email || '',
                  name: profile.name || 'User',
                  accountType: profile.account_type as AccountType,
                  role: profile.role as UserRole
                });
              }
            } catch (error) {
              console.error("Error fetching user profile:", error);
              toast.error("Error loading user profile");
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    // Check for existing session
    const checkExistingSession = async () => {
      try {
        console.log("Checking for existing session");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession && currentSession.user) {
          console.log("Found existing session for user:", currentSession.user.id);
          // Fetch user profile from the profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user profile:", error);
            toast.error("Error loading user profile");
            setIsLoading(false);
            return;
          }
          
          if (profile) {
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              name: profile.name || 'User',
              accountType: profile.account_type as AccountType,
              role: profile.role as UserRole
            });
          }
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkExistingSession();
    
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Login attempt for:", email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error in AuthContext:", error);
        setIsLoading(false);
        throw error;
      }

      if (data.user) {
        console.log("Login successful for:", data.user.id);
        toast.success("Login successful!");
        
        // The auth state change handler will handle setting the user
        // No need to manually update user state or navigate here
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login");
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string,
    accountType: AccountType,
    role: UserRole
  ): Promise<string | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            account_type: accountType,
            role
          }
        }
      });
      
      if (error) {
        setIsLoading(false);
        throw error;
      }
      
      toast.success("Sign up successful! Please check your email for verification.");
      setIsLoading(false);
      
      // Return the user ID so it can be used to accept the invitation
      return data.user?.id || null;
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "An error occurred during signup");
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log("Logging out...");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    } finally {
      // Always reset loading state after logout completes
      setIsLoading(false);
    }
  };

  // Update user profile with improved error handling and logging
  const updateUserProfile = async (
    userId: string,
    updates: { name?: string; role?: UserRole }
  ) => {
    try {
      console.log("Updating user profile:", userId, updates);
      
      const updateData: { name?: string; role?: string } = {};
      
      // Only include defined fields in the update
      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }
      
      if (updates.role !== undefined) {
        updateData.role = updates.role;
      }
      
      // Check if there are any fields to update
      if (Object.keys(updateData).length === 0) {
        console.log("No fields to update");
        return;
      }
      
      const { error, data } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
      
      console.log("Profile update result:", { error, data });
        
      if (error) throw error;
      
      // If updating the current user, also update the local state
      if (user && userId === user.id) {
        setUser(prev => prev ? {
          ...prev,
          name: updates.name || prev.name,
          role: updates.role || prev.role
        } : null);
      }
      
      return;
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    session,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
