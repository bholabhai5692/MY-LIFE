import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPostSchema, 
  insertCategorySchema,
  insertCommentSchema,
  insertReactionSchema,
  insertSavedPostSchema,
  insertSettingSchema,
  insertAnalyticsSchema,
  insertYoutubeCacheSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Post Routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { category, status, limit = "20", offset = "0" } = req.query;
      const posts = await storage.getPosts({
        category: category as string,
        status: status as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(posts);
    } catch (error) {
      console.error("Get posts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Get post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Create post error:", error);
      res.status(400).json({ message: "Invalid post data" });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedPost = await storage.updatePost(postId, updateData);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Update post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const deleted = await storage.deletePost(postId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Category Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Get categories error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Create category error:", error);
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  // Comment Routes
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPost(postId);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Reaction Routes
  app.post("/api/reactions", async (req, res) => {
    try {
      const reactionData = insertReactionSchema.parse(req.body);
      const reaction = await storage.createReaction(reactionData);
      res.status(201).json(reaction);
    } catch (error) {
      console.error("Create reaction error:", error);
      res.status(400).json({ message: "Invalid reaction data" });
    }
  });

  // Saved Posts Routes
  app.get("/api/users/:userId/saved-posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const savedPosts = await storage.getSavedPostsByUser(userId);
      res.json(savedPosts);
    } catch (error) {
      console.error("Get saved posts error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/saved-posts", async (req, res) => {
    try {
      const savedPostData = insertSavedPostSchema.parse(req.body);
      const savedPost = await storage.createSavedPost(savedPostData);
      res.status(201).json(savedPost);
    } catch (error) {
      console.error("Save post error:", error);
      res.status(400).json({ message: "Invalid saved post data" });
    }
  });

  // Settings Routes
  app.get("/api/settings", async (req, res) => {
    try {
      const { category } = req.query;
      const settings = await storage.getSettings(category as string);
      res.json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settingData = insertSettingSchema.parse(req.body);
      const setting = await storage.createSetting(settingData);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Create setting error:", error);
      res.status(400).json({ message: "Invalid setting data" });
    }
  });

  // Analytics Routes
  app.post("/api/analytics", async (req, res) => {
    try {
      const analyticsData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.createAnalytics(analyticsData);
      res.status(201).json(analytics);
    } catch (error) {
      console.error("Create analytics error:", error);
      res.status(400).json({ message: "Invalid analytics data" });
    }
  });

  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // YouTube Cache Routes
  app.get("/api/youtube-cache/:videoId", async (req, res) => {
    try {
      const videoId = req.params.videoId;
      const cachedVideo = await storage.getYoutubeCache(videoId);
      
      if (!cachedVideo) {
        return res.status(404).json({ message: "Video not found in cache" });
      }
      
      res.json(cachedVideo);
    } catch (error) {
      console.error("Get YouTube cache error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/youtube-cache", async (req, res) => {
    try {
      const cacheData = insertYoutubeCacheSchema.parse(req.body);
      const existingCache = await storage.getYoutubeCache(cacheData.videoId);
      
      if (existingCache) {
        return res.json(existingCache);
      }
      
      const cachedVideo = await storage.createYoutubeCache(cacheData);
      res.status(201).json(cachedVideo);
    } catch (error) {
      console.error("Cache YouTube video error:", error);
      res.status(400).json({ message: "Invalid cache data" });
    }
  });

  // Auto Content Generation Routes
  app.post("/api/generate-content", async (req, res) => {
    try {
      const { category, postCount, cohereApiKey, keywords, tone } = req.body;
      
      if (!category || !postCount || !cohereApiKey) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Simulate content generation process
      // In a real implementation, this would integrate with actual APIs
      const generatedPosts = [];
      
      for (let i = 0; i < Math.min(postCount, 30); i++) {
        const post = {
          title: `Generated Post ${i + 1} for ${category}`,
          content: `This is a generated blog post about ${category} created using AI. The content would be much longer in a real implementation.`,
          slug: `generated-post-${i + 1}-${category.toLowerCase()}`,
          excerpt: `AI-generated content about ${category}`,
          category,
          tags: keywords || [category],
          status: 'draft' as const,
          seoScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
          authorId: 1, // System generated
        };
        
        const createdPost = await storage.createPost(post);
        generatedPosts.push(createdPost);
      }
      
      res.json({
        success: true,
        postsGenerated: generatedPosts.length,
        posts: generatedPosts,
      });
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({ message: "Content generation failed" });
    }
  });

  // Export Routes
  app.get("/api/export/posts", async (req, res) => {
    try {
      const { format = 'json', dateRange, categories, status } = req.query;
      const posts = await storage.getPosts({
        category: categories as string,
        status: status as string,
      });
      
      switch (format) {
        case 'csv':
          // Convert to CSV format
          const csvHeaders = 'ID,Title,Category,Status,Created At,Views,Likes';
          const csvRows = posts.map(post => 
            `${post.id},"${post.title}","${post.category}","${post.status}","${post.createdAt}",${post.views},${post.likes}`
          );
          const csvContent = [csvHeaders, ...csvRows].join('\n');
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="posts.csv"');
          res.send(csvContent);
          break;
          
        case 'xml':
          // Convert to XML format (Blogger/WordPress compatible)
          const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<blog>
  ${posts.map(post => `
  <post>
    <title>${post.title}</title>
    <content>${post.content}</content>
    <category>${post.category}</category>
    <published>${post.publishedAt || post.createdAt}</published>
    <status>${post.status}</status>
  </post>`).join('')}
</blog>`;
          
          res.setHeader('Content-Type', 'application/xml');
          res.setHeader('Content-Disposition', 'attachment; filename="posts.xml"');
          res.send(xmlContent);
          break;
          
        default:
          res.json(posts);
      }
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Export failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
