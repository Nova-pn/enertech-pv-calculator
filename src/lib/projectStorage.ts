import type { ProjectState } from '../types';
import { supabase } from './supabase';

export interface SavedProject {
  id: string;
  name: string;
  state: ProjectState;
  updatedAt: string;
}

const LOCAL_KEY = 'enertech-saved-projects';

type StoredLocalProject = SavedProject;

function readLocal(): SavedProject[] {
  try {
    const value = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as StoredLocalProject[];
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function writeLocal(projects: SavedProject[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(projects.slice(0, 50)));
}

export async function listSavedProjects(userId?: string): Promise<SavedProject[]> {
  if (supabase && userId) {
    const { data, error } = await supabase.from('projects').select('id,name,state,updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(50);
    if (!error && data) return data.map((row) => ({ id: row.id as string, name: row.name as string, state: row.state as ProjectState, updatedAt: row.updated_at as string }));
  }
  return readLocal().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveProject(name: string, state: ProjectState, userId?: string, id?: string): Promise<SavedProject> {
  const project: SavedProject = { id: id || crypto.randomUUID(), name: name.trim() || 'Projet sans nom', state, updatedAt: new Date().toISOString() };
  if (supabase && userId) {
    const { data, error } = await supabase.from('projects').upsert({ id: project.id, user_id: userId, name: project.name, state: project.state, updated_at: project.updatedAt }, { onConflict: 'id' }).select('id,name,state,updated_at').single();
    if (!error && data) return { id: data.id as string, name: data.name as string, state: data.state as ProjectState, updatedAt: data.updated_at as string };
  }
  const projects = readLocal().filter((item) => item.id !== project.id);
  writeLocal([project, ...projects]);
  return project;
}

export async function deleteSavedProject(id: string, userId?: string): Promise<void> {
  if (supabase && userId) await supabase.from('projects').delete().eq('id', id).eq('user_id', userId);
  writeLocal(readLocal().filter((item) => item.id !== id));
}
