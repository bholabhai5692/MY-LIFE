import { localStorageManager, youtubeCacheManager } from './localStorage';
import { seoManager } from './seo';
import { User, Post, Category, Comment, Reaction, SavedPost, Setting, Analytics, DashboardStats } from '@/types';

export class DataService {
  private static instance: DataService;
  
  private constructor() {}
  
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // User methods
  getUsers(): User[] {
    return localStorageManager.load<User[]>('users') || [];
  }

  getUser(id: number): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorageManager.save('users', users);
    return newUser;
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorageManager.save('users', users);
    return users[userIndex];
  }

  deleteUser(id: number): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    if (filteredUsers.length === users.length) return false;
    localStorageManager.save('users', filteredUsers);
    return true;
  }

  // Post methods
  getPosts(): Post[] {
    return localStorageManager.load<Post[]>('posts') || [];
  }

  getPost(id: number): Post | null {
    const posts = this.getPosts();
    return posts.find(post => post.id === id) || null;
  }

  getPostBySlug(slug: string): Post | null {
    const posts = this.getPosts();
    return posts.find(post => post.slug === slug) || null;
  }

  createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
    const posts = this.getPosts();
    
    // Calculate SEO score
    const seoMetrics = seoManager.calculateSEOScore({
      title: postData.title,
      metaDescription: postData.excerpt,
      content: postData.content,
      tags: postData.tags,
    });

    const newPost: Post = {
      id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
      ...postData,
      seoScore: seoMetrics.score,
      slug: postData.slug || seoManager.generateSlug(postData.title),
      excerpt: postData.excerpt || seoManager.generateMetaDescription(postData.content),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    posts.push(newPost);
    localStorageManager.save('posts', posts);
    
    // Update category post count
    this.updateCategoryPostCount(newPost.category);
    
    return newPost;
  }

  updatePost(id: number, updates: Partial<Post>): Post | null {
    const posts = this.getPosts();
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex === -1) return null;

    // Recalculate SEO score if content changed
    if (updates.title || updates.content || updates.tags) {
      const seoMetrics = seoManager.calculateSEOScore({
        title: updates.title || posts[postIndex].title,
        metaDescription: updates.excerpt || posts[postIndex].excerpt,
        content: updates.content || posts[postIndex].content,
        tags: updates.tags || posts[postIndex].tags,
      });
      updates.seoScore = seoMetrics.score;
    }

    posts[postIndex] = {
      ...posts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorageManager.save('posts', posts);
    return posts[postIndex];
  }

  deletePost(id: number): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === id);
    const filteredPosts = posts.filter(post => post.id !== id);
    if (filteredPosts.length === posts.length) return false;
    
    localStorageManager.save('posts', filteredPosts);
    
    // Update category post count
    if (post) {
      this.updateCategoryPostCount(post.category);
    }
    
    return true;
  }

  // Category methods
  getCategories(): Category[] {
    return localStorageManager.load<Category[]>('categories') || [];
  }

  getCategory(id: number): Category | null {
    const categories = this.getCategories();
    return categories.find(cat => cat.id === id) || null;
  }

  createCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Category {
    const categories = this.getCategories();
    const newCategory: Category = {
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      ...categoryData,
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    localStorageManager.save('categories', categories);
    return newCategory;
  }

  updateCategory(id: number, updates: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) return null;

    categories[categoryIndex] = { ...categories[categoryIndex], ...updates };
    localStorageManager.save('categories', categories);
    return categories[categoryIndex];
  }

  deleteCategory(id: number): boolean {
    const categories = this.getCategories();
    const filteredCategories = categories.filter(cat => cat.id !== id);
    if (filteredCategories.length === categories.length) return false;
    localStorageManager.save('categories', filteredCategories);
    return true;
  }

  private updateCategoryPostCount(categoryName: string): void {
    const categories = this.getCategories();
    const posts = this.getPosts();
    const categoryIndex = categories.findIndex(cat => cat.name === categoryName);
    
    if (categoryIndex !== -1) {
      const postCount = posts.filter(post => post.category === categoryName && post.status === 'published').length;
      categories[categoryIndex].postCount = postCount;
      localStorageManager.save('categories', categories);
    }
  }

  // Comment methods
  getComments(): Comment[] {
    return localStorageManager.load<Comment[]>('comments') || [];
  }

  getCommentsByPost(postId: number): Comment[] {
    const comments = this.getComments();
    return comments.filter(comment => comment.postId === postId);
  }

  createComment(commentData: Omit<Comment, 'id' | 'createdAt'>): Comment {
    const comments = this.getComments();
    const newComment: Comment = {
      id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
      ...commentData,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    localStorageManager.save('comments', comments);
    return newComment;
  }

  updateComment(id: number, updates: Partial<Comment>): Comment | null {
    const comments = this.getComments();
    const commentIndex = comments.findIndex(comment => comment.id === id);
    if (commentIndex === -1) return null;

    comments[commentIndex] = { ...comments[commentIndex], ...updates };
    localStorageManager.save('comments', comments);
    return comments[commentIndex];
  }

  deleteComment(id: number): boolean {
    const comments = this.getComments();
    const filteredComments = comments.filter(comment => comment.id !== id);
    if (filteredComments.length === comments.length) return false;
    localStorageManager.save('comments', filteredComments);
    return true;
  }

  // Saved Posts methods
  getSavedPosts(): SavedPost[] {
    return localStorageManager.load<SavedPost[]>('saved_posts') || [];
  }

  getSavedPostsByUser(userId: number): SavedPost[] {
    const savedPosts = this.getSavedPosts();
    return savedPosts.filter(saved => saved.userId === userId);
  }

  savePost(userId: number, postId: number): SavedPost {
    const savedPosts = this.getSavedPosts();
    const newSavedPost: SavedPost = {
      id: savedPosts.length > 0 ? Math.max(...savedPosts.map(s => s.id)) + 1 : 1,
      userId,
      postId,
      createdAt: new Date().toISOString(),
    };
    savedPosts.push(newSavedPost);
    localStorageManager.save('saved_posts', savedPosts);
    return newSavedPost;
  }

  unsavePost(userId: number, postId: number): boolean {
    const savedPosts = this.getSavedPosts();
    const filteredSaved = savedPosts.filter(saved => !(saved.userId === userId && saved.postId === postId));
    if (filteredSaved.length === savedPosts.length) return false;
    localStorageManager.save('saved_posts', filteredSaved);
    return true;
  }

  // Analytics methods
  trackAnalytics(data: Omit<Analytics, 'id' | 'createdAt'>): Analytics {
    const analytics = localStorageManager.load<Analytics[]>('analytics') || [];
    const newAnalytic: Analytics = {
      id: analytics.length > 0 ? Math.max(...analytics.map(a => a.id)) + 1 : 1,
      ...data,
      createdAt: new Date().toISOString(),
    };
    analytics.push(newAnalytic);
    localStorageManager.save('analytics', analytics);
    return newAnalytic;
  }

  getDashboardStats(): DashboardStats {
    const posts = this.getPosts();
    const users = this.getUsers();
    const analytics = localStorageManager.load<Analytics[]>('analytics') || [];

    const totalPosts = posts.filter(post => post.status === 'published').length;
    const totalViews = posts.reduce((sum, post) => sum + post.views, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    const totalShares = posts.reduce((sum, post) => sum + post.shares, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;
    const activeUsers = users.filter(user => user.isActive).length;

    // Calculate monthly growth (simulated)
    const monthlyGrowth = {
      posts: Math.floor(Math.random() * 20) + 5,
      views: Math.floor(Math.random() * 30) + 10,
      engagement: Math.floor(Math.random() * 25) + 8,
      users: Math.floor(Math.random() * 15) + 5,
    };

    const stats: DashboardStats = {
      totalPosts,
      totalViews,
      totalEngagement,
      activeUsers,
      monthlyGrowth,
    };

    localStorageManager.save('dashboard_stats', stats);
    return stats;
  }

  // Settings methods
  getSettings(): Setting[] {
    return localStorageManager.load<Setting[]>('settings') || [];
  }

  getSetting(key: string): Setting | null {
    const settings = this.getSettings();
    return settings.find(setting => setting.key === key) || null;
  }

  updateSetting(key: string, value: string): Setting {
    const settings = this.getSettings();
    const settingIndex = settings.findIndex(setting => setting.key === key);
    
    if (settingIndex !== -1) {
      settings[settingIndex] = {
        ...settings[settingIndex],
        value,
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newSetting: Setting = {
        id: settings.length > 0 ? Math.max(...settings.map(s => s.id)) + 1 : 1,
        key,
        value,
        category: 'general',
        updatedAt: new Date().toISOString(),
      };
      settings.push(newSetting);
    }
    
    localStorageManager.save('settings', settings);
    return settings.find(s => s.key === key)!;
  }

  // YouTube API Integration
  async fetchYouTubeVideoTitle(videoId: string): Promise<string | null> {
    // Check cache first
    if (youtubeCacheManager.hasVideo(videoId)) {
      return youtubeCacheManager.getTitle(videoId);
    }

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        console.warn('YouTube API key not found');
        return null;
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error('YouTube API request failed');
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const title = data.items[0].snippet.title;
        
        // Cache the title
        youtubeCacheManager.saveTitle(videoId, title);
        
        return title;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching YouTube video title:', error);
      return null;
    }
  }

  // Auto content generation
  async generateBlogPost(config: {
    category: string;
    cohereApiKey: string;
    keywords: string[];
    tone: string;
  }): Promise<Post | null> {
    try {
      // This is a simulation of AI content generation
      // In a real implementation, this would call the Cohere API
      
      const titles = [
        `The Ultimate Guide to ${config.category} in 2024`,
        `${config.category}: Everything You Need to Know`,
        `Breaking: Latest ${config.category} Trends That Will Shock You`,
        `10 Amazing ${config.category} Facts That Will Blow Your Mind`,
        `The Future of ${config.category}: What Experts Predict`,
      ];

      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      
      const content = `
        <h1>${randomTitle}</h1>
        
        <p>In today's fast-paced world of ${config.category}, staying informed about the latest trends and developments is crucial. This comprehensive guide covers everything you need to know about ${config.keywords.join(', ')} and more.</p>
        
        <h2>Introduction</h2>
        <p>The landscape of ${config.category} has evolved dramatically over the past few years. With new innovations and breakthrough technologies emerging regularly, it's important to understand the key concepts and trends that are shaping this industry.</p>
        
        <h2>Key Trends</h2>
        <p>Several important trends are currently influencing the ${config.category} sector:</p>
        <ul>
          <li>Advanced automation and AI integration</li>
          <li>Sustainable and eco-friendly solutions</li>
          <li>Enhanced user experience and accessibility</li>
          <li>Data-driven decision making</li>
          <li>Mobile-first approaches</li>
        </ul>
        
        <h2>Expert Insights</h2>
        <p>Industry experts believe that ${config.category} will continue to grow and evolve. The integration of ${config.keywords.join(' and ')} is expected to drive significant innovation in the coming years.</p>
        
        <h2>Future Predictions</h2>
        <p>Looking ahead, we can expect to see continued growth and innovation in ${config.category}. The focus will likely shift towards more sustainable and user-centric solutions.</p>
        
        <h2>Conclusion</h2>
        <p>As ${config.category} continues to evolve, staying informed about the latest trends and developments is essential. By understanding these key concepts and preparing for future changes, individuals and businesses can position themselves for success in this dynamic field.</p>
      `;

      const postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'> = {
        title: randomTitle,
        content,
        slug: seoManager.generateSlug(randomTitle),
        excerpt: seoManager.generateMetaDescription(content),
        category: config.category,
        tags: config.keywords,
        status: 'draft',
        seoScore: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        isTrending: false,
        isFeatured: false,
        authorId: 1, // System generated
        featuredImage: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=800&h=400&fit=crop`,
      };

      return this.createPost(postData);
    } catch (error) {
      console.error('Error generating blog post:', error);
      return null;
    }
  }

  // Export functionality
  exportPosts(format: 'json' | 'csv' | 'xml' = 'json'): string {
    const posts = this.getPosts();
    
    switch (format) {
      case 'csv':
        const csvHeaders = 'ID,Title,Category,Status,Created At,Views,Likes';
        const csvRows = posts.map(post => 
          `${post.id},"${post.title}","${post.category}","${post.status}","${post.createdAt}",${post.views},${post.likes}`
        );
        return [csvHeaders, ...csvRows].join('\n');
        
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<blog>
  ${posts.map(post => `
  <post>
    <id>${post.id}</id>
    <title>${post.title}</title>
    <content><![CDATA[${post.content}]]></content>
    <category>${post.category}</category>
    <published>${post.publishedAt || post.createdAt}</published>
    <status>${post.status}</status>
  </post>`).join('')}
</blog>`;
        
      default:
        return JSON.stringify(posts, null, 2);
    }
  }
}

export const dataService = DataService.getInstance();