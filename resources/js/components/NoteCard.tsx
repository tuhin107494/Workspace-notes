import React from 'react';
import { Note } from '../types';
import { getTagColor } from '../utils/colors';

interface NoteCardProps {
  note: Note;
  showVoting?: boolean;
  onVote?: (id: string, type: 'up' | 'down') => void;
  onClick: (note: Note) => void;
  onDelete?: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, showVoting, onVote, onClick, onDelete }) => {
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
        if(window.confirm('Are you sure you want to delete this note?')) {
            onDelete(note.id);
        }
    }
  };

  return (
    <div 
      onClick={() => onClick(note)}
      className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200 p-5 cursor-pointer flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-700 transition-colors flex-1 mr-2">{note.title}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
            {note.isDraft && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                Draft
            </span>
            )}
            {onDelete && (
                <button 
                    onClick={handleDelete}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                    title="Delete Note"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            )}
        </div>
      </div>

      <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-grow font-mono bg-slate-50/50 p-2 rounded border border-slate-100">
        {note.content.substring(0, 150)}...
      </p>

      {/* Public Workspace Context Info */}
      {showVoting && (
          <div className="mb-3 text-xs text-slate-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <span>Workspace: {note.workspaceId.split('_')[1] || note.workspaceId}</span>
          </div>
      )}

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {note.tags.slice(0, 4).map(tag => (
          <span key={tag} className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getTagColor(tag)}`}>
            #{tag}
          </span>
        ))}
        {note.tags.length > 4 && (
          <span className="text-xs text-slate-400">+{note.tags.length - 4} more</span>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
        
        {showVoting ? (
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 shadow-sm" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onVote?.(note.id, 'up')}
              className="hover:text-emerald-600 flex items-center gap-1 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              <span>{note.upvotes}</span>
            </button>
            <div className="h-3 w-[1px] bg-slate-300"></div>
            <button 
              onClick={() => onVote?.(note.id, 'down')}
              className="hover:text-rose-600 flex items-center gap-1 transition-colors font-medium"
            >
              <span>{note.downvotes}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        ) : (
          <span className="text-slate-300 font-mono text-[10px]">ID: {note.id.substring(0,8)}</span>
        )}
      </div>
    </div>
  );
};

export default NoteCard;