import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PostCard } from '@/components/PostCard';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { Post, SavedPost } from '@/types';
import { trackUserAction } from '@/lib/analytics';
import { seoManager } from '@/lib/seo';
import { 
  User, 
  Settings, 
  Bookmark, 
  Trophy, 
  Chrome, 
  Globe, 
  Camera,
  Save,
  Eye,
  Heart,
  MessageCircle,
  BarChart3
} from 'lucide-react';

export function UserProfile() {
  const [, setLocation] = useLocation();
  const { user, updateUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [posts] = useLocalStorage<Post[]>('posts', []);
  const [savedPosts] = useLocalStorage<SavedPost[]>('saved_posts', []);
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '',
    website: '',
    location: '',
  });

  const [bloggerSettings, setBloggerSettings] = useState({
    isConnected: user?.bloggerConnected || false,
    blogId: user?.blogId || '',
    blogUrl: user?.blogUrl || '',
    apiKey: user?.bloggerApiKey || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
      return;
    }

    // Update SEO meta tags
    seoManager.updatePageMeta({
      title: `${user?.username}'s Profile - BuzzHub`,
      description: `View ${user?.username}'s profile, saved articles, and activity on BuzzHub`,
      url: window.location.href,
    });
  }, [isAuthenticated, user, setLocation]);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        bio: '',
        website: '',
        location: '',
      });
      setBloggerSettings({
        isConnected: user.bloggerConnected,
        blogId: user.blogId || '',
        blogUrl: user.blogUrl || '',
        apiKey: user.bloggerApiKey || '',
      });
    }
  }, [user]);

  const userPosts = posts.filter(post => post.authorId === user?.id);
  const userSavedPosts = savedPosts
    .filter(saved => saved.userId === user?.id)
    .map(saved => posts.find(post => post.id === saved.postId))
    .filter(Boolean) as Post[];

  const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0);
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = userPosts.reduce((sum, post) => sum + post.comments, 0);

  const userBadges = [
    { name: 'Top Reader', icon: '📚', condition: userSavedPosts.length >= 10 },
    { name: 'Content Creator', icon: '✏️', condition: userPosts.length >= 5 },
    { name: 'Popular Author', icon: '⭐', condition: totalLikes >= 100 },
    { name: 'Viral Creator', icon: '🔥', condition: totalViews >= 1000 },
    { name: 'Community Leader', icon: '👑', condition: totalComments >= 50 },
    { name: 'Early Adopter', icon: '🚀', condition: true },
  ].filter(badge => badge.condition);

  const handleSaveProfile = () => {
    if (!user) return;

    updateUser({
      username: profileData.username,
      email: profileData.email,
    });

    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });

    setIsEditing(false);
    trackUserAction('profile_update', { userId: user.id });
  };

  const handleBloggerToggle = (enabled: boolean) => {
    if (!user) return;

    setBloggerSettings(prev => ({ ...prev, isConnected: enabled }));
    
    updateUser({
      bloggerConnected: enabled,
      blogId: enabled ? bloggerSettings.blogId : '',
      blogUrl: enabled ? bloggerSettings.blogUrl : '',
      bloggerApiKey: enabled ? bloggerSettings.apiKey : '',
    });

    toast({
      title: enabled ? 'Blogger Connected' : 'Blogger Disconnected',
      description: enabled 
        ? 'Your Blogger account has been connected successfully.' 
        : 'Your Blogger account has been disconnected.',
    });

    trackUserAction('blogger_toggle', { userId: user.id, enabled });
  };

  const handleBloggerSettings = () => {
    if (!user) return;

    updateUser({
      blogId: bloggerSettings.blogId,
      blogUrl: bloggerSettings.blogUrl,
      bloggerApiKey: bloggerSettings.apiKey,
    });

    toast({
      title: 'Blogger Settings Saved',
      description: 'Your Blogger settings have been updated.',
    });

    trackUserAction('blogger_settings_update', { userId: user.id });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src={user.profileImage} alt={user.username} />
                  <AvatarFallback className="text-2xl">
                    {user.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl">{user.username}</CardTitle>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
                <Badge variant="secondary">
                  Score: {user.workingScore}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{userPosts.length}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{totalViews}</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">{userSavedPosts.length}</p>
                    <p className="text-xs text-muted-foreground">Saved</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                    Badges
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {userBadges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {badge.icon} {badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blogger Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Chrome className="h-5 w-5 mr-2" />
                Blogger Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="blogger-toggle">Enable Blogger Management</Label>
                <Switch
                  id="blogger-toggle"
                  checked={bloggerSettings.isConnected}
                  onCheckedChange={handleBloggerToggle}
                />
              </div>
              
              {bloggerSettings.isConnected && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="blog-id">Blog ID</Label>
                    <Input
                      id="blog-id"
                      value={bloggerSettings.blogId}
                      onChange={(e) => setBloggerSettings(prev => ({ ...prev, blogId: e.target.value }))}
                      placeholder="Enter your Blogger blog ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="blog-url">Blog URL</Label>
                    <Input
                      id="blog-url"
                      value={bloggerSettings.blogUrl}
                      onChange={(e) => setBloggerSettings(prev => ({ ...prev, blogUrl: e.target.value }))}
                      placeholder="https://yourblog.blogspot.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Blogger API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={bloggerSettings.apiKey}
                      onChange={(e) => setBloggerSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your Blogger API key"
                    />
                  </div>
                  
                  <Button onClick={handleBloggerSettings} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Blogger Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="posts">My Posts</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Activity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{totalViews}</p>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-2xl font-bold">{totalLikes}</p>
                      <p className="text-sm text-muted-foreground">Total Likes</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{totalComments}</p>
                      <p className="text-sm text-muted-foreground">Total Comments</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{userBadges.length}</p>
                      <p className="text-sm text-muted-foreground">Badges Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium">Published: {post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.views} views • {post.likes} likes
                          </p>
                        </div>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    ))}
                    {userPosts.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No posts yet. Start creating content to see your activity here!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Posts Tab */}
            <TabsContent value="posts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Posts ({userPosts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {userPosts.length > 0 ? (
                    <div className="grid gap-6">
                      {userPosts.map((post) => (
                        <PostCard key={post.id} post={post} size="small" showAuthor={false} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">You haven't published any posts yet.</p>
                      <Button onClick={() => setLocation('/submit')}>
                        Create Your First Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Saved Posts Tab */}
            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bookmark className="h-5 w-5 mr-2" />
                    Saved Articles ({userSavedPosts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userSavedPosts.length > 0 ? (
                    <div className="grid gap-6">
                      {userSavedPosts.map((post) => (
                        <PostCard key={post.id} post={post} size="small" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No saved articles yet.</p>
                      <p className="text-sm text-muted-foreground">
                        Save articles you find interesting to read them later!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Profile Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Your location"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSaveProfile}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
