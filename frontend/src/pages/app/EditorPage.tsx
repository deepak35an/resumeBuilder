import { Eye, History, Redo2, Sparkles, Undo2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Seo } from '@/components/seo/Seo';
import { Alert, Button, IconButton, Input, Skeleton } from '@/components/ui';
import { ExportReviewModal } from '@/features/resume/editor/ExportReviewModal';
import { PersonalEditor } from '@/features/resume/editor/PersonalEditor';
import { ResumeCopilotSheet } from '@/features/resume/editor/ResumeCopilotSheet';
import { ResumeHealth } from '@/features/resume/editor/ResumeHealth';
import { PERSONAL_PANEL_ID, SectionNav } from '@/features/resume/editor/SectionNav';
import { SectionEditor } from '@/features/resume/editor/SectionEditor';
import { VersionsSheet } from '@/features/resume/editor/VersionsSheet';
import { ResumePreview } from '@/features/resume/render/ResumePreview';
import { TEMPLATES } from '@/features/resume/templates/registry';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { formatRelativeTime } from '@/lib/utils';
import {
  selectActiveSection,
  selectCanRedo,
  selectCanUndo,
  useResumeEditor,
} from '@/store/resumeEditor';

function SaveIndicator() {
  const saveState = useResumeEditor((state) => state.saveState);
  const lastSavedAt = useResumeEditor((state) => state.lastSavedAt);

  const label =
    saveState === 'saving'
      ? '◌ Saving...'
      : saveState === 'saved'
        ? '● Saved'
        : saveState === 'offline'
          ? 'Offline — edits kept locally'
          : saveState === 'error'
            ? 'Save failed'
            : 'Unsaved';

  return (
    <p className="text-xs text-muted-foreground" aria-live="polite">
      {label}
      {saveState === 'saved' && lastSavedAt ? ` · ${formatRelativeTime(lastSavedAt)}` : ''}
    </p>
  );
}

export default function EditorPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const load = useResumeEditor((state) => state.load);
  const reset = useResumeEditor((state) => state.reset);
  const save = useResumeEditor((state) => state.save);
  const undo = useResumeEditor((state) => state.undo);
  const redo = useResumeEditor((state) => state.redo);
  const setTitle = useResumeEditor((state) => state.setTitle);
  const setTemplate = useResumeEditor((state) => state.setTemplate);
  const setActiveSection = useResumeEditor((state) => state.setActiveSection);
  const updateSection = useResumeEditor((state) => state.updateSection);

  const status = useResumeEditor((state) => state.status);
  const loadError = useResumeEditor((state) => state.loadError);
  const doc = useResumeEditor((state) => state.doc);
  const activeSectionId = useResumeEditor((state) => state.activeSectionId);
  const section = useResumeEditor(selectActiveSection);
  const canUndo = useResumeEditor(selectCanUndo);
  const canRedo = useResumeEditor(selectCanRedo);

  const [exportOpen, setExportOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(searchParams.get('versions') === '1');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [mobilePreview, setMobilePreview] = useState(false);

  useEffect(() => {
    if (id) void load(id);
    return () => reset();
  }, [id, load, reset]);

  useEffect(() => {
    if (searchParams.get('versions') === '1') setVersionsOpen(true);
  }, [searchParams]);

  useKeyboardShortcut(
    's',
    () => {
      void save();
    },
    { meta: true, allowInInput: true },
  );
  useKeyboardShortcut('z', () => undo(), { meta: true });
  useKeyboardShortcut('z', () => redo(), { meta: true, shift: true });
  useKeyboardShortcut('p', () => setExportOpen(true), { meta: true });

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="p-6">
        <Seo title="Resume editor" description="Editing a resume." noindex />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-[70vh]" />
      </div>
    );
  }

  if (status === 'error' || !doc || !id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Seo title="Could not open resume" description="Resume failed to load." noindex />
        <Alert tone="danger" title="We could not open that resume">
          {loadError ?? 'Try going back to your resumes.'}
        </Alert>
        <Button className="mt-4" variant="secondary" onClick={() => id && void load(id)}>
          Try again
        </Button>
      </div>
    );
  }

  const editingPersonal = activeSectionId === PERSONAL_PANEL_ID || !section;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-background">
      <Seo title={doc.title || 'Resume editor'} description="Editing a resume." noindex />

      <header className="flex flex-wrap items-center gap-3 border-b border-border px-3 py-2 sm:px-4">
        <Input
          value={doc.title}
          aria-label="Resume title"
          className="max-w-xs border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          onChange={(event) => setTitle(event.target.value)}
        />
        <SaveIndicator />
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <IconButton label="Undo" icon={<Undo2 />} disabled={!canUndo} onClick={() => undo()} />
          <IconButton label="Redo" icon={<Redo2 />} disabled={!canRedo} onClick={() => redo()} />
          <select
            aria-label="Template"
            className="hidden h-8 max-w-[11rem] rounded-md border border-border bg-surface px-2 text-xs sm:block"
            value={doc.templateId}
            onChange={(event) => setTemplate(event.target.value)}
          >
            {TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          <Button size="sm" variant="ghost" leadingIcon={<Sparkles />} onClick={() => setCopilotOpen(true)}>
            Copilot
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leadingIcon={<History />}
            onClick={() => setVersionsOpen(true)}
          >
            Versions
          </Button>
          <Button size="sm" className="md:hidden" variant="subtle" leadingIcon={<Eye />} onClick={() => setMobilePreview((v) => !v)}>
            {mobilePreview ? 'Edit' : 'Preview'}
          </Button>
          <Button size="sm" onClick={() => setExportOpen(true)}>
            Export
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[16rem_minmax(0,22rem)_1fr]">
        <aside className={`${mobilePreview ? 'hidden' : 'flex'} min-h-0 flex-col border-r border-border md:flex`}>
          <SectionNav />
        </aside>

        <section
          className={`${mobilePreview ? 'hidden' : 'flex'} min-h-0 flex-col overflow-y-auto border-r border-border p-4 md:flex`}
        >
          {editingPersonal ? (
            <PersonalEditor />
          ) : (
            section && (
              <SectionEditor
                section={section}
                onChange={(next) => updateSection(next.id, () => next as never)}
              />
            )
          )}
        </section>

        <section className={`${mobilePreview ? 'flex' : 'hidden'} min-h-0 flex-col md:flex`}>
          <ResumePreview data={doc.data} settings={doc.settings} templateId={doc.templateId} />
        </section>
      </div>

      <div className="pointer-events-none fixed bottom-20 right-4 z-20 hidden w-72 md:block">
        <div className="pointer-events-auto rounded-xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur">
          <ResumeHealth
            onJumpToSection={(type) => {
              const match = doc.data.sections.find((entry) => entry.type === type);
              if (match) setActiveSection(match.id);
            }}
          />
        </div>
      </div>

      <ExportReviewModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <VersionsSheet
        open={versionsOpen}
        onClose={() => {
          setVersionsOpen(false);
          if (searchParams.get('versions')) {
            searchParams.delete('versions');
            setSearchParams(searchParams, { replace: true });
          }
        }}
        resumeId={id}
      />
      <ResumeCopilotSheet open={copilotOpen} onClose={() => setCopilotOpen(false)} />
    </div>
  );
}
