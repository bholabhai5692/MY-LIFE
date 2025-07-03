import {
  users,
  posts,
  categories,
  comments,
  reactions,
  savedPosts,
  settings,
  analytics,
  youtubeCache,
  type User,
  type InsertUser,
  type Post,
  type InsertPost,
  type Category,
  type InsertCategory,
  type Comment,
  type InsertComment,
  type Reaction,
  type InsertReaction,
  type SavedPost,
  type InsertSavedPost,
  type Setting,
  type InsertSetting,
  type Analytics,
  type InsertAnalytics,
  type YoutubeCache,
  type InsertYoutubeCache,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Post methods
  getPosts(filters: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  getPostBySlug(slug: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined>;
  
  // Comment methods
  getCommentsByPost(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, updates: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Reaction methods
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  getReactionsByPost(postId: number): Promise<Reaction[]>;
  
  // Saved posts methods
  getSavedPostsByUser(userId: number): Promise<SavedPost[]>;
  createSavedPost(savedPost: InsertSavedPost): Promise<SavedPost>;
  deleteSavedPost(userId: number, postId: number): Promise<boolean>;
  
  // Settings methods
  getSettings(category?: string): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(key: string, value: string): Promise<Setting | undefined>;
  
  // Analytics methods
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByPost(postId: number): Promise<Analytics[]>;
  getDashboardStats(): Promise<{
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
  }>;
  
  // YouTube cache methods
  getYoutubeCache(videoId: string): Promise<YoutubeCache | undefined>;
  createYoutubeCache(cache: InsertYoutubeCache): Promise<YoutubeCache>;
  cleanOldYoutubeCache(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private posts: Map<number, Post> = new Map();
  private categories: Map<number, Category> = new Map();
  private comments: Map<number, Comment> = new Map();
  private reactions: Map<number, Reaction> = new Map();
  private savedPosts: Map<number, SavedPost> = new Map();
  private settings: Map<string, Setting> = new Map();
  private analytics: Map<number, Analytics> = new Map();
  private youtubeCache: Map<string, YoutubeCache> = new Map();
  
  private currentUserId = 1;
  private currentPostId = 1;
  private currentCategoryId = 1;
  private currentCommentId = 1;
  private currentReactionId = 1;
  private currentSavedPostId = 1;
  private currentSettingId = 1;
  private currentAnalyticsId = 1;
  private currentYoutubeCacheId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default categories
    const defaultCategories = [
      { name: "Trending News", description: "Latest trending news from around the world", color: "#FF6B6B", icon: "📰", isActive: true, isTrending: true, postCount: 15 },
      { name: "Viral Videos", description: "Most viral videos on the internet", color: "#4ECDC4", icon: "📹", isActive: true, isTrending: true, postCount: 28 },
      { name: "Memes & GIFs", description: "Funny memes and trending GIFs", color: "#45B7D1", icon: "😂", isActive: true, isTrending: true, postCount: 42 },
      { name: "Listicles", description: "Top 10 lists and viral content", color: "#96CEB4", icon: "📝", isActive: true, isTrending: false, postCount: 12 },
      { name: "Polls & Quizzes", description: "Interactive polls and fun quizzes", color: "#FFEAA7", icon: "📊", isActive: true, isTrending: false, postCount: 8 },
      { name: "Technology", description: "Latest tech news and innovations", color: "#FF7675", icon: "💻", isActive: true, isTrending: true, postCount: 23 },
    ];

    defaultCategories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        ...cat,
        createdAt: new Date().toISOString(),
      };
      this.categories.set(category.id, category);
    });

    // Create default admin user
    const adminUser: User = {
      id: this.currentUserId++,
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
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample posts
    const samplePosts = [
      {
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
      },
      {
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
      },
      {
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
      }
    ];

    samplePosts.forEach(postData => {
      const post: Post = {
        id: this.currentPostId++,
        ...postData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.posts.set(post.id, post);
    });

    // Create default settings
    const defaultSettings = [
      { key: "site_title", value: "BuzzHub", category: "general", description: "Website title" },
      { key: "site_description", value: "Your ultimate destination for viral content", category: "general", description: "Website description" },
      { key: "posts_per_page", value: "20", category: "content", description: "Number of posts per page" },
      { key: "enable_comments", value: "true", category: "content", description: "Allow comments on posts" },
      { key: "auto_approve_comments", value: "false", category: "content", description: "Auto-approve new comments" },
    ];

    defaultSettings.forEach(settingData => {
      const setting: Setting = {
        id: this.currentSettingId++,
        ...settingData,
        updatedAt: new Date().toISOString(),
      };
      this.settings.set(setting.key, setting);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      badges: insertUser.badges || [],
      bloggerConnected: insertUser.bloggerConnected || false,
      workingScore: insertUser.workingScore || 0,
      isActive: insertUser.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Post methods
  async getPosts(filters: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Post[]> {
    let allPosts = Array.from(this.posts.values());

    if (filters.category) {
      allPosts = allPosts.filter(post => post.category === filters.category);
    }

    if (filters.status) {
      allPosts = allPosts.filter(post => post.status === filters.status);
    }

    // Sort by creation date (newest first)
    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    
    return allPosts.slice(offset, offset + limit);
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostBySlug(slug: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(post => post.slug === slug);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const post: Post = {
      id: this.currentPostId++,
      ...insertPost,
      views: insertPost.views || 0,
      likes: insertPost.likes || 0,
      comments: insertPost.comments || 0,
      shares: insertPost.shares || 0,
      isTrending: insertPost.isTrending || false,
      isFeatured: insertPost.isFeatured || false,
      seoScore: insertPost.seoScore || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.posts.set(post.id, post);
    return post;
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;

    const updatedPost = {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      id: this.currentCategoryId++,
      ...insertCategory,
      isActive: insertCategory.isActive !== false,
      isTrending: insertCategory.isTrending || false,
      postCount: insertCategory.postCount || 0,
      createdAt: new Date().toISOString(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  // Comment methods
  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(comment => comment.postId === postId);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comment: Comment = {
      id: this.currentCommentId++,
      ...insertComment,
      isApproved: insertComment.isApproved || false,
      isSpam: insertComment.isSpam || false,
      reactions: insertComment.reactions || {},
      createdAt: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;

    const updatedComment = { ...comment, ...updates };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Reaction methods
  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    const reaction: Reaction = {
      id: this.currentReactionId++,
      ...insertReaction,
      createdAt: new Date().toISOString(),
    };
    this.reactions.set(reaction.id, reaction);
    return reaction;
  }

  async getReactionsByPost(postId: number): Promise<Reaction[]> {
    return Array.from(this.reactions.values()).filter(reaction => reaction.postId === postId);
  }

  // Saved posts methods
  async getSavedPostsByUser(userId: number): Promise<SavedPost[]> {
    return Array.from(this.savedPosts.values()).filter(saved => saved.userId === userId);
  }

  async createSavedPost(insertSavedPost: InsertSavedPost): Promise<SavedPost> {
    const savedPost: SavedPost = {
      id: this.currentSavedPostId++,
      ...insertSavedPost,
      createdAt: new Date().toISOString(),
    };
    this.savedPosts.set(savedPost.id, savedPost);
    return savedPost;
  }

  async deleteSavedPost(userId: number, postId: number): Promise<boolean> {
    const savedPost = Array.from(this.savedPosts.values())
      .find(saved => saved.userId === userId && saved.postId === postId);
    
    if (savedPost) {
      return this.savedPosts.delete(savedPost.id);
    }
    return false;
  }

  // Settings methods
  async getSettings(category?: string): Promise<Setting[]> {
    let allSettings = Array.from(this.settings.values());
    
    if (category) {
      allSettings = allSettings.filter(setting => setting.category === category);
    }
    
    return allSettings;
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }

  async createSetting(insertSetting: InsertSetting): Promise<Setting> {
    const setting: Setting = {
      id: this.currentSettingId++,
      ...insertSetting,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(setting.key, setting);
    return setting;
  }

  async updateSetting(key: string, value: string): Promise<Setting | undefined> {
    const setting = this.settings.get(key);
    if (!setting) return undefined;

    const updatedSetting = {
      ...setting,
      value,
      updatedAt: new Date().toISOString(),
    };
    this.settings.set(key, updatedSetting);
    return updatedSetting;
  }

  // Analytics methods
  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const analytics: Analytics = {
      id: this.currentAnalyticsId++,
      ...insertAnalytics,
      createdAt: new Date().toISOString(),
    };
    this.analytics.set(analytics.id, analytics);
    return analytics;
  }

  async getAnalyticsByPost(postId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(analytics => analytics.postId === postId);
  }

  async getDashboardStats(): Promise<{
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
  }> {
    const allPosts = Array.from(this.posts.values());
    const allUsers = Array.from(this.users.values());
    
    const totalPosts = allPosts.length;
    const totalViews = allPosts.reduce((sum, post) => sum + post.views, 0);
    const totalEngagement = allPosts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0);
    const activeUsers = allUsers.filter(user => user.isActive).length;

    return {
      totalPosts,
      totalViews,
      totalEngagement,
      activeUsers,
      monthlyGrowth: {
        posts: 12,
        views: 18,
        engagement: 25,
        users: 8,
      },
    };
  }

  // YouTube cache methods
  async getYoutubeCache(videoId: string): Promise<YoutubeCache | undefined> {
    return this.youtubeCache.get(videoId);
  }

  async createYoutubeCache(insertCache: InsertYoutubeCache): Promise<YoutubeCache> {
    const cache: YoutubeCache = {
      id: this.currentYoutubeCacheId++,
      ...insertCache,
      createdAt: new Date().toISOString(),
    };
    this.youtubeCache.set(cache.videoId, cache);
    return cache;
  }

  async cleanOldYoutubeCache(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    for (const [videoId, cache] of this.youtubeCache.entries()) {
      if (new Date(cache.createdAt) < thirtyDaysAgo) {
        this.youtubeCache.delete(videoId);
      }
    }
  }
}

export const storage = new MemStorage();
