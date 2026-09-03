import React, { useState, useEffect, useMemo } from 'react';
import {
  DayEntry,
  DiaryAttachment,
  ViewScope,
} from './types';
import {
  getWorkdaysOfWeek,
  formatDateIso,
  parseDateIso,
} from './utils/dateUtils';
import {
  loadAllEntries,
  saveAllEntries,
  getOrCreateEntry,
  generateDayMarkdown,
  generateWeeklyMarkdown,
  triggerFileDownload,
} from './utils/storage';
import { INITIAL_ENTRIES } from './data/initialEntries';
import { Header } from './components/Header';
import { CleanTableDiary } from './components/CleanTableDiary';
import { GitHubDeployModal } from './components/GitHubDeployModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { DocsJsonImportModal } from './components/DocsJsonImportModal';

export default function App() {
  const [entries, setEntries] = useState<Record<string, DayEntry>>(() => loadAllEntries());
  // Default to today's date
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [viewScope, setViewScope] = useState<ViewScope>('single');
  const [previewAttachment, setPreviewAttachment] = useState<DiaryAttachment | null>(null);
  const [showGitHubModal, setShowGitHubModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [copiedDateStr, setCopiedDateStr] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveAllEntries(entries);
  }, [entries]);

  // Only highlight calendar dates that actually contain time slots
  const entriesDates = useMemo(() => {
    const activeDates = new Set<string>();
    Object.keys(entries).forEach((d) => {
      const entry = entries[d];
      if (entry && Array.isArray(entry.timeSlots) && entry.timeSlots.length > 0) {
        activeDates.add(d);
      }
    });
    return activeDates;
  }, [entries]);

  // Workdays for the selected week (Mon - Fri)
  const workdaysOfWeek = getWorkdaysOfWeek(selectedDate);
  const selectedDateIso = formatDateIso(selectedDate);
  const currentDayEntry = getOrCreateEntry(entries, selectedDateIso);

  // Week Navigation
  const handlePrevWeek = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() - 7);
    setSelectedDate(nextDate);
  };

  const handleNextWeek = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 7);
    setSelectedDate(nextDate);
  };

  // Update specific day entry
  const handleUpdateEntry = (updated: DayEntry) => {
    setEntries(prev => ({
      ...prev,
      [updated.date]: updated,
    }));
  };

  // Copy Markdown for a day
  const handleCopyMarkdown = (entry: DayEntry) => {
    const md = generateDayMarkdown(entry);
    navigator.clipboard.writeText(md);
    setCopiedDateStr(entry.date);
    setTimeout(() => setCopiedDateStr(null), 2500);
  };

  // Download Markdown for a day
  const handleDownloadMarkdown = (entry: DayEntry) => {
    const md = generateDayMarkdown(entry);
    triggerFileDownload(md, `lerntagebuch-${entry.date}.md`, 'text/markdown');
  };

  // Clear all entries completely
  const handleResetToDemo = () => {
    setEntries({});
    saveAllEntries({});
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-800 selection:text-white">
      {/* Top Header with minimal controls */}
      <Header
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
        weekDates={workdaysOfWeek}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        viewScope={viewScope}
        onToggleViewScope={(scope) => setViewScope(scope)}
        onOpenGitHubModal={() => setShowGitHubModal(true)}
        entriesDates={entriesDates}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16 pt-4">
        {viewScope === 'single' ? (
          /* Single Day Table matching Screenshot 2 */
          <CleanTableDiary
            entry={currentDayEntry}
            onUpdateEntry={handleUpdateEntry}
            onOpenImageViewer={(att) => setPreviewAttachment(att)}
            onCopyMarkdown={() => handleCopyMarkdown(currentDayEntry)}
            isCopied={copiedDateStr === currentDayEntry.date}
            onDownloadMarkdown={() => handleDownloadMarkdown(currentDayEntry)}
            onOpenImportModal={() => setShowImportModal(true)}
          />
        ) : (
          /* Weekly Overview: All 5 Workdays rendered as clean tables */
          <div className="space-y-12">
            {workdaysOfWeek.map((d) => {
              const dIso = formatDateIso(d);
              const dayEntry = getOrCreateEntry(entries, dIso);
              return (
                <div key={dIso} className="pt-4">
                  <CleanTableDiary
                    entry={dayEntry}
                    onUpdateEntry={handleUpdateEntry}
                    onOpenImageViewer={(att) => setPreviewAttachment(att)}
                    onCopyMarkdown={() => handleCopyMarkdown(dayEntry)}
                    isCopied={copiedDateStr === dayEntry.date}
                    onDownloadMarkdown={() => handleDownloadMarkdown(dayEntry)}
                    onOpenImportModal={() => setShowImportModal(true)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Clean, Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Jin Soo Jang&apos;s Lerntagebuch</span>
            <span>•</span>
            <span>Frontend Entwickler</span>
            <span>•</span>
            <span className="text-teal-700 font-semibold">Citycat Records 🐈‍⬛🐾</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGitHubModal(true)}
              className="hover:text-slate-800 underline transition-colors cursor-pointer"
            >
              GitHub Sync &amp; Review Anleitung
            </button>
            <span>•</span>
            <span>Automatische lokale Speicherung</span>
          </div>
        </div>
      </footer>

      {/* Full-Screen Image Viewer Modal */}
      {previewAttachment && (
        <ImageViewerModal
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}

      {/* GitHub Flow & Review Modal */}
      {showGitHubModal && (
        <GitHubDeployModal
          entries={entries}
          onClose={() => setShowGitHubModal(false)}
          onImportEntries={(newEntries) => {
            setEntries(newEntries);
            saveAllEntries(newEntries);
          }}
          onResetToDemo={handleResetToDemo}
        />
      )}

      {/* Google Docs & JSON Parser Modal */}
      {showImportModal && (
        <DocsJsonImportModal
          currentEntries={entries}
          onClose={() => setShowImportModal(false)}
          onApplyImport={(newEntries, mode) => {
            setEntries(newEntries);
            saveAllEntries(newEntries);
          }}
        />
      )}
    </div>
  );
}
