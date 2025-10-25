/**
 * Content Feed Component
 * Displays personalized content feed with AI recommendations, engagement tracking,
 * and smart filtering based on user preferences
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart,
  Share2,
  MessageCircle,
  Eye,
  Filter,
  Search,
  Clock,
  User,
  Play,
  BookOpen,
  Calendar,
  TrendingUp,
  Sparkles
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
import { ContentItem, AIRecommendation, ContentType } from '@/types/dashboard';

// Utils
import { uiUtils } from '@/lib/dashboard-utils';

/**
 * Content feed props
 */
interface ContentFeedProps {
  content: ContentItem[];
  recommendations: AIRecommendation[];
  onEngagement: (contentId: string, type: 'view' | 'like' | 'share' | 'comment') => Promise<void>;
  onFeatureClick: (feature: string, context?: Record<string, any>) => void;
  isLoading: boolean;
}

/**
 * Content type icons mapping
 */
const contentTypeIcons = {
  sermon: Play,
  devotional: BookOpen,
  news: TrendingUp,
  event: Calendar,
  ministry: User,
  prayer: Heart
};

/**
 * Content type colors
 */
const contentTypeColors = {
  sermon: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  devotional: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  news: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  event: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ministry: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  prayer: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

/**
 * Content item component
 */
const ContentItemCard = ({ 
  item, 
  onEngagement,
  onFeatureClick,
  isRecommended = false 
}: { 
  item: ContentItem; 
  onEngagement: (contentId: string, type: 'view' | 'like' | 'share' | 'comment') => Promise<void>;
  onFeatureClick: (feature: string, context?: Record<string, any>) => void;
  isRecommended?: boolean;
}) => {
  const [isEngaging, setIsEngaging] = useState<string | null>(null);
  const TypeIcon = contentTypeIcons[item.type];

  const handleEngagement = async (type: 'view' | 'like' | 'share' | 'comment') => {
    if (isEngaging) return;
    
    setIsEngaging(type);
    try {
      await onEngagement(item.id, type);
      onFeatureClick('content_engagement', { contentType: item.type, engagementType: type });
    } finally {
      setIsEngaging(null);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`group hover:shadow-lg transition-all duration-200 ${
        isRecommended ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-transparent' : ''
      }`}>
        {/* Recommendation Badge */}
        {isRecommended && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="default" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Content Type Icon */}
            <div className={`p-2 rounded-lg ${contentTypeColors[item.type]}`}>
              <TypeIcon className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title and Category */}
              <CardTitle className="text-lg leading-tight mb-1 line-clamp-2">
                {item.title}
              </CardTitle>
              
              {/* Meta Information */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {uiUtils.getInitials(item.author)}
                  </AvatarFallback>
                </Avatar>
                <span>{item.author}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{uiUtils.formatRelativeTime(item.publishDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Description */}
          <CardDescription className="mb-4 line-clamp-3">
            {item.description}
          </CardDescription>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              {/* View Count */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{uiUtils.formatNumber(item.engagement.views)}</span>
              </div>

              {/* Like Button */}
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 ${
                  item.engagement.userEngaged && item.engagement.engagementType === 'like'
                    ? 'text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                }`}
                onClick={() => handleEngagement('like')}
                disabled={isEngaging === 'like'}
              >
                <Heart className={`h-4 w-4 ${
                  item.engagement.userEngaged && item.engagement.engagementType === 'like'
                    ? 'fill-current'
                    : ''
                }`} />
                <span className="text-sm">{uiUtils.formatNumber(item.engagement.likes)}</span>
              </Button>

              {/* Comment Button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground hover:text-blue-500"
                onClick={() => handleEngagement('comment')}
                disabled={isEngaging === 'comment'}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{uiUtils.formatNumber(item.engagement.comments)}</span>
              </Button>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground hover:text-green-500"
                onClick={() => handleEngagement('share')}
                disabled={isEngaging === 'share'}
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm">{uiUtils.formatNumber(item.engagement.shares)}</span>
              </Button>
            </div>

            {/* Read More / View Button */}
            <Button
              size="sm"
              onClick={() => handleEngagement('view')}
              disabled={isEngaging === 'view'}
            >
              {item.type === 'sermon' ? 'Watch' : 
               item.type === 'event' ? 'View Event' : 'Read More'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Content feed loading skeleton
 */
const ContentFeedSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i} className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      </Card>
    ))}
  </div>
);

/**
 * Main Content Feed Component
 */
export default function ContentFeed({
  content,
  recommendations,
  onEngagement,
  onFeatureClick,
  isLoading
}: ContentFeedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'recommended'>('recommended');

  /**
   * Filter and sort content based on user selections
   */
  const filteredAndSortedContent = useMemo(() => {
    let filtered = content;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
        break;
      case 'popular':
        sorted.sort((a, b) => {
          const aEngagement = a.engagement.views + a.engagement.likes + a.engagement.shares;
          const bEngagement = b.engagement.views + b.engagement.likes + b.engagement.shares;
          return bEngagement - aEngagement;
        });
        break;
      case 'recommended':
        sorted.sort((a, b) => (b.personalizedScore || 0) - (a.personalizedScore || 0));
        break;
    }

    return sorted;
  }, [content, searchQuery, selectedType, sortBy]);

  /**
   * Get recommended content IDs for highlighting
   */
  const recommendedContentIds = useMemo(() => {
    return new Set(
      recommendations
        .filter(rec => rec.type === 'content')
        .map(rec => rec.data?.id)
        .filter(Boolean)
    );
  }, [recommendations]);

  /**
   * Get content type counts for tabs
   */
  const contentTypeCounts = useMemo(() => {
    const counts = content.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<ContentType, number>);

    return {
      all: content.length,
      ...counts
    };
  }, [content]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFeatureClick('content_search', { query: value });
  };

  const handleTypeChange = (type: ContentType | 'all') => {
    setSelectedType(type);
    onFeatureClick('content_filter', { type });
  };

  const handleSortChange = (sort: 'recent' | 'popular' | 'recommended') => {
    setSortBy(sort);
    onFeatureClick('content_sort', { sortBy: sort });
  };

  if (isLoading && content.length === 0) {
    return <ContentFeedSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Feed Header with Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Content Feed</h2>
            <p className="text-muted-foreground">
              Personalized content based on your interests and activity
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Content" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Content ({contentTypeCounts.all})
              </SelectItem>
              <SelectItem value="sermon">
                Sermons ({contentTypeCounts.sermon || 0})
              </SelectItem>
              <SelectItem value="devotional">
                Devotionals ({contentTypeCounts.devotional || 0})
              </SelectItem>
              <SelectItem value="news">
                News ({contentTypeCounts.news || 0})
              </SelectItem>
              <SelectItem value="event">
                Events ({contentTypeCounts.event || 0})
              </SelectItem>
              <SelectItem value="ministry">
                Ministry ({contentTypeCounts.ministry || 0})
              </SelectItem>
              <SelectItem value="prayer">
                Prayer ({contentTypeCounts.prayer || 0})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="wait">
        {filteredAndSortedContent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No content found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new content'}
              </p>
              {(searchQuery || selectedType !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredAndSortedContent.map((item) => (
              <ContentItemCard
                key={item.id}
                item={item}
                onEngagement={onEngagement}
                onFeatureClick={onFeatureClick}
                isRecommended={recommendedContentIds.has(item.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More Button (placeholder for pagination) */}
      {filteredAndSortedContent.length > 0 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Load More Content
          </Button>
        </div>
      )}
    </div>
  );
}