import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { dataService } from '@/lib/dataService';
import { seoManager } from '@/lib/seo';
import { trackBuzzEvent } from '@/lib/analytics';
import { CategoryCard } from '@/components/CategoryCard';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Star, 
  Eye, 
  Calendar,
  Search,
  Zap,
  Heart,
  MessageSquare,
  Share2
} from 'lucide-react';
import { Post, Category } from '@/types';

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Update page meta for SEO
    seoManager.updatePageMeta({
      title: 'BuzzHub - Discover Viral Content & Trending Stories',
      description: 'Stay ahead of the curve with BuzzHub. Discover viral content, trending news, tech insights, and engaging stories. Your ultimate destination for what\'s buzzing online.',
      url: window.location.href,
      image: '/og-home.jpg'
    });

    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Load all content
      const allPosts = dataService.getPosts();
      const allCategories = dataService.getCategories();
      
      setPosts(allPosts.slice(0, 12)); // Show latest 12 posts
      setCategories(allCategories);
      setFeaturedPosts(allPosts.filter(post => post.isFeatured).slice(0, 3));
      
      // Track page view
      trackBuzzEvent('home_page_view');
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Track search event
      trackBuzzEvent('search', undefined, searchQuery);
      // Navigate to search results (when implemented)
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handlePostClick = (post: Post) => {
    trackBuzzEvent('post_click', post.id, post.category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Hero skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
            
            {/* Categories skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            
            {/* Posts skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(9).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            What's Buzzing Today?
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover viral content, trending stories, and the latest buzz from around the web. 
            Stay ahead of the curve with our curated collection of engaging articles.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for trending topics, stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-20 py-4 text-lg rounded-full border-2 focus:border-primary"
              />
              <Button 
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Explore Categories
            </h2>
            <Link href="/categories">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Featured Stories
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  size="large"
                  onClick={() => handlePostClick(post)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-6 w-6 text-red-500" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trending Now
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 9).map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onClick={() => handlePostClick(post)}
              />
            ))}
          </div>
          
          {posts.length > 9 && (
            <div className="text-center mt-8">
              <Button size="lg" className="rounded-full">
                Load More Stories
              </Button>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            BuzzHub by the Numbers
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mx-auto mb-3">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1.2M+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Views</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mx-auto mb-3">
                <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">750K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Likes & Reactions</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">89K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Comments</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-3">
                <Share2 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">340K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Shares</div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Stay in the Loop</h3>
          <p className="text-xl mb-6 opacity-90">
            Get the latest viral content and trending stories delivered to your inbox.
          </p>
          
          <form className="max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <Button 
                type="submit"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                Subscribe
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}