export enum NoteType {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  companyId: string;
  role: 'OWNER' | 'MEMBER';
}

export interface Workspace {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  noteCount: number;
}

export interface NoteHistory {
  id: string;
  noteId: string;
  content: string;
  updatedBy: string; // User ID
  timestamp: string; // ISO Date
}

export interface Note {
  id: string;
  workspaceId: string;
  companyId: string;
  title: string;
  content: string; // Markdown supported
  tags: string[];
  type: NoteType;
  isDraft: boolean;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  history: NoteHistory[];
}

export interface SearchFilters {
  query: string;
  sort: 'newest' | 'oldest' | 'popular' | 'controversial';
  tags?: string[];
}