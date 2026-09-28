import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, VictimProfile } from '../types';
import { api } from './api';

interface AuthContextType {
  user: UserProfile | null;
  victim: VictimProfile | null;
  role: UserRole;
  isLoading: boolean;
  loginWithCredentials: (identifier: string, password?: string, expectedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('victim');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [victim, setVictim] = useState<VictimProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate existing session on mount — DO NOT auto-login as any demo user
  useEffect(() => {
    const checkSession = async () => {
      const saved = localStorage.getItem('sih_portal_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.user && parsed.role) {
            const meRes = await api.getCurrentUser(parsed.role);
            if (meRes && meRes.user) {
              setUser(meRes.user);
              setVictim(meRes.victim || null);
              setRole(meRes.user.role);
              setIsLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn("Session restore error:", e);
          localStorage.removeItem('sih_portal_session');
        }
      }
      // If no valid session, remain strictly unauthenticated
      setUser(null);
      setVictim(null);
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const loginWithCredentials = async (
    identifier: string, 
    password?: string, 
    expectedRole?: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await api.login({ identifier, password, role: expectedRole });
      if (res && res.user) {
        const authenticatedRole = res.user.role as UserRole;

        // Strict role validation against database-backed authorized profile
        if (expectedRole && expectedRole !== authenticatedRole) {
          const isDistrictOrAdmin = 
            (expectedRole === 'district_officer' && authenticatedRole === 'admin') ||
            (expectedRole === 'admin' && authenticatedRole === 'district_officer');
            
          if (!isDistrictOrAdmin) {
            return {
              success: false,
              error: `Access Denied: Your account role is "${authenticatedRole.replace('_', ' ')}", which is not authorized for the ${expectedRole.replace('_', ' ')} portal.`
            };
          }
        }

        setUser(res.user);
        setVictim(res.victim || null);
        setRole(authenticatedRole);

        // Store persistent session
        localStorage.setItem('sih_portal_session', JSON.stringify({
          user: res.user,
          victim: res.victim,
          role: authenticatedRole,
          token: res.token
        }));

        return { success: true };
      }
      return { success: false, error: 'Authentication failed. Please check your credentials.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid login identifier or password.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sih_portal_session');
    setUser(null);
    setVictim(null);
  };

  return (
    <AuthContext.Provider value={{ user, victim, role, isLoading, loginWithCredentials, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
