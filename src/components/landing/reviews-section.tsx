'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReviewsSection() {
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  });

  const [reviews, setReviews] = useState([
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
    {
      id: '3',
      rating: 5,
      comment: 'The automation features are incredible. Saved us so much time!',
      date: '2024-03-13',
    },
    {
      id: '4',
      rating: 5,
      comment: 'Excellent integration capabilities. Works seamlessly with our tools.',
      date: '2024-03-12',
    }
  ]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.comment.trim()) {
      const review = {
        id: Date.now().toString(),
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0],
      };
      setReviews([review, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
    }
  };

  return (
    <section className="w-full py-20 bg-neutral-950 relative z-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Recent Feedback</h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            See what our users have to say about their experience with Flowzen.
          </p>
        </div>

        {/* Review Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-white">Rating:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: value })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        value <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience with Flowzen..."
                className="w-full p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                rows={4}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Submit Review
            </Button>
          </form>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((feedback) => (
            <div key={feedback.id} className="p-6 border rounded-lg bg-neutral-900 border-neutral-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${
                        value <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-400">{feedback.date}</span>
              </div>
              <p className="text-neutral-300">{feedback.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 