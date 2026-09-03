import React, { useState } from 'react';
import { DayEntry, TimeSlotRow, DiaryAttachment } from '../types';
import { formatDatumDot, parseDateIso, getWeekdayGermanFull } from '../utils/dateUtils';
import { Plus, Edit2, Trash2, Image as ImageIcon, Copy, Check, Download, ZoomIn, Upload, Code } from 'lucide-react';

interface CleanTableDiaryProps {
  entry: DayEntry;
  onUpdateEntry: (updated: DayEntry) => void;
  onOpenImageViewer: (att: DiaryAttachment) => void;
  onCopyMarkdown: () => void;
  isCopied: boolean;
  onDownloadMarkdown: () => void;
  onOpenImportModal?: () => void;
}

export const CleanTableDiary: React.FC<CleanTableDiaryProps> = ({
  entry,
  onUpdateEntry,
  onOpenImageViewer,
  onCopyMarkdown,
  isCopied,
  onDownloadMarkdown,
  onOpenImportModal
}) => {
  const dateObj = parseDateIso(entry.date);
  const formattedDate = formatDatumDot(dateObj);
  const weekdayGerman = getWeekdayGermanFull(dateObj);

  const [editingSlot, setEditingSlot] = useState<TimeSlotRow | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  // Form states for modal
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCodeSnippet, setFormCodeSnippet] = useState('');
  const [formAttachments, setFormAttachments] = useState<DiaryAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const openAddSlot = () => {
    // Default next slot time
    const lastSlot = entry.timeSlots[entry.timeSlots.length - 1];
    let nextStart = '10:30';
    let nextEnd = '12:00';
    if (lastSlot) {
      nextStart = lastSlot.endTime || '14:00';
      const [h, m] = nextStart.split(':').map(Number);
      const endH = (h + 1) % 24;
      nextEnd = `${String(endH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
    }

    setFormStartTime(nextStart);
    setFormEndTime(nextEnd);
    setFormTitle('Fotogram Project gemacht');
    setFormContent('');
    setFormCodeSnippet('');
    setFormAttachments([]);
    setIsAddingSlot(true);
  };

  const openEditSlot = (slot: TimeSlotRow) => {
    setEditingSlot(slot);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormTitle(slot.title);
    setFormContent(slot.content || '');
    setFormCodeSnippet(slot.codeSnippet || '');
    setFormAttachments(slot.attachments || []);
  };

  const closeFormModal = () => {
    setEditingSlot(null);
    setIsAddingSlot(false);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStartTime.trim() || !formEndTime.trim() || !formTitle.trim()) return;

    const updatedSlots = [...entry.timeSlots];

    if (editingSlot) {
      const idx = updatedSlots.findIndex(s => s.id === editingSlot.id);
      if (idx !== -1) {
        updatedSlots[idx] = {
          ...editingSlot,
          startTime: formStartTime.trim(),
          endTime: formEndTime.trim(),
          title: formTitle.trim(),
          content: formContent.trim(),
          codeSnippet: formCodeSnippet.trim() || undefined,
          attachments: formAttachments
        };
      }
    } else {
      // New slot
      const newSlot: TimeSlotRow = {
        id: `slot-${Date.now()}`,
        startTime: formStartTime.trim(),
        endTime: formEndTime.trim(),
        title: formTitle.trim(),
        content: formContent.trim(),
        codeSnippet: formCodeSnippet.trim() || undefined,
        attachments: formAttachments,
        completed: true
      };
      updatedSlots.push(newSlot);
    }

    // Sort slots by start time
    updatedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    onUpdateEntry({
      ...entry,
      timeSlots: updatedSlots,
      updatedAt: new Date().toISOString()
    });

    closeFormModal();
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm('Diesen Zeitraum wirklich löschen?')) {
      const updatedSlots = entry.timeSlots.filter(s => s.id !== slotId);
      onUpdateEntry({
        ...entry,
        timeSlots: updatedSlots,
        updatedAt: new Date().toISOString()
      });
    }
  };

  // Image Upload handler for modal
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const newAtts: DiaryAttachment[] = [];
    let processed = 0;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          newAtts.push({
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: e.target.result as string,
            uploadedAt: new Date().toISOString()
          });
        }
        processed++;
        if (processed === files.length) {
          setFormAttachments(prev => [...prev, ...newAtts]);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Direct quick upload to slot from table
  const handleDirectUploadToSlot = (slotId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        const newAtt: DiaryAttachment = {
          id: `att-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target.result as string,
          uploadedAt: new Date().toISOString()
        };

        const updatedSlots = entry.timeSlots.map(s => {
          if (s.id === slotId) {
            return {
              ...s,
              attachments: [...(s.attachments || []), newAtt]
            };
          }
          return s;
        });

        onUpdateEntry({
          ...entry,
          timeSlots: updatedSlots,
          updatedAt: new Date().toISOString()
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachmentFromForm = (attId: string) => {
    setFormAttachments(prev => prev.filter(a => a.id !== attId));
  };

  return (
    <div id="clean-table-container" className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-6">
      {/* Title & Date Bar matching Screenshot 2 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
          Jin Soo Jang&apos;s Lerntagebuch
        </h1>
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-teal-700 tracking-tight">
              Datum: [{formattedDate}]
            </h2>
            <span className="text-sm font-medium text-slate-500">
              {weekdayGerman}
            </span>
          </div>

          {/* Quick Action Tools for Local and Instructor */}
          <div className="flex items-center gap-2">
            <button
              id="btn-add-slot-top"
              onClick={openAddSlot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Zeitraum hinzufügen</span>
            </button>

            <button
              id="btn-copy-markdown-top"
              onClick={onCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-sm font-medium transition-colors cursor-pointer shadow-xs"
              title="Markdown für GitHub kopieren"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Kopiert!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Markdown</span>
                </>
              )}
            </button>

            <button
              id="btn-download-md-top"
              onClick={onDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-sm font-medium transition-colors cursor-pointer shadow-xs"
              title=".md Datei herunterladen"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>.md</span>
            </button>

            {onOpenImportModal && (
              <button
                id="btn-import-clean-table"
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-md text-sm font-medium transition-colors cursor-pointer shadow-xs"
                title="Google Docs Tabelle oder JSON importieren"
              >
                <Upload className="w-4 h-4 text-teal-700" />
                <span>Docs / JSON Import</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* THE CLEAN 2-COLUMN TABLE (Zeitraum & Thema / Notizen) */}
      <div className="overflow-hidden border border-slate-300 rounded-sm bg-white shadow-xs">
        <table className="w-full border-collapse text-left">
          {/* Table Header: Dark Navy Slate (#34495e) with White Text */}
          <thead>
            <tr className="bg-[#34495e] text-white">
              <th className="w-44 sm:w-56 py-3.5 px-4 sm:px-6 font-bold text-base tracking-wide border-r border-[#435b75]">
                Zeitraum
              </th>
              <th className="py-3.5 px-4 sm:px-6 font-bold text-base tracking-wide">
                Thema &amp; Notizen
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200">
            {entry.timeSlots.map(slot => (
              <tr
                key={slot.id}
                className="group hover:bg-slate-50/70 transition-colors"
              >
                {/* Column 1: Zeitraum */}
                <td className="py-4 sm:py-5 px-4 sm:px-6 align-top border-r border-slate-200 bg-white group-hover:bg-slate-50/70">
                  <div className="sticky top-16">
                    <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight font-mono">
                      {slot.startTime} – {slot.endTime}
                    </span>

                    {/* Quick row management buttons */}
                    <div className="mt-2 flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditSlot(slot)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-slate-200/60"
                        title="Bearbeiten"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Bearbeiten</span>
                      </button>

                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-rose-50"
                        title="Löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </td>

                {/* Column 2: Thema & Notizen */}
                <td className="py-4 sm:py-5 px-4 sm:px-6 align-top space-y-3.5">
                  {/* Topic Bullet Line (e.g. • Live-Calls or • Fotogram Project gemacht) */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-900 font-bold text-lg">•</span>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                      {slot.title}
                    </h3>
                  </div>

                  {/* Notes / Details */}
                  {slot.content && (
                    <div className="pl-4 text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {slot.content}
                    </div>
                  )}

                  {/* Code snippet if present */}
                  {slot.codeSnippet && (
                    <div className="pl-4">
                      <div className="bg-slate-900 text-slate-100 rounded-md p-3.5 font-mono text-xs sm:text-sm overflow-x-auto shadow-inner">
                        <pre>
                          <code>{slot.codeSnippet}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Embedded Screenshot / Photo preview inside the cell (just like Screenshot 2!) */}
                  {slot.attachments && slot.attachments.length > 0 && (
                    <div className="pl-4 pt-2 space-y-3">
                      {slot.attachments.map(att => (
                        <div
                          key={att.id}
                          className="group/img relative rounded-lg border border-slate-300 overflow-hidden bg-slate-950 shadow-sm max-w-3xl cursor-pointer"
                          onClick={() => onOpenImageViewer(att)}
                        >
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-full h-auto object-contain block transition-transform duration-200 group-hover/img:scale-[1.005]"
                          />
                          
                          {/* Hover overlay hint */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-sm">
                            <ZoomIn className="w-5 h-5" />
                            <span>Vollbild anzeigen</span>
                          </div>

                          <div className="px-3 py-1.5 bg-slate-900/90 text-slate-300 text-xs flex justify-between items-center border-t border-slate-800">
                            <span className="truncate">{att.name}</span>
                            <span className="text-slate-400">{(att.size / 1024).toFixed(0)} KB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick file attach button for this slot */}
                  <div className="pl-4 pt-1">
                    <label className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 cursor-pointer transition-colors p-1 rounded hover:bg-slate-100">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Screenshot / Bild anhängen</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleDirectUploadToSlot(slot.id, e.target.files)}
                      />
                    </label>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty state */}
            {entry.timeSlots.length === 0 && (
              <tr>
                <td colSpan={2} className="py-12 text-center text-slate-500">
                  <p className="text-base mb-3">Keine Zeiteinträge für diesen Tag vorhanden.</p>
                  <button
                    onClick={openAddSlot}
                    className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-900 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ersten Zeitraum hinzufügen</span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Button to Add Next Row */}
      <div className="mt-4 flex justify-between items-center">
        <button
          id="btn-add-slot-bottom"
          onClick={openAddSlot}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-md text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Neuen Zeitraum hinzufügen</span>
        </button>

        <span className="text-xs text-slate-500">
          Tipp: Screenshots können direkt per Klick oder im Bearbeiten-Dialog angehängt werden. 🐈‍⬛🐾
        </span>
      </div>

      {/* MODAL FOR ADDING / EDITING A TIME SLOT */}
      {(isAddingSlot || editingSlot) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">
                {editingSlot ? 'Zeitraum bearbeiten' : 'Neuen Zeitraum hinzufügen'}
              </h3>
              <button
                onClick={closeFormModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSlot} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Startzeit
                  </label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono text-base focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Endzeit
                  </label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono text-base focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Title / Thema */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Thema / Titel
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Fotogram Project gemacht oder Live-Calls"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 text-base focus:ring-2 focus:ring-teal-600 focus:outline-hidden font-medium"
                />
              </div>

              {/* Notes / Notizen */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notizen &amp; Beschreibung
                </label>
                <textarea
                  rows={3}
                  placeholder="Beschreibe kurz die erledigten Aufgaben, Erkenntnisse oder Diskussionspunkte..."
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-800 text-sm leading-relaxed focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                />
              </div>

              {/* Code snippet (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  <span>Code-Ausschnitt (optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Optionaler Code..."
                  value={formCodeSnippet}
                  onChange={e => setFormCodeSnippet(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-mono text-xs bg-slate-50 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                />
              </div>

              {/* Attachments & Screenshots */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Screenshots &amp; Bildanhänge</span>
                </label>

                {/* Upload button area */}
                <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-100">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="modal-file-upload"
                    onChange={e => handleFileUpload(e.target.files)}
                  />
                  <label htmlFor="modal-file-upload" className="cursor-pointer block">
                    <Upload className="w-6 h-6 mx-auto text-slate-500 mb-1" />
                    <span className="text-sm font-medium text-slate-700 block">
                      {isUploading ? 'Wird verarbeitet...' : 'Screenshot hochladen oder hierher ziehen'}
                    </span>
                    <span className="text-xs text-slate-400">PNG, JPG, SVG, WebP</span>
                  </label>
                </div>

                {/* List of currently attached images in form */}
                {formAttachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formAttachments.map(att => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 border border-slate-200 rounded-md bg-white text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={att.dataUrl}
                            alt=""
                            className="w-10 h-8 object-cover rounded border border-slate-200"
                          />
                          <span className="font-medium text-slate-800 truncate max-w-xs">
                            {att.name}
                          </span>
                          <span className="text-slate-400">({(att.size / 1024).toFixed(0)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachmentFromForm(att.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold p-1 cursor-pointer"
                        >
                          Entfernen
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-100 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-md text-sm font-semibold cursor-pointer shadow-xs"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
