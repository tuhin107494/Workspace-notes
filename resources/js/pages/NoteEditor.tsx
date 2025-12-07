import React, { useState, useEffect } from 'react';
import { Note, NoteType, NoteHistory } from '../types';
import { getNoteById, saveNote } from '../services/apiClient';
import { getTagColor } from '../utils/colors';

interface NoteEditorProps {
  noteId?: string;
  workspaceId: string;
  onBack: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ noteId, workspaceId, onBack }) => {
  const [formData, setFormData] = useState<Partial<Note>>({
    title: '',
    content: '',
    type: NoteType.PRIVATE,
    isDraft: true,
    tags: []
  });
  const [history, setHistory] = useState<NoteHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (noteId) {
      setLoading(true);
      getNoteById(noteId).then(note => {
        if (note) {
          setFormData(note);
          const h = note.history || [];
          setHistory(h);
          if (h.length > 0) setShowHistory(true);
        }
      }).finally(() => setLoading(false));
    } else {
      setFormData(prev => ({ ...prev, workspaceId }));
    }
  }, [noteId, workspaceId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveNote({
        ...formData,
        id: noteId,
        workspaceId
      });
      // Update local state to reflect saved version
      setFormData(saved);
      const h = saved.history || [];
      setHistory(h);
      if (h.length > 0) setShowHistory(true);
    } catch (e) {
      alert("Error saving note");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (historyId: string) => {
    if (!window.confirm("Restore this version? Current content will be saved to history.")) return;
    if (!noteId) return;
    // Restore via API is not implemented yet on the server. Show message.
    alert('Restore from history is not available yet.');
  };


  if (loading) return <div className="p-10 text-center text-slate-500">Loading editor...</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
      
      {/* Editor Main Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-20">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 mr-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${formData.isDraft ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wide">{formData.isDraft ? 'Draft' : 'Published'}</span>
             </div>
             
             <button
               onClick={() => setShowHistory(!showHistory)}
               className={`text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all ${showHistory ? 'bg-indigo-50 text-indigo-600' : ''}`}
               title="History"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </button>

             <button
               onClick={handleSave}
               disabled={saving}
               className={`px-5 py-2 rounded-lg text-white text-sm font-bold shadow-md shadow-indigo-200 transition-all transform active:scale-95 ${saving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
             >
               {saving ? 'Saving...' : 'Save Changes'}
             </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
          <input 
            type="text" 
            value={formData.title} 
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Untitled Note"
            className="w-full text-4xl font-extrabold text-slate-900 placeholder-slate-300 border-none focus:ring-0 p-0 mb-8 bg-transparent outline-none tracking-tight"
          />

          <div className="flex gap-4 mb-8">
             <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                <div className="relative">
                   <select 
                     value={formData.isDraft ? 'true' : 'false'}
                     onChange={e => setFormData(prev => ({ ...prev, isDraft: e.target.value === 'true' }))}
                     className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white shadow-sm"
                   >
                     <option value="true">Draft (Hidden)</option>
                     <option value="false">Published (Live)</option>
                   </select>
                </div>
             </div>
             <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visibility</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as NoteType }))}
                  className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white shadow-sm"
                >
                  <option value={NoteType.PRIVATE}>Private Workspace</option>
                  <option value={NoteType.PUBLIC}>Public Directory</option>
                </select>
             </div>
          </div>

          <div className="relative group">

             <textarea
               value={formData.content}
               onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
               placeholder="Start writing your masterpiece here... (Markdown supported)"
               className="w-full h-[500px] p-6 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none font-mono text-sm leading-7 text-slate-700 bg-white transition-all shadow-sm"
             />
             
             {aiLoading && (
               <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px] rounded-xl z-20">
                 <div className="bg-white p-4 rounded-xl shadow-2xl border border-indigo-100 flex items-center gap-3">
                   <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-indigo-900 font-medium">AI is generating content...</span>
                 </div>
               </div>
             )}
          </div>
          
          <div className="mt-8">
             <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tags</label>
             <div className="flex flex-wrap gap-2 mb-3">
               {formData.tags?.map((tag, idx) => (
                 <span key={idx} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getTagColor(tag)}`}>
                   #{tag}
                   <button 
                     onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }))}
                     className="ml-1.5 opacity-50 hover:opacity-100"
                   >
                     ×
                   </button>
                 </span>
               ))}
             </div>
             <input 
                type="text"
                placeholder="Type tags and separate with comma..."
                value={formData.tags?.join(', ')}
                onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5"
             />
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="w-80 border-l border-slate-200 bg-slate-50/80 backdrop-blur flex flex-col transition-all animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-slate-200 bg-white/50 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-slate-800">Version History</h3>
               <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">7-Day Retention</p>
             </div>
             <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded p-1">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <span className="text-3xl mb-2">🕰️</span>
                <p className="text-slate-400 text-sm">No history yet.</p>
                <p className="text-xs text-slate-400">Edits are saved automatically.</p>
              </div>
            )}
            
            {history.map(h => (
              <div key={h.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm hover:border-indigo-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">v.{h.id.substring(0,4)}</span>
                   <span className="text-[10px] font-medium text-slate-400">{new Date(h.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2 font-medium">
                  {new Date(h.timestamp).toLocaleTimeString()}
                </div>
                <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 font-mono mb-3 line-clamp-2 border border-slate-100">
                  {h.content}
                </div>
                <button 
                  onClick={() => handleRestore(h.id)}
                  className="w-full text-center py-1.5 border border-indigo-200 text-indigo-600 rounded hover:bg-indigo-600 hover:text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Restore Version
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;