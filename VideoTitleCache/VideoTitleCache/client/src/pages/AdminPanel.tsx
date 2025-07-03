import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dataService } from '@/lib/dataService';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings, 
  Users, 
  FileText, 
  BarChart3, 
  Folder,
  MessageSquare,
  Heart,
  Bookmark,
  Download,
  Upload,
  Wand2,
  Youtube,
  Globe,
  Zap,
  Palette,
  Bell,
  Shield,
  Database,
  Activity
} from 'lucide-react';
import { Post, User, Category, Comment, DashboardStats, Setting, BlogConfig } from '@/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AdminPanel() {
  const { user, canAccessAdminPanel } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<Setting[]>([]);

  // Form states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [blogGenerationConfig, setBlogGenerationConfig] = useState<BlogConfig>({
    category: '',
    cohereApiKey: '',
    keywords: [],
    tone: 'professional',
    length: 'medium',
    includeImages: true,
    autoPublish: false
  });

  // Load data on component mount
  useEffect(() => {
    if (canAccessAdminPanel()) {
      loadData();
    }
  }, [canAccessAdminPanel]);

  const loadData = () => {
    setPosts(dataService.getPosts());
    setUsers(dataService.getUsers());
    setCategories(dataService.getCategories());
    setComments(dataService.getComments());
    setDashboardStats(dataService.getDashboardStats());
    setSettings(dataService.getSettings());
  };

  if (!canAccessAdminPanel()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleCreatePost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPost = dataService.createPost(postData);
      setPosts([...posts, newPost]);
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePost = async (id: number, updates: Partial<Post>) => {
    try {
      const updatedPost = dataService.updatePost(id, updates);
      if (updatedPost) {
        setPosts(posts.map(p => p.id === id ? updatedPost : p));
        setIsFormOpen(false);
        toast({
          title: "Success",
          description: "Post updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      const success = dataService.deletePost(id);
      if (success) {
        setPosts(posts.filter(p => p.id !== id));
        toast({
          title: "Success",
          description: "Post deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleGenerateBlogPost = async () => {
    try {
      const generatedPost = await dataService.generateBlogPost(blogGenerationConfig);
      if (generatedPost) {
        setPosts([...posts, generatedPost]);
        toast({
          title: "Success",
          description: "Blog post generated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate blog post",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate blog post",
        variant: "destructive",
      });
    }
  };

  const exportPosts = (format: 'json' | 'csv' | 'xml') => {
    try {
      const data = dataService.exportPosts(format);
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 
             format === 'csv' ? 'text/csv' : 'application/xml'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `posts.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `Posts exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export posts",
        variant: "destructive",
      });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalPosts || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.monthlyGrowth.posts || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalViews.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.monthlyGrowth.views || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalEngagement.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.monthlyGrowth.engagement || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardStats?.monthlyGrowth.users || 0}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-muted-foreground">{post.category}</p>
                  </div>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => setActiveSection('posts')} className="h-20 flex flex-col">
                <Plus className="h-6 w-6 mb-2" />
                New Post
              </Button>
              <Button onClick={() => setActiveSection('auto-generate')} variant="outline" className="h-20 flex flex-col">
                <Wand2 className="h-6 w-6 mb-2" />
                Auto Generate
              </Button>
              <Button onClick={() => setActiveSection('categories')} variant="outline" className="h-20 flex flex-col">
                <Folder className="h-6 w-6 mb-2" />
                Categories
              </Button>
              <Button onClick={() => setActiveSection('analytics')} variant="outline" className="h-20 flex flex-col">
                <BarChart3 className="h-6 w-6 mb-2" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPosts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Posts Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => exportPosts('json')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportPosts('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                <DialogDescription>
                  {selectedPost ? 'Update the post details below.' : 'Fill in the details for your new post.'}
                </DialogDescription>
              </DialogHeader>
              <PostForm 
                post={selectedPost} 
                categories={categories}
                onSubmit={selectedPost ? 
                  (data) => handleUpdatePost(selectedPost.id, data) : 
                  handleCreatePost
                }
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedPost(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>SEO Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.category}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.views.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={post.seoScore >= 80 ? 'default' : post.seoScore >= 60 ? 'secondary' : 'destructive'}>
                      {post.seoScore}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedPost(post);
                          setIsFormOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderAutoGenerate = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Auto Content Generation</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Blog Post</CardTitle>
          <CardDescription>
            Use AI to automatically generate blog posts based on your specifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={blogGenerationConfig.category} 
                onValueChange={(value) => setBlogGenerationConfig({...blogGenerationConfig, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select 
                value={blogGenerationConfig.tone} 
                onValueChange={(value: any) => setBlogGenerationConfig({...blogGenerationConfig, tone: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input 
              placeholder="e.g., AI, technology, innovation"
              value={blogGenerationConfig.keywords.join(', ')}
              onChange={(e) => setBlogGenerationConfig({
                ...blogGenerationConfig, 
                keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
              })}
            />
          </div>

          <div>
            <Label htmlFor="cohereKey">Cohere API Key</Label>
            <Input 
              type="password"
              placeholder="Your Cohere API key"
              value={blogGenerationConfig.cohereApiKey}
              onChange={(e) => setBlogGenerationConfig({...blogGenerationConfig, cohereApiKey: e.target.value})}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-publish"
              checked={blogGenerationConfig.autoPublish}
              onCheckedChange={(checked) => setBlogGenerationConfig({...blogGenerationConfig, autoPublish: checked})}
            />
            <Label htmlFor="auto-publish">Auto-publish generated content</Label>
          </div>

          <Button onClick={handleGenerateBlogPost} className="w-full">
            <Wand2 className="h-4 w-4 mr-2" />
            Generate Blog Post
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'posts':
        return renderPosts();
      case 'auto-generate':
        return renderAutoGenerate();
      case 'users':
        return <div>Users management coming soon...</div>;
      case 'categories':
        return <div>Categories management coming soon...</div>;
      case 'comments':
        return <div>Comments management coming soon...</div>;
      case 'analytics':
        return <div>Analytics dashboard coming soon...</div>;
      case 'settings':
        return <div>Settings panel coming soon...</div>;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className={`flex-1 p-6 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
          <div className="max-w-7xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

// Post Form Component
function PostForm({ 
  post, 
  categories, 
  onSubmit, 
  onCancel 
}: { 
  post: Post | null; 
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    category: post?.category || '',
    tags: post?.tags.join(', ') || '',
    status: post?.status || 'draft',
    featuredImage: post?.featuredImage || '',
    isFeatured: post?.isFeatured || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      authorId: 1, // Current user
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea 
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea 
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          rows={10}
          required
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input 
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({...formData, tags: e.target.value})}
          placeholder="e.g., technology, AI, innovation"
        />
      </div>

      <div>
        <Label htmlFor="featuredImage">Featured Image URL</Label>
        <Input 
          id="featuredImage"
          value={formData.featuredImage}
          onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'draft' | 'published' | 'archived') => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <Switch 
            id="featured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData({...formData, isFeatured: checked})}
          />
          <Label htmlFor="featured">Featured Post</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {post ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  );
}