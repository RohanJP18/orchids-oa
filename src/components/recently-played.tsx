'use client';

import { useState, useEffect } from 'react';
import { RecentlyPlayedSong } from '@/lib/db/schema';

interface RecentlyPlayedProps {
  userId: string;
  limit?: number;
}

export default function RecentlyPlayed({ userId, limit = 20 }: RecentlyPlayedProps) {
  const [songs, setSongs] = useState<RecentlyPlayedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentlyPlayed();
  }, [userId, limit]);

  const fetchRecentlyPlayed = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recently-played?userId=${userId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recently played songs');
      }

      const data = await response.json();
      setSongs(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPlayedAt = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800 animate-pulse">
              <div className="w-12 h-12 bg-gray-700 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
        <div className="text-gray-400 p-4 bg-gray-800 rounded-lg text-center">
          No recently played songs yet. Start listening to some music!
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Recently Played</h2>
      <div className="space-y-2">
        {songs.map((song) => (
          <div
            key={song.id}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group"
          >
            {/* Song cover placeholder */}
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {song.songTitle.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Song info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate group-hover:text-green-400 transition-colors">
                {song.songTitle}
              </h3>
              <p className="text-gray-400 text-sm truncate">
                {song.artistName}
                {song.albumName && ` • ${song.albumName}`}
              </p>
            </div>
            
            {/* Duration and played time */}
            <div className="text-right text-sm text-gray-400">
              <div>{formatDuration(song.duration)}</div>
              <div className="text-xs">{formatPlayedAt(song.playedAt)}</div>
            </div>
            
            {/* Play button */}
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-green-500 hover:bg-green-400 text-black">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 