/** Accent, type and photo controls. Live-applied via ResumeSettings. */

import { Palette } from 'lucide-react';

import { Button, Field, SegmentedControl, Select, Switch } from '@/components/ui';
import { templateById } from '@/features/resume/templates/registry';
import { AVAILABLE_FONTS } from '@/lib/resume-style';
import { defaultSettings } from '@/features/resume/defaults';
import { useResumeEditor } from '@/store/resumeEditor';
import type { MarginSize, PhotoShape, PhotoSize } from '@/types/resume';

const ACCENT_PRESETS = [
  '#111827',
  '#1e3a5f',
  '#0f766e',
  '#4338ca',
  '#4f46e5',
  '#1f2937',
  '#0f172a',
  '#334155',
  '#6d28d9',
  '#9f1239',
];

export function DesignPanel() {
  const settings = useResumeEditor((state) => state.doc?.settings);
  const templateId = useResumeEditor((state) => state.doc?.templateId);
  const updateSettings = useResumeEditor((state) => state.updateSettings);

  if (!settings || !templateId) return null;

  const template = templateById(templateId);
  const photoEnabled = Boolean(template.supportsPhoto);

  const resetStyle = () => {
    updateSettings({
      ...defaultSettings(),
      ...template.settingsDefaults,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Design</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Colour, type and photo styling apply live to the preview. Layout stays with the template.
        </p>
      </div>

      <Field label="Accent colour">
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_PRESETS.map((color) => {
            const active = settings.accentColor.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                aria-label={`Accent ${color}`}
                aria-pressed={active}
                onClick={() => updateSettings({ accentColor: color })}
                className="h-7 w-7 rounded-full border border-border shadow-xs transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: color,
                  boxShadow: active ? `0 0 0 2px var(--background), 0 0 0 4px ${color}` : undefined,
                }}
              />
            );
          })}
          <label className="relative h-7 w-7 overflow-hidden rounded-full border border-border shadow-xs">
            <span className="sr-only">Custom accent colour</span>
            <input
              type="color"
              value={settings.accentColor}
              onChange={(event) => updateSettings({ accentColor: event.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="flex h-full w-full items-center justify-center" style={{ background: settings.accentColor }}>
              <Palette aria-hidden="true" className="h-3.5 w-3.5 text-white mix-blend-difference" />
            </span>
          </label>
        </div>
      </Field>

      <Field label="Typeface">
        <Select
          value={settings.fontFamily}
          onChange={(event) => updateSettings({ fontFamily: event.target.value })}
          options={AVAILABLE_FONTS.map((font) => ({ value: font, label: font }))}
        />
      </Field>

      <Field label="Body size">
        <SegmentedControl
          label="Body size"
          fullWidth
          value={String(settings.fontSize)}
          onChange={(value) => updateSettings({ fontSize: Number(value) })}
          options={[
            { value: '9.5', label: 'Small' },
            { value: '10.5', label: 'Medium' },
            { value: '11.5', label: 'Large' },
          ]}
        />
      </Field>

      <Field label="Page margins">
        <SegmentedControl
          label="Page margins"
          fullWidth
          value={settings.margin}
          onChange={(value) => updateSettings({ margin: value as MarginSize })}
          options={[
            { value: 'narrow', label: 'Narrow' },
            { value: 'normal', label: 'Normal' },
            { value: 'wide', label: 'Wide' },
          ]}
        />
      </Field>

      <Switch
        label="Uppercase section headings"
        checked={settings.uppercaseHeadings}
        onChange={(checked) => updateSettings({ uppercaseHeadings: checked })}
      />

      {photoEnabled ? (
        <div className="space-y-4 rounded-lg border border-border p-3">
          <p className="text-sm font-medium text-foreground">Photo</p>
          <Switch
            label="Show photo"
            description="Hidden photos stay saved so you can switch templates later."
            checked={settings.showPhoto}
            onChange={(checked) => updateSettings({ showPhoto: checked })}
          />
          <Field label="Shape">
            <SegmentedControl
              label="Photo shape"
              fullWidth
              value={settings.photoShape}
              onChange={(value) => updateSettings({ photoShape: value as PhotoShape })}
              options={[
                { value: 'circle', label: 'Circle' },
                { value: 'rounded', label: 'Rounded' },
                { value: 'square', label: 'Square' },
              ]}
            />
          </Field>
          <Field label="Size">
            <SegmentedControl
              label="Photo size"
              fullWidth
              value={settings.photoSize}
              onChange={(value) => updateSettings({ photoSize: value as PhotoSize })}
              options={[
                { value: 'sm', label: 'S' },
                { value: 'md', label: 'M' },
                { value: 'lg', label: 'L' },
              ]}
            />
          </Field>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          This template is ATS-first and does not display a photo. Switch to a Photo template to show
          one.
        </p>
      )}

      <Button size="sm" variant="secondary" onClick={resetStyle}>
        Reset to template style
      </Button>
    </div>
  );
}
