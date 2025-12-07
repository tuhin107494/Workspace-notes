import { authFetch } from '../auth';

function normalizeResponse(resp: any) {
  // axios returns { data } where data may be payload or wrapper
  const data = resp?.data ?? resp;

  // If API wraps arrays in common envelopes, try to extract the array payload.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.workspaces)) return data.workspaces;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return data;
}

export async function getWorkspaces() {
  const resp = await authFetch('/workspaces', { method: 'get' });
  const payload = resp?.data ?? resp;

  // Extract items array from common envelopes
  const items = Array.isArray(payload)
    ? payload
    : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.workspaces) ? payload.workspaces : (Array.isArray(payload?.items) ? payload.items : [])));

  const mapped = (items || []).map((w: any) => ({
    id: String(w.id),
    companyId: w.company_id ?? w.user_id ?? '',
    name: w.name ?? '',
    description: w.description ?? null,
    noteCount: Number(w.notes_count ?? w.note_count ?? w.noteCount ?? 0),
  }));

  return {
    items: mapped,
    next_cursor: payload?.next_cursor ?? payload?.nextCursor ?? null,
  };
}

export async function getWorkspaceNotes(workspaceId: string, search = '') {
  const params: any = {};
  if (search) params.search = search;
  const resp = await authFetch(`/workspaces/${workspaceId}/notes`, { method: 'get', params });
  const payload = resp?.data ?? resp;
  const items = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
  return items.map(mapNoteResource);
}

function mapNoteResource(r: any) {
  // r matches NoteResource shape from backend
  return {
    id: String(r.id),
    workspaceId: r.workspace?.id ? String(r.workspace.id) : (r.workspaceId ?? '') ,
    companyId: r.company_id ?? '',
    title: r.title ?? '',
    content: r.content ?? '',
    // backend now returns `type` and `is_draft` (matching migrations/resources)
    tags: Array.isArray(r.tags) ? r.tags : [],
    type: (r.type || 'private') as any,
    isDraft: !!(r.is_draft ?? r.isDraft ?? r.draft),
    upvotes: Number(r.votes?.up ?? 0),
    downvotes: Number(r.votes?.down ?? 0),
    createdAt: r.created_at ?? r.createdAt ?? '',
    updatedAt: r.updated_at ?? r.updatedAt ?? '',
    authorId: r.author_id ?? r.user_id ?? '',
    history: r.history ?? [],
  };
}

export async function getPublicNotes(search = '', sort = 'popular', per_page = 20, lastId?: string | null) {

    console.log("Fetching public notes with params:", { search, sort, per_page, lastId });
  const params: any = { per_page };
  if (search) params.search = search;
  if (sort) params.sort = sort === 'popular' ? 'upvotes' : (sort === 'downvotes' ? 'downvotes' : sort);
  if (lastId) params.last_id = lastId;

  const resp = await authFetch('/notes', { method: 'get', params });
  const payload = resp?.data ?? resp;
  const items = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
  return {
    items: items.map(mapNoteResource),
    next_cursor: payload?.next_cursor ?? payload?.nextCursor ?? null,
  };
}

export async function getNoteById(id: string) {
  const resp = await authFetch(`/notes/${id}`, { method: 'get' });
  const payload = resp?.data ?? resp;
  const data = payload?.data ?? payload;
  return mapNoteResource(data);
}

export async function createWorkspace(name: string) {
  const resp = await authFetch('/workspaces', { method: 'post', data: { name } });
  const payload = resp?.data ?? resp;
  // Controller returns { data: workspace }
  const w = payload?.data ?? payload;
  return {
    id: String(w.id),
    companyId: w.company_id ?? w.user_id ?? '',
    name: w.name ?? '',
    description: w.description ?? null,
    noteCount: Number(w.notes_count ?? w.note_count ?? 0),
  };
}

export async function deleteNote(id: string) {
  const resp = await authFetch(`/notes/${id}`, { method: 'delete' });
  return normalizeResponse(resp);
}

export async function saveNote(note: any) {
  if (note.id) {
    // map frontend camelCase `isDraft` to API `is_draft`
    const updatePayload = { ...note, is_draft: !!note.isDraft };
    const resp = await authFetch(`/notes/${note.id}`, { method: 'put', data: updatePayload });
    const payload = resp?.data ?? resp;
    return mapNoteResource(payload?.data ?? payload);
  }

  // create under workspace
  // map camelCase client props to API expected keys
  const createPayload = { ...note, is_draft: !!note.isDraft };
  const resp = await authFetch(`/workspaces/${note.workspaceId}/notes`, { method: 'post', data: createPayload });
  const payload = resp?.data ?? resp;
  return mapNoteResource(payload?.data ?? payload);
}

export async function voteNote(id: string, type: 'up' | 'down') {
  const resp = await authFetch(`/notes/${id}/vote`, { method: 'post', data: { vote: type } });
  const payload = resp?.data ?? resp;
  // return the updated counts
  return payload?.data?.votes ?? payload?.data ?? payload;
}

export default {
  getWorkspaces,
  getWorkspaceNotes,
  createWorkspace,
  deleteNote,
  getPublicNotes,
  getNoteById,
  saveNote,
  voteNote,
};
