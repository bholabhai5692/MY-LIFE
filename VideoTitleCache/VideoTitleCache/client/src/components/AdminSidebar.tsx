import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  FileText, 
  Users, 
  Folder, 
  MessageSquare, 
  Heart, 
  Bookmark, 
  Settings, 
  Palette, 
  Globe, 
  Shield, 
  Bell, 
  Database, 
  Wand2, 
  Youtube, 
  Activity,
  X,
  Menu
} from 'lucide-react';
import { AdminSection } from '@/types';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose: () => void;
}

const adminSections: AdminSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'BarChart3',
    description: 'Overview and analytics',
    isActive: true
  },
  {
    id: 'posts',
    title: 'Posts',
    icon: 'FileText',
    description: 'Manage blog posts and content',
    isActive: true
  },
  {
    id: 'auto-generate',
    title: 'Auto Generate',
    icon: 'Wand2',
    description: 'AI-powered content generation',
    isActive: true
  },
  {
    id: 'users',
    title: 'Users',
    icon: 'Users',
    description: 'User management and roles',
    isActive: true
  },
  {
    id: 'categories',
    title: 'Categories',
    icon: 'Folder',
    description: 'Content categories and tags',
    isActive: true
  },
  {
    id: 'comments',
    title: 'Comments',
    icon: 'MessageSquare',
    description: 'Comment moderation',
    isActive: true
  },
  {
    id: 'reactions',
    title: 'Reactions',
    icon: 'Heart',
    description: 'Likes and engagement tracking',
    isActive: true
  },
  {
    id: 'saved-posts',
    title: 'Saved Posts',
    icon: 'Bookmark',
    description: 'User bookmarks and saved content',
    isActive: true
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: 'Activity',
    description: 'Traffic and performance metrics',
    isActive: true
  },
  {
    id: 'youtube-cache',
    title: 'YouTube Cache',
    icon: 'Youtube',
    description: 'Video title caching system',
    isActive: true
  },
  {
    id: 'seo',
    title: 'SEO Tools',
    icon: 'Globe',
    description: 'Search engine optimization',
    isActive: true
  },
  {
    id: 'themes',
    title: 'Themes',
    icon: 'Palette',
    description: 'Customize website appearance',
    isActive: true
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'Bell',
    description: 'System and user notifications',
    isActive: true
  },
  {
    id: 'security',
    title: 'Security',
    icon: 'Shield',
    description: 'User permissions and security',
    isActive: true
  },
  {
    id: 'backup',
    title: 'Backup & Export',
    icon: 'Database',
    description: 'Data backup and export tools',
    isActive: true
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'Settings',
    description: 'System configuration',
    isActive: true
  }
];

const getIcon = (iconName: string) => {
  const icons = {
    BarChart3,
    FileText,
    Users,
    Folder,
    MessageSquare,
    Heart,
    Bookmark,
    Settings,
    Palette,
    Globe,
    Shield,
    Bell,
    Database,
    Wand2,
    Youtube,
    Activity
  };
  return icons[iconName as keyof typeof icons] || Settings;
};

export function AdminSidebar({ activeSection, onSectionChange, onClose }: AdminSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {adminSections.map((section) => {
              const Icon = getIcon(section.icon);
              const isActive = activeSection === section.id;
              
              return (
                <Button
                  key={section.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => onSectionChange(section.id)}
                  disabled={!section.isActive}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{section.title}</span>
                    {!isActive && (
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {section.description}
                      </span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white px-3">
              Quick Stats
            </h3>
            <div className="space-y-2 px-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
                <span className="font-medium text-gray-900 dark:text-white">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="font-medium text-gray-900 dark:text-white">127</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Comments</span>
                <span className="font-medium text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Categories</span>
                <span className="font-medium text-gray-900 dark:text-white">6</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Storage Usage */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white px-3">
              Local Storage
            </h3>
            <div className="px-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: '45%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span>Used</span>
                <span>45%</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                BuzzHub Admin
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                v1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}