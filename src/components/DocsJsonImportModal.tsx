import React, { useState } from 'react';
import { DayEntry } from '../types';
import { parseGoogleDocsText, parseDiaryJson, ParseResult } from '../utils/diaryParser';
import { formatDatumDot, parseDateIso, getWeekdayGermanFull } from '../utils/dateUtils';
import {
  FileText,
  FileCode,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';

interface DocsJsonImportModalProps {
  currentEntries: Record<string, DayEntry>;
  onClose: () => void;
  onApplyImport: (newEntries: Record<string, DayEntry>, mode: 'merge' | 'replace') => void;
}

const SAMPLE_GOOGLE_DOCS_TEXT = `Lerntagebuch
Datum: [02.09.2026]
Zeitraum\tThema & Notizen
09:00 - 10:20\t• Live-Calls: Daily Standup & TypeScript Feedback
10:20 - 12:00\t• Fotogram Project gemacht: Responsive Grid & Image Cards
13:30 - 16:00\t• State Management: Custom Hooks & LocalStorage Sync
22:00 - 00:30\t• Fotogram Projekt CSS Design & Band Fotoalbum

Datum: [03.09.2026]
Zeitraum\tThema & Notizen
09:00 - 10:30\t• Live-Calls: Code Review & GitHub Pages Deployment
10:30 - 12:30\t• GitHub Actions CI/CD Pipeline eingerichtet
14:00 - 17:00\t• Deployment-Test & Markdown Vorlage für Review`;

const SAMPLE_JSON_TEXT = JSON.stringify(
  [
    {
      date: '2026-09-04',
      timeSlots: [
        {
          id: 'slot-sample-1',
          startTime: '09:00',
          endTime: '10:30',
          title: 'Live-Calls: Weekly Retro',
          content: 'Team-Review und Vorbereitung auf die nächste Woche'
        },
        {
          id: 'slot-sample-2',
          startTime: '11:00',
          endTime: '13:00',
          title: 'Frontend Portfolio Optimization',
          content: 'Lighthouse Performance-Optimierung und Bildkompression'
        }
      ]
    }
  ],
  null,
  2
);

export const DocsJsonImportModal: React.FC<DocsJsonImportModalProps> = ({
  currentEntries,
  onClose,
  onApplyImport
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'json'>('docs');
  const [docsInputText, setDocsInputText] = useState('');
  const [jsonInputText, setJsonInputText] = useState('');
  const [fallbackDate, setFallbackDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // File upload reader for JSON or TXT
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.json')) {
        setActiveTab('json');
        setJsonInputText(content);
        runJsonParse(content);
      } else {
        setActiveTab('docs');
        setDocsInputText(content);
        runDocsParse(content);
      }
    };
    reader.readAsText(file);
  };

  const runDocsParse = (textToParse?: string) => {
    const text = textToParse !== undefined ? textToParse : docsInputText;
    setParseError(null);

    if (!text.trim()) {
      setParseResult(null);
      return;
    }

    try {
      const result = parseGoogleDocsText(text, fallbackDate);
      if (result.detectedDaysCount === 0) {
        setParseError(
          'Kein Datums- oder Zeitformat erkannt. Bitte stelle sicher, dass Zeiten (z.B. "09:00 - 10:20") oder Datumsangaben ("Datum: [02.09.2026]") enthalten sind.'
        );
        setParseResult(null);
      } else {
        setParseResult(result);
      }
    } catch (err: any) {
      setParseError(`Fehler beim Parsen: ${err.message}`);
      setParseResult(null);
    }
  };

  const runJsonParse = (textToParse?: string) => {
    const text = textToParse !== undefined ? textToParse : jsonInputText;
    setParseError(null);

    if (!text.trim()) {
      setParseResult(null);
      return;
    }

    try {
      const result = parseDiaryJson(text);
      if (result.detectedDaysCount === 0) {
        setParseError('Keine gültigen Tagebucheinträge oder Zeiträume gefunden. Bitte JSON-Format prüfen.');
        setParseResult(null);
      } else {
        setParseResult(result);
      }
    } catch (err: any) {
      setParseError(`JSON Parsing-Fehler: ${err.message}`);
      setParseResult(null);
    }
  };

  const handleApply = () => {
    if (!parseResult || parseResult.detectedDaysCount === 0) return;

    let finalEntries: Record<string, DayEntry>;
    if (importMode === 'replace') {
      finalEntries = { ...parseResult.entries };
    } else {
      // Merge
      finalEntries = { ...currentEntries };
      Object.keys(parseResult.entries).forEach(date => {
        const imported = parseResult.entries[date];
        if (finalEntries[date]) {
          // Merge time slots without duplicates by title and time
          const existingSlots = finalEntries[date].timeSlots || [];
          const newSlots = [...existingSlots];

          imported.timeSlots.forEach(importedSlot => {
            const isDup = newSlots.some(
              s =>
                s.startTime === importedSlot.startTime &&
                s.endTime === importedSlot.endTime &&
                s.title.toLowerCase() === importedSlot.title.toLowerCase()
            );
            if (!isDup) {
              newSlots.push(importedSlot);
            }
          });

          newSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

          finalEntries[date] = {
            ...finalEntries[date],
            timeSlots: newSlots,
            updatedAt: new Date().toISOString()
          };
        } else {
          finalEntries[date] = imported;
        }
      });
    }

    onApplyImport(finalEntries, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <span>Tagebuch importieren (Google Docs / JSON)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kopierte Tabellen aus Google Docs oder JSON-Dateien einfügen und automatisch im Lerntagebuch erfassen.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-xl font-bold cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('docs');
                setParseResult(null);
                setParseError(null);
              }}
              className={`pb-2.5 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'docs'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Google Docs / Text</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('json');
                setParseResult(null);
                setParseError(null);
              }}
              className={`pb-2.5 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
                activeTab === 'json'
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>JSON-Datei / Code</span>
            </button>
          </div>

          {/* Direct File Upload button */}
          <label className="mb-2 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Datei hochladen (.json / .txt)</span>
            <input
              type="file"
              accept=".json,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          {/* TAB 1: GOOGLE DOCS TEXT */}
          {activeTab === 'docs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Inhalt aus Google Docs einfügen
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setDocsInputText(SAMPLE_GOOGLE_DOCS_TEXT);
                    runDocsParse(SAMPLE_GOOGLE_DOCS_TEXT);
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 font-medium underline cursor-pointer"
                >
                  Beispiel-Tabelle laden
                </button>
              </div>

              <textarea
                rows={8}
                value={docsInputText}
                onChange={e => {
                  setDocsInputText(e.target.value);
                  runDocsParse(e.target.value);
                }}
                placeholder="Kopiere die Tabelle oder Notizen aus Google Docs (Strg+A -> Strg+C) und füge sie hier ein (Strg+V)!&#10;&#10;Beispiel:&#10;Datum: [02.09.2026]&#10;09:00 - 10:20   • Live-Calls&#10;10:20 - 12:00   • Fotogram Project gemacht"
                className="w-full p-3 font-mono text-xs text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-hidden leading-relaxed bg-slate-50/50"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span>Standard-Datum falls im Text nicht angegeben:</span>
                  <input
                    type="date"
                    value={fallbackDate}
                    onChange={e => {
                      setFallbackDate(e.target.value);
                      if (docsInputText) runDocsParse();
                    }}
                    className="border border-slate-300 rounded px-2 py-0.5 text-xs font-mono text-slate-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => runDocsParse()}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Erneut analysieren</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: JSON INPUT */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  JSON-Daten einfügen
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setJsonInputText(SAMPLE_JSON_TEXT);
                    runJsonParse(SAMPLE_JSON_TEXT);
                  }}
                  className="text-xs text-teal-700 hover:text-teal-900 font-medium underline cursor-pointer"
                >
                  Beispiel-JSON laden
                </button>
              </div>

              <textarea
                rows={8}
                value={jsonInputText}
                onChange={e => {
                  setJsonInputText(e.target.value);
                  runJsonParse(e.target.value);
                }}
                placeholder='[ { "date": "2026-09-02", "timeSlots": [ { "startTime": "09:00", "endTime": "10:20", "title": "Live-Calls" } ] } ]'
                className="w-full p-3 font-mono text-xs text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-hidden leading-relaxed bg-slate-50/50"
              />

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => runJsonParse()}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-medium cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>JSON validieren &amp; parsen</span>
                </button>
              </div>
            </div>
          )}

          {/* ERROR ALERT */}
          {parseError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}

          {/* PARSED PREVIEW SECTION */}
          {parseResult && parseResult.detectedDaysCount > 0 && (
            <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-teal-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-xs font-bold">
                    ✓
                  </span>
                  <span className="font-bold text-teal-900 text-sm">
                    {parseResult.detectedDaysCount} {parseResult.detectedDaysCount === 1 ? 'Tag' : 'Tage'} erkannt ({parseResult.totalSlotsCount} Zeiteinträge)
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono">
                  {parseResult.rawFormatDetected === 'google_docs_table'
                    ? 'Google Docs Tabelle'
                    : parseResult.rawFormatDetected === 'json'
                    ? 'JSON-Format'
                    : 'Text / Zeitleiste'}
                </span>
              </div>

              {/* Day Breakdown Preview */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {Object.keys(parseResult.entries).map(dateStr => {
                  const entry = parseResult.entries[dateStr];
                  const dObj = parseDateIso(dateStr);
                  const formatted = formatDatumDot(dObj);
                  const weekday = getWeekdayGermanFull(dObj);

                  return (
                    <div
                      key={dateStr}
                      className="p-2.5 rounded-lg bg-white border border-teal-100 shadow-2xs text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {weekday}, {formatted} ({dateStr})
                        </span>
                        <span className="text-teal-700 font-semibold">
                          {entry.timeSlots.length} {entry.timeSlots.length === 1 ? 'Eintrag' : 'Einträge'}
                        </span>
                      </div>

                      <div className="space-y-1 pl-1">
                        {entry.timeSlots.map((slot, sIdx) => (
                          <div key={sIdx} className="flex items-baseline gap-2 text-slate-600">
                            <span className="font-mono font-medium text-slate-900 shrink-0">
                              {slot.startTime}–{slot.endTime}
                            </span>
                            <span className="font-semibold text-slate-800 truncate">
                              • {slot.title}
                            </span>
                            {slot.content && (
                              <span className="text-slate-400 truncate max-w-xs">
                                - {slot.content}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Import Options (Merge vs Replace) */}
              <div className="pt-2 border-t border-teal-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-medium text-slate-800">Mit bestehenden Einträgen zusammenführen (Empfohlen)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-medium text-slate-800">Alle Einträge überschreiben</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-100 cursor-pointer"
          >
            Abbrechen
          </button>

          <button
            id="btn-apply-import-modal"
            type="button"
            disabled={!parseResult || parseResult.detectedDaysCount === 0}
            onClick={handleApply}
            className={`px-5 py-2 rounded-md text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-all ${
              parseResult && parseResult.detectedDaysCount > 0
                ? 'bg-teal-700 hover:bg-teal-800 text-white'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {parseResult && parseResult.detectedDaysCount > 0
                ? `${parseResult.detectedDaysCount} ${parseResult.detectedDaysCount === 1 ? 'Tag' : 'Tage'} ins Lerntagebuch übernehmen`
                : 'Zuerst Inhalt parsen'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
