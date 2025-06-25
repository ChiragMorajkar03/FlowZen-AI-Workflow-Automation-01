'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Getting Started with Workflows',
    category: 'Getting Started',
    content: 'Learn how to create your first workflow and understand basic concepts.',
    tags: ['beginner', 'workflows', 'tutorial'],
  },
  {
    id: '2',
    title: 'Advanced Node Configuration',
    category: 'Advanced Topics',
    content: 'Deep dive into node configuration options and best practices.',
    tags: ['advanced', 'configuration', 'nodes'],
  },
  {
    id: '3',
    title: 'API Integration Guide',
    category: 'Integration',
    content: 'Step-by-step guide to integrating external APIs with your workflows.',
    tags: ['api', 'integration', 'external'],
  },
  {
    id: '4',
    title: 'Troubleshooting Common Issues',
    category: 'Troubleshooting',
    content: 'Solutions to common problems and error messages.',
    tags: ['troubleshooting', 'errors', 'help'],
  },
];

const KnowledgeBase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(articles.map((article) => article.category)));

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
            >
              <h3 className="font-medium">{article.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{article.content}</p>
              <div className="flex gap-2 mt-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-muted px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default KnowledgeBase; 