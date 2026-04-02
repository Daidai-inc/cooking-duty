import { useState, useEffect } from 'react';
import TodayCard from './components/TodayCard';
import Dashboard from './components/Dashboard';
import LunchStatus from './components/LunchStatus';
import HolidayToggle from './components/HolidayToggle';
import ExceptionRules from './components/ExceptionRules';

const STORAGE_KEY = 'cooking-duty-state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { holidayDates: [], lunchPrepared: {}, overrides: {} };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export default function App() {
  const [holidayDates, setHolidayDates] = useState(() => {
    const saved = loadState();
    return new Set(saved.holidayDates || []);
  });

  const [lunchPreparedMap, setLunchPreparedMap] = useState(() => {
    const saved = loadState();
    return saved.lunchPrepared || {};
  });

  // overrides: { "2026-04-02": { breakfast: "SHOTA"|"RENA"|"EACH", ... } }
  const [overrides, setOverridesMap] = useState(() => {
    const saved = loadState();
    return saved.overrides || {};
  });

  const [weekOffset, setWeekOffset] = useState(0);

  const todayKey = new Date().toISOString().slice(0, 10);
  const lunchPrepared = !!lunchPreparedMap[todayKey];

  useEffect(() => {
    saveState({
      holidayDates: [...holidayDates],
      lunchPrepared: lunchPreparedMap,
      overrides,
    });
  }, [holidayDates, lunchPreparedMap, overrides]);

  const setOverride = (dateKey, meal, personKey) => {
    setOverridesMap((prev) => {
      const day = { ...(prev[dateKey] || {}) };
      if (personKey === null) {
        delete day[meal];
      } else {
        day[meal] = personKey;
      }
      const next = { ...prev };
      if (Object.keys(day).length === 0) {
        delete next[dateKey];
      } else {
        next[dateKey] = day;
      }
      return next;
    });
  };

  const toggleHoliday = (dateKey) => {
    setHolidayDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  const setLunchPrepared = (val) => {
    setLunchPreparedMap((prev) => ({
      ...prev,
      [todayKey]: val,
    }));
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-wood-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-2xl">🍳</span>
          <h1 className="text-base font-bold text-gray-800">料理分担管理</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Today's overview */}
        <TodayCard holidayDates={holidayDates} overrides={overrides} setOverride={setOverride} />

        {/* Holiday toggle */}
        <HolidayToggle holidayDates={holidayDates} toggleHoliday={toggleHoliday} />

        {/* Lunch status */}
        <LunchStatus
          lunchPrepared={lunchPrepared}
          setLunchPrepared={setLunchPrepared}
          holidayDates={holidayDates}
        />

        {/* Weekly calendar */}
        <Dashboard
          holidayDates={holidayDates}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          overrides={overrides}
          setOverride={setOverride}
        />

        {/* Exception rules */}
        <ExceptionRules />
      </main>
    </div>
  );
}
