import { FileDown, FileText } from 'lucide-react';
import { useState } from 'react';

import { Alert, Button, Modal, Progress } from '@/components/ui';
import { healthChecks } from '@/features/resume/health';
import { ApiError, errorMessage } from '@/lib/api-client';
import { serializeResumeForExport, printResumeHtml } from '@/lib/resume-export-html';
import { downloadBlob, toFileNamePart } from '@/lib/utils';
import { exportService } from '@/services/export.service';
import { useResumeEditor } from '@/store/resumeEditor';
import { toast } from '@/store/toast';

export function ExportReviewModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const resumeId = useResumeEditor((state) => state.resumeId);
  const doc = useResumeEditor((state) => state.doc);
  const save = useResumeEditor((state) => state.save);
  const completeness = useResumeEditor((state) => state.completeness());
  const [busy, setBusy] = useState<'pdf' | 'docx' | null>(null);

  if (!doc) return null;

  const outstanding = healthChecks(doc.data).filter((check) => !check.done);
  const filenameBase = toFileNamePart(doc.data.personal.fullName || doc.title || 'Resume');

  const download = async (kind: 'pdf' | 'docx') => {
    setBusy(kind);
    try {
      await save({ silent: true });
      const html = serializeResumeForExport({ pageSize: doc.settings.pageSize });
      const payload = {
        resumeId: resumeId ?? undefined,
        data: doc.data,
        settings: doc.settings,
        templateId: doc.templateId,
        html: html || undefined,
      };
      try {
        const result = kind === 'pdf' ? await exportService.pdf(payload) : await exportService.docx(payload);
        downloadBlob(result.blob, result.filename ?? `${filenameBase}_Resume.${kind}`);
        toast.success(kind === 'pdf' ? 'PDF ready' : 'DOCX ready');
      } catch (error) {
        if (
          kind === 'pdf' &&
          html &&
          error instanceof ApiError &&
          error.code === 'pdf_engine_unavailable'
        ) {
          printResumeHtml(html);
          toast.info(
            'Save as PDF in the print dialog',
            'Choose “Save as PDF” so the file matches the template in the preview.',
          );
          return;
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof ApiError && error.requiresUpgrade) {
        toast.warning('Export limit reached', error.message);
      } else {
        toast.error('Export failed', errorMessage(error));
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review before you export"
      description="Check completeness first. Exports contain selectable text — never a screenshot."
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Keep editing
          </Button>
          <Button
            variant="secondary"
            leadingIcon={<FileText />}
            loading={busy === 'docx'}
            disabled={busy !== null}
            onClick={() => void download('docx')}
          >
            Download DOCX
          </Button>
          <Button
            leadingIcon={<FileDown />}
            loading={busy === 'pdf'}
            disabled={busy !== null}
            onClick={() => void download('pdf')}
          >
            Download PDF
          </Button>
        </div>
      }
    >
      <Progress value={completeness} label="Completeness" tone={completeness >= 80 ? 'success' : 'accent'} />
      <p className="mt-2 text-sm text-muted-foreground">{completeness}% of the health checklist is complete.</p>

      {outstanding.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {outstanding.slice(0, 6).map((check) => (
            <li key={check.id} className="text-sm text-foreground">
              {check.label}
            </li>
          ))}
        </ul>
      ) : (
        <Alert tone="success" className="mt-4">
          The checklist is complete. Skim the preview once more, then download.
        </Alert>
      )}

      <Alert tone="neutral" className="mt-4">
        Review imported or AI-generated wording before you send the file. The PDF
        and DOCX match the template in the preview. Filename:{' '}
        <span className="font-medium text-foreground">{filenameBase}_Resume.pdf</span>
      </Alert>
    </Modal>
  );
}
