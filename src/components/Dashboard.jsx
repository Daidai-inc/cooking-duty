import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDutyWithOverrides, DAYS, personToKey, nextPerson } from '../scheduleRules';

function getWeekDates(baseDate) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    dates.push(dt);
  }
  return dates;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function Dashboard({ holidayDates, weekOffset, setWeekOffset, overrides, setOverride }) {
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(baseDate);

  const monthLabel = (() => {
    const months = new Set(weekDates.map(d => `${d.getFullYear()}/${d.getMonth() + 1}`));
    return [...months].join(' - ');
  })();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-wood-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-leaf-50 border-b border-leaf-100">
        <button
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="p-2 rounded-full hover:bg-leaf-100 active:bg-leaf-200 transition"
        >
          <ChevronLeft size={20} className="text-leaf-600" />
        </button>
        <span className="text-sm font-medium text-leaf-600">{monthLabel}</span>
        <button
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="p-2 rounded-full hover:bg-leaf-100 active:bg-leaf-200 transition"
        >
          <ChevronRight size={20} className="text-leaf-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 divide-x divide-wood-100">
        {weekDates.map((date) => {
          const isToday = isSameDay(date, today);
          const dow = date.getDay();
          const isWeekend = dow === 0 || dow === 6;
          const dateKey = date.toISOString().slice(0, 10);
          const isHoliday = holidayDates.has(dateKey);
          const duty = getDutyWithOverrides(date, isHoliday, overrides);
          const dayOverride = overrides[dateKey] || {};

          return (
            <div
              key={dateKey}
              className={`flex flex-col items-center py-3 px-1 min-h-[140px] transition ${
                isToday
                  ? 'bg-leaf-50 ring-2 ring-inset ring-leaf-400'
                  : isWeekend
                    ? 'bg-wood-50'
                    : ''
              }`}
            >
              {/* Day label */}
              <span className={`text-xs font-medium ${
                dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {DAYS[dow]}
              </span>

              {/* Date number */}
              <span className={`text-lg font-bold leading-tight ${
                isToday ? 'text-leaf-500' : 'text-gray-700'
              }`}>
                {date.getDate()}
              </span>

              {isHoliday && (
                <span className="text-[10px] bg-red-100 text-red-500 rounded px-1 mt-0.5">祝</span>
              )}

              {/* Meals */}
              <div className="mt-2 space-y-1 text-center w-full">
                <MealRow label="朝" person={duty.breakfast} isOverridden={!!dayOverride.breakfast} onTap={() => {
                  const cur = dayOverride.breakfast || personToKey(duty.breakfast);
                  setOverride(dateKey, 'breakfast', nextPerson(cur, 'breakfast'));
                }} />
                <MealRow label="昼" person={duty.lunch} isOverridden={!!dayOverride.lunch} onTap={() => {
                  const cur = dayOverride.lunch || personToKey(duty.lunch);
                  setOverride(dateKey, 'lunch', nextPerson(cur, 'lunch'));
                }} />
                <MealRow label="夜" person={duty.dinner} isOverridden={!!dayOverride.dinner} onTap={() => {
                  const cur = dayOverride.dinner || personToKey(duty.dinner);
                  setOverride(dateKey, 'dinner', nextPerson(cur, 'dinner'));
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MealRow({ label, person, isOverridden, onTap }) {
  return (
    <button
      onClick={onTap}
      className={`w-full flex items-center justify-center gap-0.5 rounded active:opacity-60 transition ${
        isOverridden ? 'bg-amber-50 ring-1 ring-amber-300 rounded' : ''
      }`}
    >
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className="text-base leading-none">{person.emoji}</span>
    </button>
  );
}
