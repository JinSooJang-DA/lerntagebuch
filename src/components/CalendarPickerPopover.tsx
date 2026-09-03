import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Check, X } from 'lucide-react';
import { isSameDay, isToday, formatDateIso, formatDatumDot } from '../utils/dateUtils';

interface CalendarPickerPopoverProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  entriesDates?: Set<string>; // Set of ISO strings like "2026-09-02" with recorded entries
  onClose: () => void;
}

export const CalendarPickerPopover: React.FC<CalendarPickerPopoverProps> = ({
  selectedDate,
  onSelectDate,
  entriesDates,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Current viewing month and year in calendar
  const [viewYear, setViewYear] = useState(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDate.getMonth()); // 0-indexed

  // When selectedDate changes externally, sync view
  useEffect(() => {
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
  }, [selectedDate]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    onSelectDate(today);
    onClose();
  };

  // Build grid of days for viewYear & viewMonth
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1, 12, 0, 0);
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const days: Date[] = [];

  // Previous month days to fill row
  for (let i = startDayOfWeek; i > 0; i--) {
    days.push(new Date(viewYear, viewMonth, 1 - i, 12, 0, 0));
  }

  // Current month days
  const lastDateOfMonth = new Date(viewYear, viewMonth + 1, 0, 12, 0, 0).getDate();
  for (let d = 1; d <= lastDateOfMonth; d++) {
    days.push(new Date(viewYear, viewMonth, d, 12, 0, 0));
  }

  // Trailing days to fill last week
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(viewYear, viewMonth + 1, i, 12, 0, 0));
  }

  const monthNamesGerman = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const weekdayHeaders = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div
      ref={popoverRef}
      id="calendar-picker-popover"
      className="absolute top-full right-0 sm:right-auto sm:left-0 mt-2 z-50 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Calendar Header: Month/Year navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-teal-700" />
          <span className="font-bold text-slate-900 text-sm">
            {monthNamesGerman[viewMonth]} {viewYear}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Vorheriger Monat"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Nächster Monat"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 py-2">
        {weekdayHeaders.map((day, idx) => (
          <div key={day} className={idx >= 5 ? 'text-amber-700/60' : ''}>
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((d, index) => {
          const isCurrentMonth = d.getMonth() === viewMonth;
          const isSelected = isSameDay(d, selectedDate);
          const isCurrentToday = isToday(d);
          const dIso = formatDateIso(d);
          const hasEntry = entriesDates ? entriesDates.has(dIso) : false;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                onSelectDate(d);
                onClose();
              }}
              className={`relative h-9 flex flex-col items-center justify-center rounded-lg transition-all cursor-pointer font-medium ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : isCurrentMonth
                  ? isWeekend
                    ? 'text-slate-500 hover:bg-amber-50 hover:text-amber-900'
                    : 'text-slate-800 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-50'
              } ${isCurrentToday && !isSelected ? 'ring-1.5 ring-teal-600 font-bold text-teal-800' : ''}`}
            >
              <span>{d.getDate()}</span>

              {/* Indicator dots for entries or today */}
              <div className="flex items-center justify-center gap-0.5 mt-0.5 h-1">
                {hasEntry && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-teal-300' : 'bg-teal-600'
                    }`}
                    title="Eintrag vorhanden"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick native date input & Footer buttons */}
      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          {/* Quick jump to Today */}
          <button
            type="button"
            onClick={handleGoToday}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-md font-medium transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Heute</span>
          </button>

          {/* Native HTML5 Date Picker */}
          <label className="flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer">
            <span className="text-[11px]">Datum:</span>
            <input
              type="date"
              value={formatDateIso(selectedDate)}
              onChange={e => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  onSelectDate(new Date(y, m - 1, d, 12, 0, 0));
                  onClose();
                }
              }}
              className="px-1.5 py-0.5 text-xs border border-slate-300 rounded font-mono text-slate-800 cursor-pointer"
            />
          </label>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block" />
            Eintrag vorhanden
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm border border-teal-600 inline-block" />
            Heute
          </span>
        </div>
      </div>
    </div>
  );
};
