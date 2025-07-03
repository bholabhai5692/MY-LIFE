import { useState, useEffect } from 'react';
import { authCookieManager } from '@/lib/cookies';
import { dataService } from '@/lib/dataService';
import { AuthUser } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on component mount
    const checkAuth = () => {
      if (authCookieManager.isAuthenticated() && !authCookieManager.isTokenExpired()) {
        const userData = authCookieManager.getUserData();
        if (userData) {
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            isActive: userData.isActive,
            badges: userData.badges,
            profileImage: userData.profileImage,
          });
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Set up token refresh interval
    const refreshInterval = setInterval(() => {
      if (authCookieManager.isAuthenticated()) {
        authCookieManager.refreshTokenIfNeeded();
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userData = dataService.getUserByEmail(email);
      
      if (!userData) {
        throw new Error('User not found');
      }

      // Simple password check (in production, use proper hashing)
      if (userData.password !== password) {
        throw new Error('Invalid credentials');
      }

      if (!userData.isActive) {
        throw new Error('Account is inactive');
      }

      // Generate and store tokens
      const authToken = authCookieManager.generateToken(userData.id, userData.role);
      const refreshToken = authCookieManager.generateToken(userData.id, userData.role);

      authCookieManager.setAuthToken(authToken);
      authCookieManager.setRefreshToken(refreshToken);
      authCookieManager.setUserData({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
        badges: userData.badges,
        profileImage: userData.profileImage,
      });

      const newUser: AuthUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        isActive: userData.isActive,
        badges: userData.badges,
        profileImage: userData.profileImage,
      };

      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    authCookieManager.clearAuth();
    setUser(null);
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = dataService.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUserData = dataService.createUser({
        username,
        email,
        password,
        role: 'user',
        isActive: true,
        badges: [],
        workingScore: 0,
        bloggerConnected: false,
      });

      // Auto-login after registration
      await login(email, password);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>): Promise<boolean> => {
    try {
      if (!user) return false;

      const updatedUser = dataService.updateUser(user.id, updates);
      if (!updatedUser) return false;

      const newUser: AuthUser = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        badges: updatedUser.badges,
        profileImage: updatedUser.profileImage,
      };

      setUser(newUser);
      authCookieManager.setUserData(newUser);
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['admin', 'super_admin']);
  };

  const canEdit = (): boolean => {
    return hasAnyRole(['admin', 'super_admin', 'editor', 'author']);
  };

  const canDelete = (): boolean => {
    return hasAnyRole(['admin', 'super_admin']);
  };

  const canManageUsers = (): boolean => {
    return hasAnyRole(['admin', 'super_admin']);
  };

  const canViewAnalytics = (): boolean => {
    return hasAnyRole(['admin', 'super_admin', 'editor']);
  };

  const canAccessAdminPanel = (): boolean => {
    return hasAnyRole(['admin', 'super_admin', 'editor', 'author']);
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    hasRole,
    hasAnyRole,
    isAdmin,
    canEdit,
    canDelete,
    canManageUsers,
    canViewAnalytics,
    canAccessAdminPanel,
    isAuthenticated: !!user,
  };
}