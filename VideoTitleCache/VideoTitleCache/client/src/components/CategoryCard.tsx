import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  size?: 'small' | 'medium' | 'large';
}

export function CategoryCard({ category, size = 'medium' }: CategoryCardProps) {
  const getCardSize = () => {
    switch (size) {
      case 'small':
        return 'min-w-[150px] max-w-[200px]';
      case 'large':
        return 'min-w-[250px] max-w-[300px]';
      default:
        return 'min-w-[200px] max-w-[250px]';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-12';
      case 'large':
        return 'w-20 h-20';
      default:
        return 'w-16 h-16';
    }
  };

  return (
    <Link href={`/category/${category.name.toLowerCase()}`}>
      <Card className={`${getCardSize()} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer`}>
        <CardContent className="p-6 text-center">
          <div
            className={`${getIconSize()} rounded-full flex items-center justify-center mx-auto mb-4`}
            style={{
              background: `linear-gradient(135deg, ${category.color}20, ${category.color}40)`,
              border: `2px solid ${category.color}30`,
            }}
          >
            <span className="text-2xl">{category.icon}</span>
          </div>
          
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            {category.name}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {category.postCount} posts
          </p>
          
          {category.isTrending && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              🔥 Trending
            </Badge>
          )}
          
          {category.description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
              {category.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
