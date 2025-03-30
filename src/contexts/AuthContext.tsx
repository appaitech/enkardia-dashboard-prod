
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "admin" | "user";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample user data for demo purposes
const SAMPLE_USERS = [
  { 
    id: "1", 
    email: "admin@example.com", 
    password: "admin123", 
    name: "Admin User", 
    role: "admin" as UserRole 
  },
  { 
    id: "2", 
    email: "user@example.com", 
    password: "user123", 
    name: "Regular User", 
    role: "user" as UserRole 
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulating API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching credentials
      const matchedUser = SAMPLE_USERS.find(
        u => u.email === email && u.password === password
      );
      
      if (matchedUser) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = matchedUser;
        setUser(userWithoutPassword);
        
        // Store user in localStorage
        localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword));
        
        // Redirect based on role
        toast.success("Login successful!");
        
        if (userWithoutPassword.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
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
