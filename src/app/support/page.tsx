'use client';

import React, { useState } from 'react';
import KnowledgeBase from '@/components/global/knowledge-base';
import FeedbackForm from '@/components/global/feedback-form';
import FeedbackDisplay from '@/components/global/feedback-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

export default function SupportPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: '1',
      rating: 5,
      comment: 'Great experience! The knowledge base was very helpful.',
      date: '2024-03-15',
    },
    {
      id: '2',
      rating: 4,
      comment: 'Good support system, but could use more examples.',
      date: '2024-03-14',
    },
  ]);

  const handleNewFeedback = (rating: number, comment: string) => {
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };
    setFeedbacks([newFeedback, ...feedbacks]);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Support Center</h1>
      
      <Tabs defaultValue="knowledge" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="feedback">Give Feedback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBase />
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Share Your Feedback</h2>
              <FeedbackForm onSubmit={handleNewFeedback} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>
              <FeedbackDisplay feedbacks={feedbacks} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 