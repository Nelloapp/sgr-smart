import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from '@/utils/uuid';

export type UserRole = 'admin' | 'waiter' | 'chef' | 'bartender' | 'cashier';

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  name: string;
  role: UserRole;
  email?: string;
  createdAt: string;
}

interface AuthState {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, password: string, name: string, role: UserRole, email?: string) => boolean;
  updateUser: (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => boolean;
  deleteUser: (userId: string) => boolean;
  getUserById: (userId: string) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  initialize: () => void;
}

// Sample users for testing
const SAMPLE_USERS: User[] = [
  {
    id: 'user-1',
    username: 'admin',
    password: 'admin123',
    name: 'Amministratore',
    role: 'admin',
    email: 'admin@ristorante.it',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-2',
    username: 'waiter',
    password: 'waiter123',
    name: 'Mario Rossi',
    role: 'waiter',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-3',
    username: 'chef',
    password: 'chef123',
    name: 'Luigi Bianchi',
    role: 'chef',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-4',
    username: 'bartender',
    password: 'bar123',
    name: 'Anna Verdi',
    role: 'bartender',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-5',
    username: 'cashier',
    password: 'cash123',
    name: 'Giulia Neri',
    role: 'cashier',
    createdAt: new Date().toISOString()
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: SAMPLE_USERS,
      currentUser: null,
      isAuthenticated: false,
      isInitialized: false,
      
      initialize: () => {
        set({ isInitialized: true });
      },
      
      login: (username: string, password: string) => {
        const users = get().users || [];
        const user = users.find(
          u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        
        return false;
      },
      
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
      
      register: (username: string, password: string, name: string, role: UserRole, email?: string) => {
        const users = get().users || [];
        
        // Check if username already exists
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
          Alert.alert('Errore', 'Nome utente già in uso');
          return false;
        }
        
        const newUser: User = {
          id: `user-${uuidv4()}`,
          username,
          password,
          name,
          role,
          email,
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          users: [...(state.users || []), newUser]
        }));
        
        return true;
      },
      
      updateUser: (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => {
        const users = get().users || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          return false;
        }
        
        // Check if username is being updated and already exists
        if (updates.username && 
            users.some(u => u.id !== userId && u.username.toLowerCase() === updates.username?.toLowerCase())) {
          Alert.alert('Errore', 'Nome utente già in uso');
          return false;
        }
        
        const updatedUsers = [...users];
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          ...updates
        };
        
        set({ users: updatedUsers });
        
        // If the current user is being updated, update currentUser as well
        if (get().currentUser?.id === userId) {
          set({ currentUser: updatedUsers[userIndex] });
        }
        
        return true;
      },
      
      deleteUser: (userId: string) => {
        const users = get().users || [];
        
        // Don't allow deleting the last admin
        const admins = users.filter(u => u.role === 'admin');
        const userToDelete = users.find(u => u.id === userId);
        
        if (userToDelete?.role === 'admin' && admins.length <= 1) {
          Alert.alert('Errore', 'Non è possibile eliminare l\'ultimo amministratore');
          return false;
        }
        
        set(state => ({
          users: (state.users || []).filter(u => u.id !== userId)
        }));
        
        // If the current user is being deleted, log out
        if (get().currentUser?.id === userId) {
          get().logout();
        }
        
        return true;
      },
      
      getUserById: (userId: string) => {
        const users = get().users || [];
        return users.find(u => u.id === userId);
      },
      
      getUsersByRole: (role: UserRole) => {
        const users = get().users || [];
        return users.filter(u => u.role === role);
      },
      
      hasPermission: (requiredRole: UserRole | UserRole[]) => {
        const currentUser = get().currentUser;
        
        if (!currentUser) {
          return false;
        }
        
        // Admin has all permissions
        if (currentUser.role === 'admin') {
          return true;
        }
        
        // Check if user has the required role
        if (Array.isArray(requiredRole)) {
          return requiredRole.includes(currentUser.role);
        } else {
          return currentUser.role === requiredRole;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);