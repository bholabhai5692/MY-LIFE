interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

export class CookieManager {
  private static instance: CookieManager;
  
  private constructor() {}
  
  static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  set(name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (options.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    
    if (options.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }
    
    if (options.path) {
      cookieString += `; path=${options.path}`;
    }
    
    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    if (options.secure) {
      cookieString += '; secure';
    }
    
    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }
    
    document.cookie = cookieString;
  }

  get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    
    return null;
  }

  remove(name: string, path?: string, domain?: string): void {
    this.set(name, '', {
      expires: new Date(0),
      path: path || '/',
      domain: domain
    });
  }

  exists(name: string): boolean {
    return this.get(name) !== null;
  }

  getAll(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieStrings = document.cookie.split(';');
    
    for (let cookie of cookieStrings) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }
    
    return cookies;
  }

  clear(): void {
    const cookies = this.getAll();
    for (let name in cookies) {
      this.remove(name);
    }
  }

  // Theme-specific methods
  setTheme(theme: 'light' | 'dark'): void {
    this.set('theme', theme, {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      path: '/'
    });
  }

  getTheme(): 'light' | 'dark' | null {
    const theme = this.get('theme');
    return theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : null;
  }
}

export class AuthCookieManager {
  private static readonly AUTH_TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_DATA_KEY = 'user_data';
  private static readonly TOKEN_EXPIRY_DAYS = 7;
  private cookieManager = CookieManager.getInstance();

  setAuthToken(token: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + AuthCookieManager.TOKEN_EXPIRY_DAYS);
    
    this.cookieManager.set(AuthCookieManager.AUTH_TOKEN_KEY, token, {
      expires: expiryDate,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax'
    });
  }

  getAuthToken(): string | null {
    return this.cookieManager.get(AuthCookieManager.AUTH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (AuthCookieManager.TOKEN_EXPIRY_DAYS * 2));
    
    this.cookieManager.set(AuthCookieManager.REFRESH_TOKEN_KEY, token, {
      expires: expiryDate,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax'
    });
  }

  getRefreshToken(): string | null {
    return this.cookieManager.get(AuthCookieManager.REFRESH_TOKEN_KEY);
  }

  setUserData(userData: Record<string, any>): void {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + AuthCookieManager.TOKEN_EXPIRY_DAYS);
    
    this.cookieManager.set(AuthCookieManager.USER_DATA_KEY, JSON.stringify(userData), {
      expires: expiryDate,
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'lax'
    });
  }

  getUserData(): Record<string, any> | null {
    const data = this.cookieManager.get(AuthCookieManager.USER_DATA_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      return null;
    }
  }

  clearAuth(): void {
    this.cookieManager.remove(AuthCookieManager.AUTH_TOKEN_KEY);
    this.cookieManager.remove(AuthCookieManager.REFRESH_TOKEN_KEY);
    this.cookieManager.remove(AuthCookieManager.USER_DATA_KEY);
  }

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  isTokenExpired(): boolean {
    const token = this.getAuthToken();
    if (!token) return true;
    
    try {
      // Simple token format: base64 encoded JSON with expiry
      const tokenData = JSON.parse(atob(token.split('.')[1] || ''));
      const now = Math.floor(Date.now() / 1000);
      return tokenData.exp < now;
    } catch (error) {
      return true;
    }
  }

  generateToken(userId: number, role: string): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const payload = {
      userId,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (AuthCookieManager.TOKEN_EXPIRY_DAYS * 24 * 60 * 60)
    };
    
    // Simple token generation (in production, use proper JWT library)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    return `${encodedHeader}.${encodedPayload}.signature`;
  }

  refreshTokenIfNeeded(): boolean {
    if (this.isTokenExpired()) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        // In a real app, you'd make an API call here
        // For now, we'll just generate a new token
        const userData = this.getUserData();
        if (userData) {
          const newToken = this.generateToken(userData.id, userData.role);
          this.setAuthToken(newToken);
          return true;
        }
      }
      return false;
    }
    return true;
  }
}

export const cookieManager = CookieManager.getInstance();
export const authCookieManager = new AuthCookieManager();