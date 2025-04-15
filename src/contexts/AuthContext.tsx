
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// Define types for account type and user role
export type AccountType = "CONSOLE" | "CLIENT";
export type UserRole = "ADMIN" | "STANDARD";

// Extend the Supabase User type to include our custom fields
export interface User extends SupabaseUser {
  name?: string | null;
  accountType: AccountType;
  role: UserRole;
}

// Define the UserIdentity type to match Supabase's requirements
interface UserIdentity {
  id: string;
  user_id: string;
  identity_id: string;
  provider: string;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signup: (
    email: string, 
    password: string, 
    name?: string, 
    accountType?: AccountType, 
    role?: UserRole
  ) => Promise<string | undefined>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userId: string, updates: any) => Promise<any>;
  refreshUserData: () => Promise<void>;
  accountType: string | null;
  role: string | null;
  signUp: (
    email: string, 
    password: string, 
    name?: string, 
    accountType?: AccountType, 
    role?: UserRole
  ) => Promise<string | undefined>;
  linkWithGoogle: () => Promise<void>;
  unlinkGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      
      if (session?.user) {
        const enhancedUser = {
          ...session.user,
          accountType: accountType as AccountType || "CLIENT",
          role: role as UserRole || "STANDARD",
          name: null
        };
        setUser(enhancedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    loadSession();

    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const enhancedUser = {
          ...session.user,
          accountType: accountType as AccountType || "CLIENT",
          role: role as UserRole || "STANDARD",
          name: null
        };
        setUser(enhancedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setSession(session || null);
    });
  }, [accountType, role]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('account_type, role, name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching user profile:", error);
          } else {
            setAccountType(profile?.account_type || null);
            setRole(profile?.role || null);
            
            // Update user with profile data
            if (user) {
              const enhancedUser = {
                ...user,
                name: profile?.name || null,
                accountType: profile?.account_type as AccountType || "CLIENT",
                role: profile?.role as UserRole || "STANDARD"
              };
              setUser(enhancedUser);
            }
          }
        } catch (error) {
          console.error("Unexpected error fetching user profile:", error);
        }
      } else {
        setAccountType(null);
        setRole(null);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link to sign in.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name?: string, 
    accountType: AccountType = "CLIENT", 
    role: UserRole = "STANDARD"
  ): Promise<string | undefined> => {
    setIsLoading(true);
    try {
      // Add metadata including name, account_type, and role
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
      
      if (error) throw error;
      
      return data?.user?.id;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for signOut to match component naming
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for signOut to match component naming
  const logout = signOut;

  const refreshUserData = async () => {
    if (user) {
      try {
        // Refresh the user session first
        const { data: { user: refreshedUser } } = await supabase.auth.getUser();
        
        // Then fetch the profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('account_type, role, name')
          .eq('id', user.id)
          .single();
  
        if (error) {
          console.error("Error refreshing user profile:", error);
        } else {
          setAccountType(profile?.account_type || null);
          setRole(profile?.role || null);
          
          // Update user with profile data
          if (refreshedUser) {
            const enhancedUser = {
              ...refreshedUser,
              name: profile?.name || null,
              accountType: profile?.account_type as AccountType || "CLIENT",
              role: profile?.role as UserRole || "STANDARD"
            };
            setUser(enhancedUser);
          }
        }
      } catch (error) {
        console.error("Unexpected error refreshing user profile:", error);
      }
    } else {
      setAccountType(null);
      setRole(null);
    }
  };

  // Inside the AuthProvider component, update or add the updateUserProfile method
  const updateUserProfile = async (userId: string, updates: any) => {
    try {
      // Get the current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      // Call our edge function for updating user profiles with permission checks
      const response = await supabase.functions.invoke('update-user-profile', {
        body: {
          userId,
          updates
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to update user profile');
      }

      // If the user is updating themselves, refresh the auth state
      if (userId === user?.id) {
        await refreshUserData();
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // New method to link with Google
  const linkWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account/linking`
        }
      });
      
      if (error) throw error;
      
      // User will be redirected to Google
    } catch (error: any) {
      console.error("Error linking with Google:", error);
      throw error;
    }
  };

  // Fixed unlinkGoogle method to use the correct type signature
  const unlinkGoogle = async () => {
    try {
      // Get the user's identities first to extract the required fields
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser || !currentUser.identities || currentUser.identities.length === 0) {
        throw new Error("No user identities found");
      }
      
      // Find the Google identity
      const googleIdentity = currentUser.identities.find(identity => identity.provider === 'google');
      
      if (!googleIdentity) {
        throw new Error("No Google identity found to unlink");
      }
      
      // Now use the complete identity object
      const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
      
      if (error) throw error;
      
      await refreshUserData();
    } catch (error: any) {
      console.error("Error unlinking Google:", error);
      throw error;
    }
  };

  // Alias methods to match different naming conventions
  const signup = signUp;

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signup,
    signOut,
    login,
    logout,
    updateUserProfile,
    refreshUserData,
    accountType,
    role,
    signUp,
    linkWithGoogle,
    unlinkGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
