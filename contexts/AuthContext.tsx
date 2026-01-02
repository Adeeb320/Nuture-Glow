import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (url: string) => void;
  updateName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    try {
      const savedUser = localStorage.getItem('ng_auth_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Failed to parse saved user:", err);
      localStorage.removeItem('ng_auth_session');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('ng_mock_users') || '[]');
        const foundUser = users.find((u: any) => u.email === email && u.password === password);

        if (foundUser) {
          const { password: _, ...userSession } = foundUser;
          setUser(userSession);
          localStorage.setItem('ng_auth_session', JSON.stringify(userSession));
          resolve();
        } else {
          // Fallback for demo if no users registered yet
          if (email === 'sarah@example.com' && password === 'password123') {
             const demoUser: User = {
                id: 'u1',
                name: 'Sarah Jenkins',
                email: 'sarah@example.com',
                healthId: 'NG-BD-28394857',
                avatar: 'https://picsum.photos/seed/sarah/100/100',
                verified: 'Verified'
              };
              setUser(demoUser);
              localStorage.setItem('ng_auth_session', JSON.stringify(demoUser));
              resolve();
              return;
          }
          reject(new Error('Invalid email or password'));
        }
      }, 1000);
    });
  };

  const register = async (name: string, email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('ng_mock_users') || '[]');
        if (users.find((u: any) => u.email === email)) {
          reject(new Error('User already exists with this email'));
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password,
          healthId: `NG-BD-${Math.floor(10000000 + Math.random() * 90000000)}`,
          avatar: `https://picsum.photos/seed/${name.replace(/\s+/g, '')}/100/100`,
          verified: 'Not Submitted'
        };

        users.push(newUser);
        localStorage.setItem('ng_mock_users', JSON.stringify(users));

        // Auto-login
        const { password: _, ...userSession } = newUser;
        setUser(userSession as User);
        localStorage.setItem('ng_auth_session', JSON.stringify(userSession));
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ng_auth_session');
  };

  const updateAvatar = (url: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: url };
      setUser(updatedUser);
      localStorage.setItem('ng_auth_session', JSON.stringify(updatedUser));
    }
  };

  const updateName = (newName: string) => {
    if (user) {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      localStorage.setItem('ng_auth_session', JSON.stringify(updatedUser));
      
      const users = JSON.parse(localStorage.getItem('ng_mock_users') || '[]');
      const idx = users.findIndex((u: any) => u.id === user.id);
      if (idx > -1) {
        users[idx].name = newName;
        localStorage.setItem('ng_mock_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateAvatar, updateName }}>
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