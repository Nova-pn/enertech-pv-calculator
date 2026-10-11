import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { deleteSavedProject, listSavedProjects, saveProject, type SavedProject } from '../lib/projectStorage';
import { useI18n } from '../i18n';

export default function Projects() {
  const { user } = useAuth();
  const { state, setState } = useProject();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [name, setName] = useState(state.info.nomProjet);
  const [message, setMessage] = useState('');

  const refresh = async () => setProjects(await listSavedProjects(user?.id));
  useEffect(() => { void refresh(); }, [user?.id]);

  const save = async () => {
    const saved = await saveProject(name || state.info.nomProjet, state, user?.id);
    setName(saved.name); setMessage(t('projectSaved')); await refresh();
  };

  const load = (project: SavedProject) => { setState(project.state); navigate('/resultats'); };
  const remove = async (id: string) => { await deleteSavedProject(id, user?.id); await refresh(); };

  return <div className="max-w-4xl">
    <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-5 border-b border-forest-200">
      <div><p className="font-mono-num text-xs tracking-widest text-forest-700 mb-1.5">{t('project')}</p><h2 className="font-display text-2xl sm:text-3xl font-semibold text-forest-950">{t('savedProjects')}</h2><p className="text-sm text-ink/60 mt-1">{user ? t('cloudProjectHint') : t('localProjectHint')}</p></div>
      <Link to="/dimensionnement/projet" className="border border-forest-200 hover:border-forest-500 text-sm font-medium px-4 py-2.5 rounded-md">{t('newProject')}</Link>
    </div>
    <div className="border border-forest-200 rounded-lg bg-white p-5 mb-6">
      <label className="block text-sm font-medium">{t('projectName')}<input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('projectNamePlaceholder')} className="mt-1 w-full border border-forest-200 rounded-md px-3 py-2" /></label>
      <button onClick={() => void save()} className="mt-4 bg-forest-900 hover:bg-forest-700 text-white font-medium px-4 py-2.5 rounded-md">{t('saveProject')}</button>
      {message && <p className="text-sm text-forest-800 mt-3" role="status">{message}</p>}
    </div>
    {projects.length === 0 ? <div className="border border-sun-dark/40 bg-sun/10 rounded-md p-5 text-sm">{t('noSavedProjects')}</div> : <div className="space-y-3">{projects.map((project) => <article key={project.id} className="border border-forest-200 rounded-lg bg-white p-5 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display font-semibold text-forest-950">{project.name}</h3><p className="text-xs text-ink/55 mt-1">{t('lastModified')}: {new Date(project.updatedAt).toLocaleString()}</p></div><div className="flex gap-2"><button onClick={() => load(project)} className="bg-forest-900 text-white text-sm px-3 py-2 rounded">{t('openProject')}</button><button onClick={() => void remove(project.id)} className="border border-alert/40 text-alert text-sm px-3 py-2 rounded">{t('deleteProject')}</button></div></article>)}</div>}
  </div>;
}
