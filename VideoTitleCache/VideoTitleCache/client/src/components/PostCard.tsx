import React, { useState } from 'react';
import { Link } from 'wouter';
import { Heart, MessageCircle, Share2, Bookmark, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Post } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { trackBuzzEvent } from '@/lib/analytics';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  size?: 'small' | 'medium' | 'large';
  showAuthor?: boolean;
}

export function PostCard({ post, size = 'medium', showAuthor = true }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [reactions, setReactions] = useState({
    like: post.likes,
    comment: post.comments,
    share: post.shares,
  });

  const { user } = useAuth();

  const handleLike = () => {
    if (!user) return;
    
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setReactions(prev => ({
      ...prev,
      like: prev.like + (newLiked ? 1 : -1),
    }));
    
    trackBuzzEvent('like', post.id, post.category);
  };

  const handleSave = () => {
    if (!user) return;
    
    setIsSaved(!isSaved);
    trackBuzzEvent('save', post.id, post.category);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.origin + `/post/${post.slug}`,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/post/${post.slug}`);
    }
    
    setReactions(prev => ({
      ...prev,
      share: prev.share + 1,
    }));
    
    trackBuzzEvent('share', post.id, post.category);
  };

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return 'w-full max-w-sm';
      case 'large':
        return 'w-full max-w-2xl';
      default:
        return 'w-full max-w-md';
    }
  };

  const getImageHeight = () => {
    switch (size) {
      case 'small':
        return 'h-32';
      case 'large':
        return 'h-64';
      default:
        return 'h-48';
    }
  };

  return (
    <Card className={`${getCardSize()} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <CardHeader className="p-0">
        <div className="relative">
          <Link href={`/post/${post.slug}`}>
            <img
              src={post.featuredImage || 'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400&h=300&fit=crop'}
              alt={post.title}
              className={`w-full ${getImageHeight()} object-cover rounded-t-lg`}
            />
          </Link>
          
          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {post.isTrending && (
              <Badge className="bg-primary/90 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            )}
            {post.isFeatured && (
              <Badge className="bg-secondary/90 text-white">
                ⭐ Featured
              </Badge>
            )}
          </div>
          
          {/* Category badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white/90">
              {post.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <Link href={`/post/${post.slug}`}>
            <h3 className="font-bold text-lg leading-tight hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Author and date */}
          {showAuthor && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" alt="Author" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <span>Author</span>
              </div>
              <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </div>
          )}

          {/* Engagement stats */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{reactions.like}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-gray-600"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{reactions.comment}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1 text-gray-600"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-xs">{reactions.share}</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-gray-500">
                <Eye className="h-3 w-3" />
                <span className="text-xs">{post.views}</span>
              </div>
              
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className={`${isSaved ? 'text-blue-500' : 'text-gray-600'}`}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
              )}
            </div>
          </div>

          {/* Reaction emojis */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            {['😍', '🤯', '🔥', '😂', '😱', '👏'].map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-lg hover:scale-110 transition-transform"
                onClick={() => trackBuzzEvent('reaction', post.id, post.category)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
