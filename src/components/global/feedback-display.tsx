'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

interface FeedbackDisplayProps {
  feedbacks: Feedback[];
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedbacks }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recent Feedback</h3>
      {feedbacks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No feedback yet. Be the first to share your thoughts!</p>
      ) : (
        feedbacks.map((feedback) => (
          <div key={feedback.id} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-4 w-4 ${
                      value <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{feedback.date}</span>
            </div>
            <p className="text-sm">{feedback.comment}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedbackDisplay; 