import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Github, FileText, Calendar as CalendarIcon, Upload, Clock } from 'lucide-react';
import { formatDatumDot, getWeekdayGerman, isSameDay, isToday } from '../utils/dateUtils';
import { ViewScope } from '../types';
import { CalendarPickerPopover } from './CalendarPickerPopover';

interface HeaderProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  weekDates: Date[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  viewScope: ViewScope;
  onToggleViewScope: (scope: ViewScope) => void;
  onOpenGitHubModal: () => void;
  entriesDates?: Set<string>;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onSelectDate,
  weekDates,
  onPrevWeek,
  onNextWeek,
  viewScope,
  onToggleViewScope,
  onOpenGitHubModal,
  entriesDates
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleGoToday = () => {
    const today = new Date();
    onSelectDate(today);
    if (viewScope !== 'single') onToggleViewScope('single');
  };

  const handleDatePicked = (d: Date) => {
    onSelectDate(d);
    if (viewScope !== 'single') onToggleViewScope('single');
    setIsCalendarOpen(false);
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-20 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Brand & Student Name */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Jin Soo Jang</span>
              <span className="text-slate-400 font-normal">/</span>
              <span className="text-teal-700 font-semibold">Lerntagebuch</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Frontend Development • Montag – Freitag
            </p>
          </div>
        </div>

        {/* Center: Weekday Selector (Mo - Fr) + Today & Calendar Picker */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Quick "Today" (Heute) Button */}
          <button
            id="btn-header-today"
            type="button"
            onClick={handleGoToday}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isToday(selectedDate) && viewScope === 'single'
                ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Zu heute springen"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Heute</span>
          </button>

          {/* Week Navigation Group */}
          <div className="flex items-center gap-1">
            {/* Prev week button */}
            <button
              onClick={onPrevWeek}
              title="Vorherige Woche"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Day pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 gap-1">
              {weekDates.map(d => {
                const active = isSameDay(d, selectedDate) && viewScope === 'single';
                const dayName = getWeekdayGerman(d);
                const dayMonth = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;

                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => {
                      onSelectDate(d);
                      if (viewScope !== 'single') onToggleViewScope('single');
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-slate-800 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-white/80 hover:text-slate-900'
                    }`}
                  >
                    <span className="font-semibold">{dayName}</span> {dayMonth}
                  </button>
                );
              })}
            </div>

            {/* Next week button */}
            <button
              onClick={onNextWeek}
              title="Nächste Woche"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar format Date Picker dropdown */}
          <div className="relative">
            <button
              id="btn-header-calendar-toggle"
              type="button"
              onClick={() => setIsCalendarOpen(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isCalendarOpen
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
              title="Datum im Kalender wählen"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Kalender</span>
            </button>

            {/* Popover */}
            {isCalendarOpen && (
              <CalendarPickerPopover
                selectedDate={selectedDate}
                onSelectDate={handleDatePicked}
                entriesDates={entriesDates}
                onClose={() => setIsCalendarOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Right: Scope Switcher & GitHub Button */}
        <div className="flex items-center gap-2">
          {/* Single Day vs Whole Week Table */}
          <div className="flex items-center border border-slate-200 rounded-md bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => onToggleViewScope('single')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewScope === 'single'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tag
            </button>
            <button
              onClick={() => onToggleViewScope('weekly')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewScope === 'weekly'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Woche
            </button>
          </div>

          {/* GitHub Review Hub */}
          <button
            id="btn-github-hub"
            onClick={onOpenGitHubModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            title="GitHub Flow &amp; Review Befehle"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GitHub Flow</span>
          </button>
        </div>
      </div>
    </header>
  );
};
