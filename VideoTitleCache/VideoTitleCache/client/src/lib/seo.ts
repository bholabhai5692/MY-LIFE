import { SEOMetrics } from '@/types';

export class SEOManager {
  private static instance: SEOManager;
  
  private constructor() {}
  
  static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  generateMetaDescription(content: string, maxLength: number = 160): string {
    // Strip HTML tags
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Get first sentence or truncate to maxLength
    const sentences = plainText.split(/[.!?]/);
    const firstSentence = sentences[0];
    
    if (firstSentence.length <= maxLength) {
      return firstSentence.trim() + '.';
    }
    
    // Truncate and add ellipsis
    return plainText.substring(0, maxLength - 3).trim() + '...';
  }

  calculateSEOScore(data: {
    title?: string;
    metaDescription?: string;
    content: string;
    tags?: string[];
  }): SEOMetrics {
    const title = data.title || '';
    const description = data.metaDescription || '';
    const content = data.content || '';
    const tags = data.tags || [];

    // Title analysis
    const titleAnalysis = {
      length: title.length,
      hasKeywords: tags.some(tag => title.toLowerCase().includes(tag.toLowerCase())),
      score: this.calculateTitleScore(title, tags)
    };

    // Description analysis
    const descriptionAnalysis = {
      length: description.length,
      hasKeywords: tags.some(tag => description.toLowerCase().includes(tag.toLowerCase())),
      score: this.calculateDescriptionScore(description, tags)
    };

    // Content analysis
    const contentAnalysis = {
      wordCount: this.getWordCount(content),
      hasHeadings: /<h[1-6]>/i.test(content),
      hasImages: /<img/i.test(content),
      score: this.calculateContentScore(content, tags)
    };

    // Keywords analysis
    const keywordAnalysis = {
      density: this.calculateKeywordDensity(content, tags),
      score: this.calculateKeywordScore(content, tags)
    };

    // Calculate overall score
    const overallScore = Math.round(
      (titleAnalysis.score + descriptionAnalysis.score + contentAnalysis.score + keywordAnalysis.score) / 4
    );

    // Generate suggestions
    const suggestions = this.generateSuggestions({
      title: titleAnalysis,
      description: descriptionAnalysis,
      content: contentAnalysis,
      keywords: keywordAnalysis
    });

    return {
      score: overallScore,
      title: titleAnalysis,
      description: descriptionAnalysis,
      content: contentAnalysis,
      keywords: keywordAnalysis,
      suggestions
    };
  }

  private calculateTitleScore(title: string, tags: string[]): number {
    let score = 0;

    // Length check (optimal: 50-60 characters)
    if (title.length >= 50 && title.length <= 60) {
      score += 40;
    } else if (title.length >= 30 && title.length <= 70) {
      score += 25;
    } else if (title.length >= 20 && title.length <= 80) {
      score += 15;
    }

    // Keywords presence
    const hasKeywords = tags.some(tag => title.toLowerCase().includes(tag.toLowerCase()));
    if (hasKeywords) {
      score += 30;
    }

    // Power words
    const powerWords = ['ultimate', 'guide', 'best', 'top', 'amazing', 'incredible', 'shocking', 'secret'];
    const hasPowerWords = powerWords.some(word => title.toLowerCase().includes(word));
    if (hasPowerWords) {
      score += 15;
    }

    // Numbers or years
    if (/\d+/.test(title)) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  private calculateDescriptionScore(description: string, tags: string[]): number {
    let score = 0;

    // Length check (optimal: 150-160 characters)
    if (description.length >= 150 && description.length <= 160) {
      score += 40;
    } else if (description.length >= 120 && description.length <= 170) {
      score += 25;
    } else if (description.length >= 100 && description.length <= 200) {
      score += 15;
    }

    // Keywords presence
    const hasKeywords = tags.some(tag => description.toLowerCase().includes(tag.toLowerCase()));
    if (hasKeywords) {
      score += 30;
    }

    // Call-to-action words
    const ctaWords = ['learn', 'discover', 'find', 'get', 'read', 'explore'];
    const hasCTA = ctaWords.some(word => description.toLowerCase().includes(word));
    if (hasCTA) {
      score += 15;
    }

    // Compelling language
    const compellingWords = ['amazing', 'incredible', 'essential', 'important', 'critical'];
    const hasCompelling = compellingWords.some(word => description.toLowerCase().includes(word));
    if (hasCompelling) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  private calculateContentScore(content: string, tags: string[]): number {
    let score = 0;
    const wordCount = this.getWordCount(content);

    // Word count (optimal: 1000-2000 words)
    if (wordCount >= 1000 && wordCount <= 2000) {
      score += 30;
    } else if (wordCount >= 500 && wordCount <= 3000) {
      score += 20;
    } else if (wordCount >= 300) {
      score += 10;
    }

    // Headings structure
    if (/<h[1-6]>/i.test(content)) {
      score += 20;
    }

    // Images
    if (/<img/i.test(content)) {
      score += 15;
    }

    // Internal links
    if (/<a\s+(?:[^>]*?\s+)?href/i.test(content)) {
      score += 10;
    }

    // Keywords in content
    const keywordCount = tags.reduce((count, tag) => {
      const regex = new RegExp(tag, 'gi');
      const matches = content.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    if (keywordCount > 0) {
      score += 25;
    }

    return Math.min(score, 100);
  }

  private calculateKeywordScore(content: string, tags: string[]): number {
    let score = 0;
    const density = this.calculateKeywordDensity(content, tags);

    // Optimal keyword density: 1-3%
    if (density >= 1 && density <= 3) {
      score += 50;
    } else if (density >= 0.5 && density <= 5) {
      score += 30;
    } else if (density > 0) {
      score += 15;
    }

    // Keywords in first paragraph
    const firstParagraph = content.split('</p>')[0] || content.substring(0, 200);
    const hasKeywordsInFirst = tags.some(tag => firstParagraph.toLowerCase().includes(tag.toLowerCase()));
    if (hasKeywordsInFirst) {
      score += 25;
    }

    // Keywords in headings
    const headings = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
    const hasKeywordsInHeadings = headings.some(heading => 
      tags.some(tag => heading.toLowerCase().includes(tag.toLowerCase()))
    );
    if (hasKeywordsInHeadings) {
      score += 25;
    }

    return Math.min(score, 100);
  }

  private calculateKeywordDensity(content: string, tags: string[]): number {
    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = this.getWordCount(plainText);
    
    if (wordCount === 0) return 0;

    const keywordCount = tags.reduce((count, tag) => {
      const regex = new RegExp(`\\b${tag}\\b`, 'gi');
      const matches = plainText.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);

    return (keywordCount / wordCount) * 100;
  }

  private getWordCount(text: string): number {
    const plainText = text.replace(/<[^>]*>/g, '');
    return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private generateSuggestions(analysis: {
    title: any;
    description: any;
    content: any;
    keywords: any;
  }): string[] {
    const suggestions: string[] = [];

    // Title suggestions
    if (analysis.title.length < 30) {
      suggestions.push('Consider making your title longer (30-60 characters) for better SEO.');
    } else if (analysis.title.length > 70) {
      suggestions.push('Your title might be too long. Consider shortening it to under 60 characters.');
    }

    if (!analysis.title.hasKeywords) {
      suggestions.push('Include your target keywords in the title for better relevance.');
    }

    // Description suggestions
    if (analysis.description.length < 120) {
      suggestions.push('Your meta description is too short. Aim for 150-160 characters.');
    } else if (analysis.description.length > 170) {
      suggestions.push('Your meta description is too long and may be truncated in search results.');
    }

    if (!analysis.description.hasKeywords) {
      suggestions.push('Include your target keywords in the meta description.');
    }

    // Content suggestions
    if (analysis.content.wordCount < 300) {
      suggestions.push('Consider adding more content. Longer articles tend to rank better.');
    }

    if (!analysis.content.hasHeadings) {
      suggestions.push('Add headings (H1, H2, etc.) to improve content structure and readability.');
    }

    if (!analysis.content.hasImages) {
      suggestions.push('Consider adding relevant images to make your content more engaging.');
    }

    // Keywords suggestions
    if (analysis.keywords.density < 0.5) {
      suggestions.push('Your keyword density is low. Consider mentioning your target keywords more naturally in the content.');
    } else if (analysis.keywords.density > 5) {
      suggestions.push('Your keyword density is high. Avoid keyword stuffing by reducing keyword repetition.');
    }

    return suggestions;
  }

  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  generateCanonicalURL(slug: string, baseUrl: string = window.location.origin): string {
    return `${baseUrl}/post/${slug}`;
  }

  generateOpenGraphTags(data: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
  }): Record<string, string> {
    return {
      'og:title': data.title,
      'og:description': data.description,
      'og:image': data.image || '',
      'og:url': data.url || '',
      'og:type': data.type || 'article',
      'og:site_name': 'BuzzHub'
    };
  }

  generateTwitterCardTags(data: {
    title: string;
    description: string;
    image?: string;
  }): Record<string, string> {
    return {
      'twitter:card': 'summary_large_image',
      'twitter:title': data.title,
      'twitter:description': data.description,
      'twitter:image': data.image || ''
    };
  }

  updatePageMeta(data: {
    title: string;
    description: string;
    image?: string;
    url?: string;
  }) {
    // Update document title
    document.title = data.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', data.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = data.description;
      document.head.appendChild(meta);
    }
    
    // Update Open Graph tags
    const ogTags = this.generateOpenGraphTags(data);
    Object.entries(ogTags).forEach(([property, content]) => {
      // Remove existing tag
      const existing = document.querySelector(`meta[property="${property}"]`);
      if (existing) {
        existing.remove();
      }
      
      // Add new tag
      if (content) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });
    
    // Update Twitter tags
    const twitterTags = this.generateTwitterCardTags(data);
    Object.entries(twitterTags).forEach(([name, content]) => {
      // Remove existing tag
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing) {
        existing.remove();
      }
      
      // Add new tag
      if (content) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });
  }
}

export const seoManager = SEOManager.getInstance();