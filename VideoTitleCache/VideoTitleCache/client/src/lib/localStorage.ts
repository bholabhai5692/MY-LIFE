export class LocalStorageManager {
  private static instance: LocalStorageManager;
  
  private constructor() {
    this.initializeDefaultData();
  }
  
  static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }
  
  save<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
  
  load<T>(key: string): T | null {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) return null;
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }
  
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
  
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
  
  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
  
  // Backup all data
  backup(): string {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allData[key] = this.load(key);
      }
    }
    return JSON.stringify(allData);
  }
  
  // Restore from backup
  restore(backupData: string): void {
    try {
      const data = JSON.parse(backupData);
      Object.keys(data).forEach(key => {
        this.save(key, data[key]);
      });
    } catch (error) {
      console.error('Error restoring from backup:', error);
    }
  }

  // Initialize default data if not exists
  private initializeDefaultData(): void {
    // Initialize users array if empty
    if (!this.exists('users')) {
      const defaultUsers = [
        {
          id: 1,
          username: "admin",
          email: "admin@buzzhub.com",
          password: "admin123",
          role: "super_admin",
          badges: ["Admin", "Founder", "Top Creator"],
          bloggerConnected: false,
          workingScore: 1000,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      this.save('users', defaultUsers);
    }

    // Initialize categories if empty
    if (!this.exists('categories')) {
      const defaultCategories = [
        { id: 1, name: "Trending News", description: "Latest trending news from around the world", color: "#FF6B6B", icon: "📰", isActive: true, isTrending: true, postCount: 15, createdAt: new Date().toISOString() },
        { id: 2, name: "Viral Videos", description: "Most viral videos on the internet", color: "#4ECDC4", icon: "📹", isActive: true, isTrending: true, postCount: 28, createdAt: new Date().toISOString() },
        { id: 3, name: "Memes & GIFs", description: "Funny memes and trending GIFs", color: "#45B7D1", icon: "😂", isActive: true, isTrending: true, postCount: 42, createdAt: new Date().toISOString() },
        { id: 4, name: "Listicles", description: "Top 10 lists and viral content", color: "#96CEB4", icon: "📝", isActive: true, isTrending: false, postCount: 12, createdAt: new Date().toISOString() },
        { id: 5, name: "Polls & Quizzes", description: "Interactive polls and fun quizzes", color: "#FFEAA7", icon: "📊", isActive: true, isTrending: false, postCount: 8, createdAt: new Date().toISOString() },
        { id: 6, name: "Technology", description: "Latest tech news and innovations", color: "#FF7675", icon: "💻", isActive: true, isTrending: true, postCount: 23, createdAt: new Date().toISOString() },
      ];
      this.save('categories', defaultCategories);
    }

    // Initialize posts if empty
    if (!this.exists('posts')) {
      const defaultPosts = [
        {
          id: 1,
          title: "This AI-Generated City is Breaking the Internet! 🤯",
          content: "An incredible AI-generated cityscape has gone viral on social media, leaving viewers amazed at the level of detail and realism. The image, created using advanced machine learning algorithms, showcases a futuristic metropolis with towering skyscrapers, intricate street layouts, and stunning lighting effects that rival real photography.",
          slug: "ai-generated-city-breaking-internet",
          excerpt: "An incredible AI-generated cityscape has gone viral on social media, leaving viewers amazed at the level of detail and realism...",
          featuredImage: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
          category: "Technology",
          tags: ["AI", "Technology", "Viral", "Art"],
          status: "published",
          seoScore: 95,
          views: 12543,
          likes: 2341,
          comments: 456,
          shares: 789,
          isTrending: true,
          isFeatured: true,
          authorId: 1,
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Cat Goes Viral with Epic Yarn Ball Performance! 🐱",
          content: "A hilarious video of a cat's elaborate yarn ball performance has taken the internet by storm. The feline's acrobatic moves and comedic timing have earned millions of views and countless shares across social media platforms.",
          slug: "cat-viral-yarn-ball-performance",
          excerpt: "A hilarious video of a cat's elaborate yarn ball performance has taken the internet by storm...",
          featuredImage: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
          category: "Viral Videos",
          tags: ["Cats", "Funny", "Viral", "Animals"],
          status: "published",
          seoScore: 88,
          views: 8976,
          likes: 1456,
          comments: 234,
          shares: 567,
          isTrending: true,
          isFeatured: false,
          authorId: 1,
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          title: "Hidden Mountain Paradise Discovered by Drone! 🏔️",
          content: "A breathtaking mountain paradise has been captured by drone footage, revealing stunning landscapes that few have ever seen. The pristine wilderness showcases snow-capped peaks, crystal-clear lakes, and untouched forests that seem almost too beautiful to be real.",
          slug: "hidden-mountain-paradise-drone",
          excerpt: "A breathtaking mountain paradise has been captured by drone footage, revealing stunning landscapes that few have ever seen...",
          featuredImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
          category: "Trending News",
          tags: ["Nature", "Travel", "Drone", "Photography"],
          status: "published",
          seoScore: 92,
          views: 15432,
          likes: 2890,
          comments: 412,
          shares: 678,
          isTrending: true,
          isFeatured: false,
          authorId: 1,
          publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      this.save('posts', defaultPosts);
    }

    // Initialize dashboard stats if empty
    if (!this.exists('dashboard_stats')) {
      const defaultStats = {
        totalPosts: 3,
        totalViews: 36951,
        totalEngagement: 8746,
        activeUsers: 127,
        monthlyGrowth: { 
          posts: 15, 
          views: 23, 
          engagement: 18, 
          users: 12 
        }
      };
      this.save('dashboard_stats', defaultStats);
    }

    // Initialize saved posts if empty
    if (!this.exists('saved_posts')) {
      this.save('saved_posts', []);
    }

    // Initialize comments if empty
    if (!this.exists('comments')) {
      this.save('comments', []);
    }

    // Initialize reactions if empty
    if (!this.exists('reactions')) {
      this.save('reactions', []);
    }

    // Initialize settings if empty
    if (!this.exists('settings')) {
      const defaultSettings = [
        { id: 1, key: "site_title", value: "BuzzHub", category: "general", description: "Website title", updatedAt: new Date().toISOString() },
        { id: 2, key: "site_description", value: "Your ultimate destination for viral content", category: "general", description: "Website description", updatedAt: new Date().toISOString() },
        { id: 3, key: "posts_per_page", value: "20", category: "content", description: "Number of posts per page", updatedAt: new Date().toISOString() },
        { id: 4, key: "enable_comments", value: "true", category: "content", description: "Allow comments on posts", updatedAt: new Date().toISOString() },
        { id: 5, key: "auto_approve_comments", value: "false", category: "content", description: "Auto-approve new comments", updatedAt: new Date().toISOString() },
      ];
      this.save('settings', defaultSettings);
    }
  }
}

// YouTube Title Cache Management
export class YouTubeCacheManager {
  private static readonly CACHE_KEY = 'youtube_titles_cache';
  private static readonly CACHE_EXPIRY_DAYS = 30;
  private localStorage: LocalStorageManager;
  
  constructor() {
    this.localStorage = LocalStorageManager.getInstance();
  }
  
  private getCacheData(): Record<string, { title: string; timestamp: number }> {
    return this.localStorage.load<Record<string, { title: string; timestamp: number }>>(
      YouTubeCacheManager.CACHE_KEY
    ) || {};
  }
  
  private saveCacheData(data: Record<string, { title: string; timestamp: number }>): void {
    this.localStorage.save(YouTubeCacheManager.CACHE_KEY, data);
  }
  
  saveTitle(videoId: string, title: string): void {
    const cache = this.getCacheData();
    cache[videoId] = {
      title,
      timestamp: Date.now()
    };
    this.saveCacheData(cache);
  }
  
  hasVideo(videoId: string): boolean {
    const cache = this.getCacheData();
    return cache.hasOwnProperty(videoId);
  }
  
  getTitle(videoId: string): string | null {
    const cache = this.getCacheData();
    return cache[videoId]?.title || null;
  }
  
  getAllTitles(): Array<{ videoId: string; title: string; timestamp: number }> {
    const cache = this.getCacheData();
    return Object.entries(cache).map(([videoId, data]) => ({
      videoId,
      title: data.title,
      timestamp: data.timestamp
    }));
  }
  
  cleanOldEntries(): void {
    const cache = this.getCacheData();
    const expiryTime = Date.now() - (YouTubeCacheManager.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    
    Object.keys(cache).forEach(videoId => {
      if (cache[videoId].timestamp < expiryTime) {
        delete cache[videoId];
      }
    });
    
    this.saveCacheData(cache);
  }
  
  clearCache(): void {
    this.localStorage.remove(YouTubeCacheManager.CACHE_KEY);
  }
}

// Export singleton instances
export const localStorageManager = LocalStorageManager.getInstance();
export const youtubeCacheManager = new YouTubeCacheManager();
