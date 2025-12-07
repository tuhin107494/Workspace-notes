import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import PublicDirectory from './pages/PublicDirectory';
import WorkspaceDashboard from './pages/WorkspaceDashboard';
import NoteEditor from './pages/NoteEditor';
import Auth from './pages/Auth';
import SystemDesign from './components/SystemDesign';
import { User } from './types';
import { logoutUser, getSession } from './auth';

const App = () => {

  console.log("Rendering App component");
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

  // Auto-login if a session exists in localStorage
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session as User);
      setView('list');
      setActiveTab('workspace');
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
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
    console.log("No user logged in, showing Auth page");
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


export default App;