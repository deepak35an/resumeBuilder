/**
 * Profile photos are stored as compressed JPEG data URLs on PersonalInfo.
 * Only templates that opt in render them; ATS-first layouts ignore the field.
 */

import type { ResumeSettings } from '@/types/resume';

export const PHOTO_MAX_SOURCE_BYTES = 5 * 1024 * 1024;
export const PHOTO_MAX_EDGE = 512;
export const PHOTO_JPEG_QUALITY = 0.82;

export const PHOTO_SIZE_PT: Record<ResumeSettings['photoSize'], number> = {
  sm: 56,
  md: 72,
  lg: 96,
};

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

/** Gallery/sample avatar so photo templates look filled without a real portrait. */
export function initialsAvatarDataUrl(name: string, accent = '#1e3a5f'): string {
  const initials = initialsFromName(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><rect width="256" height="256" fill="${accent}"/><text x="128" y="148" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="92" font-weight="600" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function compressResumePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    throw new Error('Choose a JPEG, PNG or WebP image.');
  }
  if (file.size > PHOTO_MAX_SOURCE_BYTES) {
    throw new Error('Photos must be under 5 MB before compression.');
  }

  const bitmap = await createImageBitmap(file);
  const edge = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - edge) / 2;
  const sy = (bitmap.height - edge) / 2;
  const size = Math.min(PHOTO_MAX_EDGE, edge);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Could not process that image.');
  }
  ctx.drawImage(bitmap, sx, sy, edge, edge, 0, 0, size, size);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', PHOTO_JPEG_QUALITY);
}
