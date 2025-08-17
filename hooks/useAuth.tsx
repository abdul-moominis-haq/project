import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// import { authAPI } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  location: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; location: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth token on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // API call (commented out for now)
        // const userData = await authAPI.getCurrentUser();
        // setUser(userData);
        
        // Using dummy data for now
        setUser({
          id: '1',
          name: 'John Farmer',
          email: 'john@example.com',
          location: 'Nairobi, Kenya'
        });
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // API call (commented out for now)
      // const response = await authAPI.login(email, password);
      // localStorage.setItem('authToken', response.token);
      // setUser(response.user);
      
      // Using dummy data for now
      localStorage.setItem('authToken', 'dummy-jwt-token');
      setUser({
        id: '1',
        name: 'John Farmer',
        email,
        location: 'Nairobi, Kenya'
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; location: string }) => {
    setIsLoading(true);
    try {
      // API call (commented out for now)
      // const response = await authAPI.register(userData);
      // localStorage.setItem('authToken', response.token);
      // setUser(response.user);
      
      // Using dummy data for now
      localStorage.setItem('authToken', 'dummy-jwt-token');
      setUser({
        id: '2',
        name: userData.name,
        email: userData.email,
        location: userData.location
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // API call (commented out for now)
      // await authAPI.logout();
      
      localStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      // API call (commented out for now)
      // const updatedUser = await authAPI.updateUser(userData);
      // setUser(updatedUser);
      
      // Using dummy data for now
      if (user) {
        setUser({ ...user, ...userData });
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
