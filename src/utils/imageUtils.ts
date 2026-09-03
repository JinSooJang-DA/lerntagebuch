import { DiaryAttachment, DayEntry } from '../types';

/**
 * Resolves the display URL of an image attachment.
 * Supports:
 * - Direct base64 (data:image/...)
 * - Web URLs (http:// or https://)
 * - Public relative paths (images/foo.png -> ./images/foo.png)
 */
export function getAttachmentSrc(att?: DiaryAttachment | null): string {
  if (!att) return '';
  // Fresh local preview from base64 takes precedence if available
  if (att.dataUrl && att.dataUrl.startsWith('data:')) {
    return att.dataUrl;
  }
  const path = att.url || att.dataUrl || '';
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  // Standardize relative path to ./images/... so it works seamlessly on GitHub Pages sub-paths
  const cleanPath = path.replace(/^(\.\/|\/)/, '');
  return `./${cleanPath}`;
}

/**
 * Ensures a filename or relative path is formatted with the "images/" directory prefix
 * e.g. "screenshot.png" -> "images/screenshot.png"
 *      "images/screenshot.png" -> "images/screenshot.png"
 */
export function ensureImagesDirPrefix(pathOrName: string): string {
  if (!pathOrName) return 'images/image.png';
  let cleaned = pathOrName.trim().replace(/^(\.\/|\/)/, '');
  if (!cleaned.startsWith('images/')) {
    cleaned = `images/${cleaned}`;
  }
  return cleaned;
}

/**
 * Sanitizes entries for export to public/diary-data.json:
 * 1. Ensures every attachment has a clean 'url' property prefixed with 'images/'
 * 2. Strips huge base64 'dataUrl' strings so the JSON file stays tiny, human-readable, and git-friendly
 */
export function sanitizeEntriesForJsonExport(entries: Record<string, DayEntry>): Record<string, DayEntry> {
  const exportData: Record<string, DayEntry> = {};

  Object.keys(entries).forEach(date => {
    const entry = entries[date];
    exportData[date] = {
      ...entry,
      timeSlots: (entry.timeSlots || []).map(slot => ({
        ...slot,
        attachments: (slot.attachments || []).map(att => {
          let cleanUrl = att.url || '';
          if (!cleanUrl) {
            const safeName = (att.name || 'image.png').replace(/\s+/g, '_');
            cleanUrl = ensureImagesDirPrefix(safeName);
          } else {
            cleanUrl = ensureImagesDirPrefix(cleanUrl);
          }

          return {
            id: att.id,
            name: att.name,
            size: att.size,
            type: att.type,
            url: cleanUrl,
            uploadedAt: att.uploadedAt
            // dataUrl omitted to prevent multi-megabyte bloat in GitHub repository
          };
        })
      }))
    };
  });

  return exportData;
}

/**
 * Triggers download of a single image attachment file so user can save it directly to public/images/
 */
export function downloadAttachmentImageFile(att: DiaryAttachment): void {
  const src = getAttachmentSrc(att);
  if (!src) return;

  const safeFilename = att.name || (att.url ? att.url.replace(/^images\//, '') : 'image.png');

  const a = document.createElement('a');
  a.href = src;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
