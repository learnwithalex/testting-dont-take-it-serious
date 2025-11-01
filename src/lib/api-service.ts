export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  authToken?: string;
  expiresAt?: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  bio?: string | null;
  walletAddress?: string | null;
  isActive: boolean;
  isSuspended: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

export interface AuthResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  message?: string;
  error?: string;
  code?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Get tokens and send them as cookies in the Cookie header
    if (typeof window !== 'undefined') {
      const cookieTokens = this.getTokensForCookieHeader();
      if (cookieTokens) {
        headers['Cookie'] = cookieTokens;
      }
    }

    return headers;
  }

  private getTokensForCookieHeader(): string | null {
    if (typeof window === 'undefined') return null;
    
    const tokens: string[] = [];
    
    // Get auth-token (longer-lived token)
    const authToken = this.getCookieValue('auth-token') || localStorage.getItem('auth_token');
    if (authToken) {
      tokens.push(`auth-token=${authToken}`);
    }
    
    // Get access-token
    const accessToken = this.getCookieValue('access-token') || localStorage.getItem('access_token');
    if (accessToken) {
      tokens.push(`access-token=${accessToken}`);
    }
    
    return tokens.length > 0 ? tokens.join('; ') : null;
  }

  private getCookieValue(name: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookies first - prioritize auth-token as it's longer-lived
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        return value;
      }
    }
    
    // Fallback to access-token
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access-token') {
        return value;
      }
    }
    
    // Fallback to localStorage
    return localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  }

  private setTokens(tokens: any): void {
    if (typeof window === 'undefined') return;
    
    // Set cookies with correct names expected by backend
    const isSecure = process.env.NODE_ENV === 'production';
    const sameSite = isSecure ? 'none' : 'lax';
    
    if (tokens.accessToken) {
      document.cookie = `access-token=${tokens.accessToken}; path=/; ${isSecure ? 'secure;' : ''} samesite=${sameSite}; max-age=${15 * 60}`; // 15 minutes
    }
    
    if (tokens.authToken) {
      document.cookie = `auth-token=${tokens.authToken}; path=/; ${isSecure ? 'secure;' : ''} samesite=${sameSite}; max-age=${24 * 60 * 60}`; // 24 hours
    }
    
    if (tokens.refreshToken) {
      document.cookie = `refresh-token=${tokens.refreshToken}; path=/; ${isSecure ? 'secure;' : ''} samesite=${sameSite}; max-age=${7 * 24 * 60 * 60}`; // 7 days
    }
    
    // Also store in localStorage as backup
    if (tokens.accessToken) localStorage.setItem('access_token', tokens.accessToken);
    if (tokens.authToken) localStorage.setItem('auth_token', tokens.authToken);
    if (tokens.refreshToken) localStorage.setItem('refresh_token', tokens.refreshToken);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    // Clear all token cookies
    document.cookie = 'access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = this.getAuthHeaders();

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
          code: data.code,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(emailOrUsername: string, password: string, rememberMe = false): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.makeRequest<{ user: User; tokens: AuthTokens }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        emailOrUsername,
        password,
        rememberMe,
      }),
    });

    if (response.success && response.data?.tokens) {
      this.setTokens(response.data.tokens);
    }

    return response;
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    walletAddress?: string;
    bio?: string;
  }): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.makeRequest<{ user: User; tokens: AuthTokens }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.tokens) {
      this.setTokens(response.data.tokens);
    }

    return response;
  }

  async logout(): Promise<{ success: boolean }> {
    const response = await this.makeRequest('/api/auth/logout', {
      method: 'POST',
    });

    this.clearTokens();
    return { success: response.success };
  }

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest<{ user: User }>('/api/auth/me');
  }

  async refreshToken(): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.makeRequest<{ user: User; tokens: AuthTokens }>('/api/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.data?.tokens) {
      this.setTokens(response.data.tokens);
    }

    return response;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return this.makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // NFT methods
  async getNFTs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    isListed?: boolean;
    creatorId?: string;
    ownerId?: string;
    collectionId?: string;
    search?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/nfts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getNFT(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/nfts/${id}`);
  }

  async createNFT(nftData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/nfts', {
      method: 'POST',
      body: JSON.stringify(nftData),
    });
  }

  async updateNFT(id: string, nftData: any): Promise<ApiResponse> {
    return this.makeRequest(`/api/nfts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(nftData),
    });
  }

  async deleteNFT(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/nfts/${id}`, {
      method: 'DELETE',
    });
  }

  // Collection methods
  async getCollections(params?: {
    page?: number;
    limit?: number;
    creatorId?: string;
    query?: string;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/collections${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getCollection(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/collections/${id}`);
  }

  async createCollection(collectionData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/collections', {
      method: 'POST',
      body: JSON.stringify(collectionData),
    });
  }

  async updateCollection(id: string, collectionData: any): Promise<ApiResponse> {
    return this.makeRequest(`/api/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collectionData),
    });
  }

  async deleteCollection(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // Auction methods
  async getAuctions(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    creatorId?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/auctions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async createAuction(auctionData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/auctions', {
      method: 'POST',
      body: JSON.stringify(auctionData),
    });
  }

  async getAuctionBids(auctionId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/auctions/${auctionId}/bids`);
  }

  async placeBid(auctionId: string, bidData: any): Promise<ApiResponse> {
    return this.makeRequest(`/api/auctions/${auctionId}/bids`, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  // Transaction methods
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    nftId?: string;
    type?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async createTransaction(transactionData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  // User methods
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isVerified?: boolean;
  }): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async getUser(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/users/${id}`);
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    return this.makeRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin methods
  async getAdminDashboard(): Promise<ApiResponse> {
    return this.makeRequest('/api/admin/dashboard');
  }

  async getSystemSettings(): Promise<ApiResponse> {
    return this.makeRequest('/api/admin/settings');
  }

  async updateSystemSettings(settings: any): Promise<ApiResponse> {
    return this.makeRequest('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async createSystemSetting(setting: any): Promise<ApiResponse> {
    return this.makeRequest('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(setting),
    });
  }

  async deleteSystemSetting(key: string): Promise<ApiResponse> {
    return this.makeRequest('/api/admin/settings', {
      method: 'DELETE',
      body: JSON.stringify({ key }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;