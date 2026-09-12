import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../generated/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (pin: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const session = await SecureStore.getItemAsync('userSession');
      if (session) {
        setUser(JSON.parse(session));
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (pin: string): Promise<boolean> => {
    try {
      // Simple PIN authentication - replace with WorkOS in production
      if (pin === '1234') {
        const userData: User = {
          id: 'local-admin',
          name: 'Admin User',
          email: 'admin@decimal.dev',
          role: 'administrator',
        };
        await SecureStore.setItemAsync('userSession', JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Sign in error:', err);
      return false;
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('userSession');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
