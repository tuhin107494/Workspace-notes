import React, { useState } from 'react';
import Layout from './components/Layout';
import PublicDirectory from './pages/PublicDirectory';
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import NoteEditor from './pages/NoteEditor';
import Auth from './pages/Auth';
import SystemDesign from './components/SystemDesign';
import { User } from './types';
import { logout } from './services/mockData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'workspace'>('workspace');
  const [view, setView] = useState<'list' | 'editor'>('list');
  
  // State to pass to the editor
  const [editorContext, setEditorContext] = useState<{ noteId?: string, workspaceId?: string }>({ workspaceId: '' });

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('list');
    setActiveTab('workspace');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleNavigate = (tab: 'public' | 'workspace') => {
    setActiveTab(tab);
    setView('list');
  };

  const handleEditNote = (noteId?: string, workspaceId?: string) => {
    if (workspaceId) {
      setEditorContext({ noteId, workspaceId });
      setView('editor');
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout activeTab={activeTab} onNavigate={handleNavigate} user={user} onLogout={handleLogout}>
      {view === 'list' && activeTab === 'public' && (
        <PublicDirectory />
      )}
      
      {view === 'list' && activeTab === 'workspace' && (
        <WorkspaceDashboard onEditNote={handleEditNote} />
      )}
      
      {view === 'editor' && (
        <NoteEditor 
          noteId={editorContext.noteId} 
          workspaceId={editorContext.workspaceId || ''} 
          onBack={() => setView('list')}
        />
      )}
      
      {/* Overlay for Architecture Docs */}
      <SystemDesign />
    </Layout>
  );
}
