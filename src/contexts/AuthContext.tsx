
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
  signup: (email: string, password: string, name: string, accountType: AccountType, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize authentication and set up listener
  useEffect(() => {
    setIsLoading(true);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state change event:", event);
        setSession(currentSession);
        
        if (currentSession && currentSession.user) {
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
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    // Check for existing session
    const checkExistingSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession && currentSession.user) {
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
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setIsLoading(false);
        throw error;
      }

      if (data.user) {
        toast.success("Login successful!");
        
        // Redirect based on account type
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('account_type, role')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          setIsLoading(false);
          throw profileError;
        }
        
        // The navigation will trigger auth state change which will update the user
        if (profile.account_type === "CONSOLE") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
      
      // Don't reset isLoading here - let the auth state change handler do it
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "An error occurred during login");
      setIsLoading(false);
      throw error; // Re-throw so the LoginPage component can catch it
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string,
    accountType: AccountType,
    role: UserRole
  ) => {
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
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "An error occurred during signup");
      setIsLoading(false);
      throw error; // Re-throw so the LoginPage component can catch it
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
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

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    session
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
