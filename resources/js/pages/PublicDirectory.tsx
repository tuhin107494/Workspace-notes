import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { getPublicNotes, voteNote } from '../services/apiClient';
import NoteCard from '../components/NoteCard';

const PublicDirectory: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular' | 'downvotes'>('popular');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sort]);

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { items, next_cursor } = await getPublicNotes(search, sort, 24);
      setNotes(items);
      setNextCursor(next_cursor ?? null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load public notes');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    setError(null);
    try {
      const { items, next_cursor } = await getPublicNotes(search, sort, 24, nextCursor);
      setNotes(prev => [...prev, ...items]);
      setNextCursor(next_cursor ?? null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load more notes');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleVote = async (id: string, type: 'up' | 'down') => {
    // Optimistic UI update then call API; revert on failure
    const previous = notes;
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          upvotes: type === 'up' ? n.upvotes + 1 : n.upvotes,
          downvotes: type === 'down' ? n.downvotes + 1 : n.downvotes
        };
      }
      return n;
    }));

    try {
      const resp = await voteNote(id, type);
      // If API returns authoritative counts, patch the note
      if (resp && typeof resp.up === 'number') {
        setNotes(prev => prev.map(n => n.id === id ? ({ ...n, upvotes: resp.up, downvotes: resp.down }) : n));
      }
    } catch (err: any) {
      // revert optimistic update
      setNotes(previous);
      setError(err?.message || 'Failed to submit vote');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative p-8 md:p-12">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Public Knowledge Base
            </h1>
            <p className="text-indigo-100 text-lg md:text-xl mb-8 leading-relaxed">
              Explore thousands of public notes, technical documentations, and ideas shared by companies around the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
               <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search public notes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 block w-full rounded-xl border-none bg-white/10 backdrop-blur-md text-white placeholder-indigo-200 focus:ring-2 focus:ring-white/50 focus:bg-white/20 py-4 shadow-sm"
                />
              </div>
              
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value as any)}
                className="rounded-xl border-none bg-indigo-800/50 backdrop-blur text-white focus:ring-2 focus:ring-white/50 py-4 px-8 cursor-pointer font-medium hover:bg-indigo-800/70 transition-colors"
              >
                <option value="popular">🔥 Most Upvotes</option>
                <option value="downvotes">👎 Most Downvotes</option>
                <option value="newest">🕒 Newest</option>
                <option value="oldest">🕰️ Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              showVoting 
              onVote={handleVote} 
              onClick={() => {}} 
            />
          ))}
          {notes.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">No notes found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>

        {error && (
          <div className="col-span-full text-center text-red-600 mt-4">{error}</div>
        )}

        {nextCursor && (
          <div className="col-span-full flex justify-center mt-6">
            <button onClick={loadMore} disabled={loadingMore} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default PublicDirectory;