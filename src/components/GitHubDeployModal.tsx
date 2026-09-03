import React, { useState, useRef } from 'react';
import {
  X,
  Github,
  GitBranch,
  Terminal,
  Download,
  Upload,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  FileCode,
  Sparkles,
  Server,
  Workflow
} from 'lucide-react';
import { DayEntry } from '../types';
import { triggerFileDownload } from '../utils/storage';
import { parseDiaryJson } from '../utils/diaryParser';

interface GitHubDeployModalProps {
  entries: Record<string, DayEntry>;
  onClose: () => void;
  onImportEntries: (entries: Record<string, DayEntry>) => void;
  onResetToDemo: () => void;
}

export const GitHubDeployModal: React.FC<GitHubDeployModalProps> = ({
  entries,
  onClose,
  onImportEntries,
  onResetToDemo,
}) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [copiedPr, setCopiedPr] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    triggerFileDownload(jsonStr, 'jinsoo-learning-diary-data.json', 'application/json');
  };

  const handleExportPublicJson = () => {
    const jsonStr = JSON.stringify(entries, null, 2);
    triggerFileDownload(jsonStr, 'diary-data.json', 'application/json');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = parseDiaryJson(text);
        if (result.success && result.detectedDaysCount > 0) {
          onImportEntries(result.entries);
          alert(`${result.detectedDaysCount} Tagebuch-Tage (${result.totalSlotsCount} Einträge) erfolgreich importiert!`);
        } else {
          alert('Keine gültigen Tagebucheinträge im JSON gefunden.');
        }
      } catch (err) {
        alert('Fehler beim Parsen der JSON-Datei.');
      }
    };
    reader.readAsText(file);
  };

  // Generate PR Template text
  const generatePrTemplate = () => {
    const dates = Object.keys(entries).sort().slice(-5);
    let qList: string[] = [];
    dates.forEach((d) => {
      if (entries[d]?.questionsForInstructor?.trim()) {
        qList.push(`- **[${d}]**: ${entries[d].questionsForInstructor.trim()}`);
      }
    });

    return `## 🚀 Weekly Frontend Submission & Learning Diary
**Author:** Jin Soo Jang
**Repository:** Frontend Learning Track

### 📋 Questions & Discussion Points for Instructor:
${qList.length > 0 ? qList.join('\n') : '- No pending blocking questions for this review.'}

### 💻 Code Artifacts & Implemented Modules:
- Fixed Online Class (09:00 - 10:30) takeaways logged in calendar
- Interactive component implementations and tests
- Refactored state handling and generic types

### 🔗 Live Deployed Application:
- [View Live Diary & Calendar](https://<your-github-username>.github.io/<your-repo-name>/)
`;
  };

  const handleCopyPr = () => {
    const prText = generatePrTemplate();
    navigator.clipboard.writeText(prText);
    setCopiedPr(true);
    setTimeout(() => setCopiedPr(false), 2000);
  };

  const gitCommand1 = `git add .\ngit commit -m "docs: update frontend learning diary and lecture notes"\ngit push origin main`;
  const gitCommand2 = `npm run build`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Github className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                GitHub &amp; Deployment Workflow
              </h3>
              <p className="text-xs text-zinc-400">
                Local input &rarr; GitHub Repository &rarr; Instructor Code Review
              </p>
            </div>
          </div>

          <button
            id="btn-close-deploy-hub"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-zinc-800">
          {/* Architecture Concept */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Workflow className="w-4 h-4 text-zinc-700" />
              How Your Review Pipeline Works
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                <div className="font-semibold text-zinc-900 mb-1">1. Local Input</div>
                <p className="text-zinc-600">
                  You log morning online lectures, coding sessions, questions, and code snippets locally in this app.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                <div className="font-semibold text-zinc-900 mb-1">2. Git &amp; GitHub Sync</div>
                <p className="text-zinc-600">
                  You commit your frontend codebase along with markdown summaries or exported data to GitHub.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-zinc-200 shadow-2xs">
                <div className="font-semibold text-zinc-900 mb-1">3. Instructor Review</div>
                <p className="text-zinc-600">
                  Your instructor checks the commits, reads your questions, inspects code files, and reviews the deployed app.
                </p>
              </div>
            </div>
          </div>

          {/* 1. Terminal Commands to Push & Deploy */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                Git CLI Push Commands
              </label>
              <button
                type="button"
                onClick={() => copyText(gitCommand1, 'cmd1')}
                className="text-[11px] text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-mono"
              >
                {copiedCommand === 'cmd1' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Commands</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800">
              <p className="text-zinc-500"># 1. Commit and push your latest code &amp; logs</p>
              <p className="select-all">git add .</p>
              <p className="select-all">git commit -m "docs: update frontend learning diary and lecture notes"</p>
              <p className="select-all">git push origin main</p>
            </div>
          </div>

          {/* 2. Automated GitHub Actions CI/CD Deployment */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-zinc-500" />
              Automated GitHub Pages Deployment
            </h4>
            <div className="p-3.5 rounded-xl border border-zinc-200 bg-white space-y-2 text-xs text-zinc-600">
              <p>
                This project includes a ready-to-use GitHub Actions workflow located at:
                <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[11px] border border-zinc-200">
                  .github/workflows/deploy.yml
                </code>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                <li>Every time you push to <code className="font-mono text-zinc-900">main</code>, GitHub automatically runs <code className="font-mono text-zinc-900">npm run build</code> and deploys to GitHub Pages.</li>
                <li>In your GitHub Repository, navigate to <strong>Settings &rarr; Pages</strong>, set source to <strong>GitHub Actions</strong>.</li>
                <li>Your instructor can bookmark your live deployment URL to inspect your progress anytime!</li>
              </ul>
            </div>
          </div>

          {/* 3. Pull Request / Discussion Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                Instructor Pull Request (PR) Template
              </label>
              <button
                type="button"
                onClick={handleCopyPr}
                className="text-[11px] text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-mono"
              >
                {copiedPr ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied Template</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy PR Template</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              readOnly
              rows={4}
              value={generatePrTemplate()}
              className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-mono text-[11px] text-zinc-700 outline-none select-all"
            />
          </div>

          {/* 4. Local Data Export & Import Hub */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-zinc-600" />
              Backup &amp; Sync Local Diary Data
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Export your diary state as <code className="text-zinc-800 font-mono bg-zinc-200/60 px-1 py-0.5 rounded">public/diary-data.json</code> to commit it to the repository. The deployed GitHub Pages site automatically displays these entries to visitors!
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                id="btn-export-public-json"
                type="button"
                onClick={handleExportPublicJson}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                title="Saves directly as diary-data.json for your public/ folder"
              >
                <Download className="w-3.5 h-3.5 text-white" />
                Export &quot;diary-data.json&quot;
              </button>

              <button
                id="btn-export-json"
                type="button"
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                Export Backup (JSON)
              </button>

              <input
                type="file"
                ref={importInputRef}
                accept=".json"
                onChange={handleImportJson}
                className="hidden"
              />

              <button
                id="btn-import-json"
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-500" />
                Import Data (JSON)
              </button>

              <button
                id="btn-reset-demo"
                type="button"
                onClick={() => {
                  if (confirm('Möchtest du wirklich alle Einträge im Lerntagebuch leeren?')) {
                    onResetToDemo();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 underline ml-auto py-1 cursor-pointer"
              >
                Alle Einträge leeren
              </button>
            </div>
          </div>

          {/* 5. Security & Permission Architecture FAQ */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
              <span className="text-sm">🔒</span>
              Sicherheit &amp; Dozenten-Berechtigung (FAQ)
            </h4>
            <div className="space-y-2 text-xs text-teal-950 leading-relaxed">
              <div className="bg-white/80 p-3 rounded-lg border border-teal-100 shadow-2xs">
                <p className="font-bold text-teal-900 mb-1">
                  Q: 강사(Dozent)가 웹페이지에서 내용을 수정하면 내 원본 일기가 바뀌나요?
                </p>
                <p className="text-teal-800">
                  <strong>절대 바뀌지 않습니다.</strong> GitHub Pages는 정적 웹사이트(Static Web App)입니다. 데이터베이스가 없으므로 방문자나 강사가 브라우저 화면에서 버튼을 누르고 내용을 편집하더라도 그 변경 사항은 오직 <em>방문자 본인 컴퓨터의 임시 브라우저 메모리에만</em> 존재합니다. 새로고침을 누르면 GitHub에 푸시된 원본 데이터로 즉시 되돌아갑니다.
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-teal-100 shadow-2xs">
                <p className="font-bold text-teal-900 mb-1">
                  Q: 가장 이상적이고 안전한 운영 방식(권장 워크플로우)은?
                </p>
                <ol className="list-decimal list-inside space-y-1 text-teal-800 pl-1">
                  <li><strong>로컬에서 편집:</strong> 내 컴퓨터 로컬 환경에서 일기를 작성/수정합니다.</li>
                  <li><strong>JSON 저장:</strong> 위의 <code className="bg-teal-100 px-1 py-0.5 rounded text-teal-900 font-mono">Export diary-data.json</code>을 클릭해 프로젝트의 <code className="bg-teal-100 px-1 py-0.5 rounded text-teal-900 font-mono">public/diary-data.json</code>에 덮어씁니다.</li>
                  <li><strong>깃 푸시:</strong> <code className="bg-teal-100 px-1 py-0.5 rounded text-teal-900 font-mono">git add . &amp;&amp; git commit -m &quot;update diary&quot; &amp;&amp; git push</code> 명령어로 GitHub에 전송합니다.</li>
                  <li><strong>강사 확인:</strong> 강사는 배포된 주소에 접속하면 자동으로 <strong>Dozenten-Ansicht (읽기 전용 보고서)</strong>로 정돈된 일기를 확인하며, 편집 버튼 없이 열람하게 됩니다.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
