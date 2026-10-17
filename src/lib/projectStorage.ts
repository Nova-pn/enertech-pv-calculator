import type { ProjectState } from '../types';
import { supabase } from './supabase';

export interface SavedProject {
  id: string;
  name: string;
  state: ProjectState;
  updatedAt: string;
}

type StoredLocalProject = SavedProject;
const LOCAL_KEY_PREFIX = 'enertech-saved-projects';
const MAX_LOCAL_PROJECTS = 50;

function localKey(userId?: string) {
  return `${LOCAL_KEY_PREFIX}:${userId || 'anonymous'}`;
}

function readLocal(userId?: string): SavedProject[] {
  try {
    const value = JSON.parse(localStorage.getItem(localKey(userId)) || '[]') as StoredLocalProject[];
    return Array.isArray(value) ? value.filter((project) => project && typeof project.id === 'string' && typeof project.name === 'string') : [];
  } catch { return []; }
}

function writeLocal(projects: SavedProject[], userId?: string) {
  try { localStorage.setItem(localKey(userId), JSON.stringify(projects.slice(0, MAX_LOCAL_PROJECTS))); } catch { /* storage quota/private mode */ }
}

export async function listSavedProjects(userId?: string): Promise<SavedProject[]> {
  if (supabase && userId) {
    const { data, error } = await supabase.from('projects').select('id,name,state,updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(MAX_LOCAL_PROJECTS);
    if (!error && data) return data.map((row) => ({ id: row.id as string, name: row.name as string, state: row.state as ProjectState, updatedAt: row.updated_at as string }));
  }
  return readLocal(userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveProject(name: string, state: ProjectState, userId?: string, id?: string): Promise<SavedProject> {
  const project: SavedProject = { id: id || crypto.randomUUID(), name: name.trim().slice(0, 160) || 'Projet sans nom', state, updatedAt: new Date().toISOString() };
  if (supabase && userId) {
    const { data, error } = await supabase.from('projects').upsert({ id: project.id, user_id: userId, name: project.name, state: project.state, updated_at: project.updatedAt }, { onConflict: 'id' }).select('id,name,state,updated_at').single();
    if (!error && data) return { id: data.id as string, name: data.name as string, state: data.state as ProjectState, updatedAt: data.updated_at as string };
  }
  const projects = readLocal(userId).filter((item) => item.id !== project.id);
  writeLocal([project, ...projects], userId);
  return project;
}

export async function deleteSavedProject(id: string, userId?: string): Promise<void> {
  if (supabase && userId) await supabase.from('projects').delete().eq('id', id).eq('user_id', userId);
  writeLocal(readLocal(userId).filter((item) => item.id !== id), userId);
}
