import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, VictimProfile } from '../types';
import { api } from './api';

interface AuthContextType {
  user: UserProfile | null;
  victim: VictimProfile | null;
  role: UserRole;
  isLoading: boolean;
  switchRole: (newRole: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('victim');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [victim, setVictim] = useState<VictimProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadRoleProfile = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(targetRole);
      if (res && res.user) {
        setUser(res.user);
        setVictim(res.victim || null);
        setRole(res.user.role);
      }
    } catch (e) {
      console.warn("Failed to load demo profile from API, using client fallback:", e);
      // Client Fallback profiles with valid Hex UUIDs
      const fallbackProfiles: Record<UserRole, UserProfile> = {
        victim: { id: '10000000-0000-0000-0000-000000000001', full_name: 'Sunita Devi (Victim Demo)', email: 'victim@demo.mosje.gov.in', role: 'victim' },
        counsellor: { id: '20000000-0000-0000-0000-000000000002', full_name: 'Dr. Ananya Sharma (Counsellor)', email: 'counsellor@demo.mosje.gov.in', role: 'counsellor' },
        district_officer: { id: '30000000-0000-0000-0000-000000000003', full_name: 'Rajesh Verma (District Officer)', email: 'district@demo.mosje.gov.in', role: 'district_officer' },
        admin: { id: '40000000-0000-0000-0000-000000000004', full_name: 'System Administrator (MoSJE)', email: 'admin@demo.mosje.gov.in', role: 'admin' },
      };
      setUser(fallbackProfiles[targetRole]);
      setRole(targetRole);
      if (targetRole === 'victim') {
        setVictim({
          id: '70000000-0000-0000-0000-000000000001',
          victim_code: 'VIC-2026-101',
          name: 'Sunita Devi',
          age_group: '26-35',
          gender: 'Female'
        });
      } else {
        setVictim(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoleProfile('victim');
  }, []);

  const switchRole = async (newRole: UserRole) => {
    await loadRoleProfile(newRole);
  };

  const logout = () => {
    setUser(null);
    setVictim(null);
  };

  return (
    <AuthContext.Provider value={{ user, victim, role, isLoading, switchRole, logout }}>
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
