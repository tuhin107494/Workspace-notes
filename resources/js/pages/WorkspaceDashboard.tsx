import React, { useState, useEffect } from 'react';
import { Note, Workspace } from '../types';
import { getWorkspaces, getWorkspaceNotes, createWorkspace, deleteNote } from '../services/apiClient';
import NoteCard from '../components/NoteCard';
import { getAvatarColor } from '../utils/colors';

interface WorkspaceDashboardProps {
  onEditNote: (noteId?: string, workspaceId?: string) => void;
}

const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({ onEditNote }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Initial Load of Workspaces
  useEffect(() => {
    (async () => {
      try {
        const { items, next_cursor } = await getWorkspaces();
        setWorkspaces(items || []);
        setNextCursor(next_cursor ?? null);
        if ((items || []).length > 0) setSelectedWorkspace(items[0].id);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load workspaces', err);
        setWorkspaces([]);
      }
    })();
  }, []);

  // Load Notes when workspace or search changes
  useEffect(() => {
    if (!selectedWorkspace) return;
    
    setLoading(true);
    getWorkspaceNotes(selectedWorkspace, search)
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [selectedWorkspace, search]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsCreating(true);
    try {
      const newWs = await createWorkspace(newWorkspaceName);
      // createWorkspace returns a workspace object (unwrapped)
      setWorkspaces([newWs, ...workspaces]);
      setSelectedWorkspace(newWs.id);
      setShowCreateModal(false);
      setNewWorkspaceName('');
    } catch (err) {
      alert('Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
      try {
          await deleteNote(id);
          setNotes(prev => prev.filter(n => n.id !== id));
      } catch (err) {
          alert("Failed to delete note. You might not have permission.");
      }
  }

  const selectedWorkspaceObj = workspaces.find(w => w.id === selectedWorkspace);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
      
      {/* Sidebar: Workspaces */}
      <div className="w-full lg:w-72 flex-shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 tracking-tight">Your Workspaces</h2>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="text-indigo-600 hover:bg-indigo-50 rounded-full p-2 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            title="Create New Workspace"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => setSelectedWorkspace(ws.id)}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                selectedWorkspace === ws.id 
                  ? 'bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                {/** Safe display name to avoid runtime errors when `name` is missing */}
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm ${getAvatarColor(ws.name || 'Untitled')}`}>
                  {(ws.name || 'Untitled').substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="truncate block">{ws.name || 'Untitled'}</span>
                  </div>
                  <span className={`text-xs block mt-0.5 truncate ${selectedWorkspace === ws.id ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
                    {typeof ws.noteCount === 'number' ? `${ws.noteCount} notes` : '0 notes'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Notes List */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <div className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center text-white font-bold shadow-md ${selectedWorkspaceObj && selectedWorkspaceObj.name ? getAvatarColor(selectedWorkspaceObj.name) : 'bg-slate-400'}`}>
               {selectedWorkspaceObj && selectedWorkspaceObj.name ? selectedWorkspaceObj.name.substring(0, 1).toUpperCase() : ''}
             </div>
             <div>
               <h1 className="text-xl font-bold text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-xs">{selectedWorkspaceObj?.name || 'Workspace'}</h1>
               <p className="text-xs text-slate-500">Workspace Dashboard</p>
             </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto items-center">
            <div className="relative flex-1 sm:w-64">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border transition-shadow"
              />
            </div>
            
            <button
              onClick={() => onEditNote(undefined, selectedWorkspace!)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
             <div className="flex justify-center items-center h-full flex-col gap-3">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
               <p className="text-slate-400 text-sm animate-pulse">Loading workspace...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {notes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onClick={(n) => onEditNote(n.id, selectedWorkspace!)}
                  onDelete={handleDeleteNote}
                />
              ))}
              {notes.length === 0 && (
                <div className="col-span-full text-center py-24 flex flex-col items-center justify-center">
                  <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-slate-500 text-lg font-medium">No notes found.</p>
                  <p className="text-slate-400 text-sm mt-1 max-w-sm">Get started by creating your first note in this workspace.</p>
                  <button onClick={() => onEditNote(undefined, selectedWorkspace!)} className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                    Create now &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
            <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
               <h3 className="text-xl font-bold relative z-10">Create New Workspace</h3>
               <p className="text-indigo-100 text-sm mt-1 relative z-10">Organize your team's knowledge.</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCreateWorkspace}>
                <div className="mb-6">
                  <label htmlFor="workspaceName" className="block text-sm font-semibold text-slate-700 mb-2">Workspace Name</label>
                  <input
                    id="workspaceName"
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Engineering Team"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setNewWorkspaceName(''); }}
                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center hover:-translate-y-0.5"
                  >
                    {isCreating ? 'Creating...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDashboard;