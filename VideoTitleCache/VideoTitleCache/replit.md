# BuzzHub - Viral Content Platform

## Overview

BuzzHub is a modern React-based viral content platform designed to aggregate and display trending news, viral videos, memes, and engaging content. The application features a full-stack architecture with Express.js backend, PostgreSQL database, and a comprehensive admin panel for content management and automated content generation.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, custom hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Authentication**: Custom JWT-based authentication with session management
- **API Structure**: RESTful endpoints with TypeScript interfaces

### Database Schema
- **Users**: Authentication, roles, blogger integration, badges system
- **Posts**: Content management with SEO scoring, engagement metrics
- **Categories**: Content organization with trending flags
- **Comments**: User interaction and moderation
- **Analytics**: Traffic and engagement tracking
- **Settings**: Platform configuration

## Key Components

### User Management System
- Multi-role authentication (user, admin, author, editor, super_admin)
- Google OAuth integration capability
- Blogger API integration for external blog management
- User badge system and working score tracking
- Profile management with saved posts

### Content Management
- Rich text editor with HTML mode support
- SEO optimization with automatic scoring
- Category-based content organization
- Scheduling and draft management
- Media management with Cloudinary integration
- Automated content generation using AI APIs

### Admin Panel
- Comprehensive dashboard with analytics
- Post CRUD operations with bulk actions
- Category and tag management
- User management and role assignment
- Theme customization system
- Media library management
- Analytics integration with Google Analytics

### Engagement Features
- Reaction system (likes, shares, comments)
- Social sharing capabilities
- Content bookmarking
- Trending content algorithms
- User interaction tracking

## Data Flow

1. **Content Creation**: Admin creates posts through rich editor → Content stored in PostgreSQL → SEO score calculated
2. **User Interaction**: Users view content → Analytics tracked → Engagement metrics updated
3. **Auto Generation**: AI APIs generate content → Content processed and stored → Published to platform
4. **Authentication**: Users authenticate → JWT tokens managed → Session persistence via cookies

## External Dependencies

### APIs and Services
- **Google Analytics**: User behavior tracking and analytics
- **YouTube API**: Video content integration
- **Cohere API**: AI-powered content generation
- **Cloudinary**: Media storage and optimization
- **Blogger API**: External blog management

### Third-Party Libraries
- **Drizzle ORM**: Type-safe database operations
- **TanStack Query**: Server state management
- **Radix UI**: Accessible component primitives
- **Date-fns**: Date manipulation utilities
- **Embla Carousel**: Content carousels

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Environment Variables**: Separate configuration for development/production
- **Database**: Local PostgreSQL or Neon cloud database

### Production
- **Build Process**: Vite build for frontend, esbuild for backend
- **Server**: Express.js serving static files and API endpoints
- **Database**: PostgreSQL with connection pooling
- **Environment**: Node.js production environment

### Required Environment Variables
```
DATABASE_URL
VITE_GA_MEASUREMENT_ID
VITE_GOOGLE_CLIENT_ID
VITE_YOUTUBE_API_KEY
VITE_COHERE_API_KEY
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
```

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 03, 2025. Initial setup