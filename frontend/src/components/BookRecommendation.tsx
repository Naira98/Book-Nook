import React, { useState } from 'react';

interface RecommendationResponse {
  status: string;
  recommendations: string;
  interests: string;
}

const BookRecommendation: React.FC = () => {
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interests.trim()) {
      setError('Please enter your interests');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendations('');

    try {
      const response = await fetch('/api/interests/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RecommendationResponse = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const response = await fetch('/api/interests/health');
      if (response.ok) {
        alert('RAG system is healthy!');
      } else {
        alert('RAG system is not healthy');
      }
    } catch (err) {
      alert('Failed to check RAG system health');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📚 Book Recommendation System
        </h1>
        
        <div className="mb-6">
          <button
            onClick={handleHealthCheck}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Check System Health
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your interests:
            </label>
            <textarea
              id="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., I love science fiction, space exploration, and mystery novels..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !interests.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-md transition-colors"
          >
            {loading ? 'Getting Recommendations...' : 'Get Book Recommendations'}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {recommendations && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📖 Your Personalized Book Recommendations
            </h2>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {recommendations}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            💡 Tips for Better Recommendations
          </h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Be specific about genres you enjoy (e.g., "mystery", "science fiction")</li>
            <li>• Mention authors you like or dislike</li>
            <li>• Include themes or topics you're interested in</li>
            <li>• Specify if you prefer fiction or non-fiction</li>
            <li>• Mention your reading level or complexity preferences</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookRecommendation; 