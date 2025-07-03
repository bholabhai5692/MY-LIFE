// Re-export all types from shared schema
export * from '../../../shared/schema';

// Admin-specific types
export interface AdminSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  totalEngagement: number;
  activeUsers: number;
  monthlyGrowth: {
    posts: number;
    views: number;
    engagement: number;
    users: number;
  };
}

export interface BlogConfig {
  category: string;
  cohereApiKey: string;
  keywords: string[];
  tone: 'professional' | 'casual' | 'technical' | 'friendly';
  length: 'short' | 'medium' | 'long';
  includeImages: boolean;
  autoPublish: boolean;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  profileImage?: string;
  isActive: boolean;
}

export interface SEOMetrics {
  title: {
    score: number;
    length: number;
    hasKeywords: boolean;
  };
  description: {
    score: number;
    length: number;
    hasKeywords: boolean;
  };
  content: {
    score: number;
    wordCount: number;
    hasHeadings: boolean;
    hasImages: boolean;
  };
  keywords: {
    score: number;
    density: number;
    distribution: number;
  };
  overall: {
    score: number;
    grade: string;
    suggestions: string[];
  };
}

export interface NotificationConfig {
  id: string;
  type: 'email' | 'push' | 'sms';
  title: string;
  enabled: boolean;
  recipients: string[];
  template: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  isActive: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
  ipWhitelist: string[];
  corsOrigins: string[];
}

export interface BackupConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  includeMedia: boolean;
  encryptBackups: boolean;
  lastBackup?: Date;
  nextBackup?: Date;
}

export interface AnalyticsData {
  pageViews: number[];
  uniqueVisitors: number[];
  bounceRate: number;
  avgSessionDuration: number;
  topPages: { path: string; views: number }[];
  trafficSources: { source: string; visitors: number }[];
  devices: { type: string; percentage: number }[];
  locations: { country: string; visitors: number }[];
}

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
  uploadedBy: number;
  isPublic: boolean;
}

export interface YoutubeVideoCache {
  videoId: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  channelTitle?: string;
  cachedAt: Date;
}

export interface ExportFormat {
  type: 'json' | 'csv' | 'xml' | 'pdf';
  filename: string;
  data: any;
  size: number;
  createdAt: Date;
}