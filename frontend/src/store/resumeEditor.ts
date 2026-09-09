/**
 * Builder state: the open document, undo/redo history and autosave.
 *
 * Every mutation goes through `commit`, which snapshots the document for undo,
 * marks the editor dirty and schedules an autosave. Keeping that in one place
 * means a new section editor cannot forget to save or to be undoable.
 */

import { create } from 'zustand';

import { completenessScore } from '@/features/resume/health';
import { createSection } from '@/features/resume/sections';
import { defaultSettings, emptyPersonalInfo } from '@/features/resume/defaults';
import { templateById } from '@/features/resume/templates/registry';
import { ApiError, errorMessage } from '@/lib/api-client';
import { resumeService } from '@/services/resume.service';
import { toast } from '@/store/toast';
import type { Resume } from '@/types/api';
import type {
  PersonalInfo,
  ResumeData,
  ResumeSection,
  ResumeSettings,
  SectionOfKind,
  SectionKind,
  SectionType,
} from '@/types/resume';

export type SaveState = 'saved' | 'dirty' | 'saving' | 'error' | 'offline';

interface EditorDocument {
  title: string;
  templateId: string;
  data: ResumeData;
  settings: ResumeSettings;
}

interface DeletedSection {
  section: ResumeSection;
  index: number;
}

interface EditorState {
  resumeId: string | null;
  status: 'idle' | 'loading' | 'ready' | 'error';
  loadError: string | null;
  doc: EditorDocument | null;

  saveState: SaveState;
  lastSavedAt: string | null;
  saveError: string | null;

  activeSectionId: string | null;
  /** Section pending removal, so the delete toast can offer Undo. */
  lastDeleted: DeletedSection | null;

  past: EditorDocument[];
  future: EditorDocument[];

  versionCount: number;
  atsScore: number | null;

  load: (id: string) => Promise<void>;
  adopt: (resume: Resume) => void;
  reset: () => void;

  setTitle: (title: string) => void;
  setTemplate: (templateId: string) => void;
  updateSettings: (patch: Partial<ResumeSettings>) => void;
  updatePersonal: (patch: Partial<PersonalInfo>) => void;

  setActiveSection: (id: string | null) => void;
  addSection: (type: SectionType, title?: string) => string;
  removeSection: (id: string) => void;
  undoDelete: () => void;
  renameSection: (id: string, title: string) => void;
  toggleSectionVisibility: (id: string) => void;
  reorderSections: (fromId: string, toId: string) => void;
  moveSection: (id: string, direction: -1 | 1) => void;
  updateSection: <K extends SectionKind>(
    id: string,
    recipe: (section: SectionOfKind<K>) => SectionOfKind<K>,
  ) => void;

  save: (options?: { silent?: boolean }) => Promise<boolean>;
  undo: () => void;
  redo: () => void;
  completeness: () => number;
}

const AUTOSAVE_DELAY = 1200;
const HISTORY_LIMIT = 60;
/** Successive edits with the same key inside this window collapse into one. */
const COALESCE_WINDOW = 700;

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
let lastCommitKey: string | null = null;
let lastCommitAt = 0;
/** Guards against two autosaves racing and clobbering each other. */
let saveInFlight: Promise<boolean> | null = null;

function cloneDoc(doc: EditorDocument): EditorDocument {
  return {
    title: doc.title,
    templateId: doc.templateId,
    data: structuredClone(doc.data),
    settings: { ...doc.settings },
  };
}

function cancelAutosave(): void {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
}

export const useResumeEditor = create<EditorState>((set, get) => {
  /**
   * Apply a document mutation.
   *
   * @param key    Coalescing key - repeated edits to the same field collapse
   *               into a single undo entry.
   * @param immediate Skip the autosave debounce (used for structural changes).
   */
  function commit(
    recipe: (doc: EditorDocument) => EditorDocument,
    options: { key?: string; immediate?: boolean; history?: boolean } = {},
  ): void {
    const state = get();
    if (!state.doc) return;

    const previous = state.doc;
    const next = recipe(cloneDoc(previous));
    const { key, immediate = false, history = true } = options;

    let past = state.past;
    if (history) {
      const now = Date.now();
      const coalesce = Boolean(key) && key === lastCommitKey && now - lastCommitAt < COALESCE_WINDOW;
      lastCommitKey = key ?? null;
      lastCommitAt = now;
      if (!coalesce) past = [...state.past, previous].slice(-HISTORY_LIMIT);
    }

    set({ doc: next, past, future: [], saveState: 'dirty' });
    scheduleSave(immediate);
  }

  function scheduleSave(immediate: boolean): void {
    cancelAutosave();
    if (!get().resumeId) return;
    autosaveTimer = setTimeout(
      () => {
        void get().save({ silent: true });
      },
      immediate ? 150 : AUTOSAVE_DELAY,
    );
  }

  function replaceSections(
    doc: EditorDocument,
    recipe: (sections: ResumeSection[]) => ResumeSection[],
  ): EditorDocument {
    return { ...doc, data: { ...doc.data, sections: recipe(doc.data.sections) } };
  }

  return {
    resumeId: null,
    status: 'idle',
    loadError: null,
    doc: null,
    saveState: 'saved',
    lastSavedAt: null,
    saveError: null,
    activeSectionId: null,
    lastDeleted: null,
    past: [],
    future: [],
    versionCount: 0,
    atsScore: null,

    async load(id) {
      if (get().resumeId === id && get().status === 'ready') return;
      cancelAutosave();
      set({ status: 'loading', loadError: null, resumeId: id, doc: null });
      try {
        get().adopt(await resumeService.get(id));
      } catch (error) {
        set({
          status: 'error',
          loadError: errorMessage(error, 'We could not open that resume.'),
        });
      }
    },

    adopt(resume) {
      set({
        resumeId: resume.id,
        status: 'ready',
        loadError: null,
        doc: {
          title: resume.title,
          templateId: resume.templateId,
          data: {
            ...resume.data,
            personal: { ...emptyPersonalInfo(), ...resume.data.personal },
          },
          settings: { ...defaultSettings(), ...resume.settings },
        },
        saveState: 'saved',
        saveError: null,
        lastSavedAt: resume.updatedAt,
        past: [],
        future: [],
        activeSectionId: resume.data.sections[0]?.id ?? null,
        versionCount: resume.versionCount,
        atsScore: resume.atsScore,
      });
    },

    reset() {
      cancelAutosave();
      lastCommitKey = null;
      set({
        resumeId: null,
        status: 'idle',
        doc: null,
        past: [],
        future: [],
        activeSectionId: null,
        lastDeleted: null,
        saveState: 'saved',
        saveError: null,
      });
    },

    setTitle(title) {
      commit((doc) => ({ ...doc, title }), { key: 'title' });
    },

    setTemplate(templateId) {
      const defaults = templateById(templateId).settingsDefaults;
      commit(
        (doc) => ({
          ...doc,
          templateId,
          settings: defaults ? { ...doc.settings, ...defaults } : doc.settings,
        }),
        { immediate: true },
      );
    },

    updateSettings(patch) {
      commit((doc) => ({ ...doc, settings: { ...doc.settings, ...patch } }), {
        key: `settings:${Object.keys(patch).join(',')}`,
      });
    },

    updatePersonal(patch) {
      commit(
        (doc) => ({ ...doc, data: { ...doc.data, personal: { ...doc.data.personal, ...patch } } }),
        { key: `personal:${Object.keys(patch).join(',')}` },
      );
    },

    setActiveSection(id) {
      set({ activeSectionId: id });
    },

    addSection(type, title) {
      const section = createSection(type, title);
      commit((doc) => replaceSections(doc, (sections) => [...sections, section]), {
        immediate: true,
      });
      set({ activeSectionId: section.id });
      return section.id;
    },

    removeSection(id) {
      const doc = get().doc;
      if (!doc) return;
      const index = doc.data.sections.findIndex((section) => section.id === id);
      if (index === -1) return;
      const section = doc.data.sections[index];

      commit(
        (draft) =>
          replaceSections(draft, (sections) => sections.filter((entry) => entry.id !== id)),
        { immediate: true },
      );

      const remaining = get().doc?.data.sections ?? [];
      set({
        lastDeleted: { section, index },
        activeSectionId:
          get().activeSectionId === id
            ? (remaining[Math.min(index, remaining.length - 1)]?.id ?? null)
            : get().activeSectionId,
      });

      toast.withAction(
        `${section.title} removed`,
        { label: 'Undo', onClick: () => get().undoDelete() },
        'The section and its content were removed from this resume.',
      );
    },

    undoDelete() {
      const pending = get().lastDeleted;
      if (!pending) return;
      commit(
        (doc) =>
          replaceSections(doc, (sections) => {
            const next = [...sections];
            next.splice(Math.min(pending.index, next.length), 0, pending.section);
            return next;
          }),
        { immediate: true },
      );
      set({ lastDeleted: null, activeSectionId: pending.section.id });
    },

    renameSection(id, title) {
      commit(
        (doc) =>
          replaceSections(doc, (sections) =>
            sections.map((section) => (section.id === id ? { ...section, title } : section)),
          ),
        { key: `rename:${id}` },
      );
    },

    toggleSectionVisibility(id) {
      commit(
        (doc) =>
          replaceSections(doc, (sections) =>
            sections.map((section) =>
              section.id === id ? { ...section, visible: !section.visible } : section,
            ),
          ),
        { immediate: true },
      );
    },

    reorderSections(fromId, toId) {
      if (fromId === toId) return;
      commit(
        (doc) =>
          replaceSections(doc, (sections) => {
            const from = sections.findIndex((section) => section.id === fromId);
            const to = sections.findIndex((section) => section.id === toId);
            if (from === -1 || to === -1) return sections;
            const next = [...sections];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
          }),
        { immediate: true },
      );
    },

    moveSection(id, direction) {
      const sections = get().doc?.data.sections ?? [];
      const index = sections.findIndex((section) => section.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= sections.length) return;
      get().reorderSections(id, sections[target].id);
    },

    updateSection(id, recipe) {
      commit(
        (doc) =>
          replaceSections(doc, (sections) =>
            sections.map((section) =>
              section.id === id
                ? (recipe(section as never) as unknown as ResumeSection)
                : section,
            ),
          ),
        { key: `section:${id}` },
      );
    },

    async save(options = {}) {
      const { resumeId, doc } = get();
      if (!resumeId || !doc) return false;
      if (saveInFlight) return saveInFlight;

      cancelAutosave();
      const silent = options.silent ?? false;
      set({ saveState: 'saving', saveError: null });

      saveInFlight = (async () => {
        try {
          const saved = await resumeService.update(resumeId, {
            title: doc.title,
            templateId: doc.templateId,
            data: doc.data,
            settings: doc.settings,
            autosave: silent,
          });
          // A newer edit may have landed while the request was in flight.
          const stillDirty = get().doc !== doc;
          set({
            saveState: stillDirty ? 'dirty' : 'saved',
            lastSavedAt: saved.updatedAt,
            versionCount: saved.versionCount,
            atsScore: saved.atsScore,
          });
          if (!silent) toast.success('Resume saved');
          return true;
        } catch (error) {
          const offline = error instanceof ApiError && error.isNetworkError;
          set({
            saveState: offline ? 'offline' : 'error',
            saveError: errorMessage(error, 'We could not save your changes.'),
          });
          if (!silent || !offline) {
            toast.error(
              offline ? 'You appear to be offline' : 'Changes not saved',
              errorMessage(error, 'We could not save your changes. Your edits are still here.'),
            );
          }
          return false;
        } finally {
          saveInFlight = null;
        }
      })();

      return saveInFlight;
    },

    undo() {
      const { past, doc, future } = get();
      if (!doc || past.length === 0) return;
      const previous = past[past.length - 1];
      lastCommitKey = null;
      set({
        doc: previous,
        past: past.slice(0, -1),
        future: [doc, ...future].slice(0, HISTORY_LIMIT),
        saveState: 'dirty',
      });
      scheduleSave(true);
    },

    redo() {
      const { future, doc, past } = get();
      if (!doc || future.length === 0) return;
      const [next, ...rest] = future;
      lastCommitKey = null;
      set({
        doc: next,
        future: rest,
        past: [...past, doc].slice(-HISTORY_LIMIT),
        saveState: 'dirty',
      });
      scheduleSave(true);
    },

    completeness() {
      const doc = get().doc;
      return doc ? completenessScore(doc.data) : 0;
    },
  };
});

// --- Selectors --------------------------------------------------------------

export const selectSections = (state: EditorState): ResumeSection[] =>
  state.doc?.data.sections ?? [];

export const selectActiveSection = (state: EditorState): ResumeSection | null => {
  const sections = state.doc?.data.sections ?? [];
  return sections.find((section) => section.id === state.activeSectionId) ?? null;
};

export const selectCanUndo = (state: EditorState): boolean => state.past.length > 0;
export const selectCanRedo = (state: EditorState): boolean => state.future.length > 0;
