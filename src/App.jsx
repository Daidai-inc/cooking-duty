import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from './firebase';
import TodayCard from './components/TodayCard';
import Dashboard from './components/Dashboard';
import LunchStatus from './components/LunchStatus';
import HolidayToggle from './components/HolidayToggle';
import ExceptionRules from './components/ExceptionRules';

const DB_PATH = 'cooking-duty/state';
const DEFAULT_STATE = { holidayDates: [], lunchPrepared: {}, overrides: {} };

export default function App() {
  const [holidayDates, setHolidayDates] = useState(new Set());
  const [lunchPreparedMap, setLunchPreparedMap] = useState({});
  const [overrides, setOverridesMap] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [synced, setSynced] = useState(false);

  // リモートからの更新を無視する一時フラグ（自分の書き込みに反応しないため）
  const skipRemote = useRef(false);

  // Firebase → ローカル state に同期（リアルタイム）
  useEffect(() => {
    const dbRef = ref(db, DB_PATH);
    const unsub = onValue(dbRef, (snapshot) => {
      if (skipRemote.current) return;
      const data = snapshot.val() || DEFAULT_STATE;
      setHolidayDates(new Set(data.holidayDates || []));
      setLunchPreparedMap(data.lunchPrepared || {});
      setOverridesMap(data.overrides || {});
      setSynced(true);
    });
    return () => unsub();
  }, []);

  // ローカル state → Firebase に書き込む
  const saveToFirebase = (next) => {
    skipRemote.current = true;
    set(ref(db, DB_PATH), next).finally(() => {
      setTimeout(() => { skipRemote.current = false; }, 500);
    });
  };

  const todayKey = new Date().toISOString().slice(0, 10);
  const lunchPrepared = !!lunchPreparedMap[todayKey];

  const toggleHoliday = (dateKey) => {
    setHolidayDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      saveToFirebase({ holidayDates: [...next], lunchPrepared: lunchPreparedMap, overrides });
      return next;
    });
  };

  const setLunchPrepared = (val) => {
    setLunchPreparedMap((prev) => {
      const next = { ...prev, [todayKey]: val };
      saveToFirebase({ holidayDates: [...holidayDates], lunchPrepared: next, overrides });
      return next;
    });
  };

  const setOverride = (dateKey, meal, personKey) => {
    setOverridesMap((prev) => {
      const day = { ...(prev[dateKey] || {}) };
      if (personKey === null) delete day[meal];
      else day[meal] = personKey;
      const next = { ...prev };
      if (Object.keys(day).length === 0) delete next[dateKey];
      else next[dateKey] = day;
      saveToFirebase({ holidayDates: [...holidayDates], lunchPrepared: lunchPreparedMap, overrides: next });
      return next;
    });
  };

  return (
    <div className="min-h-screen pb-8">
      <header className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-wood-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-2xl">🍳</span>
          <h1 className="text-base font-bold text-gray-800">料理分担管理</h1>
          {synced && (
            <span className="ml-auto text-[10px] text-green-500">● 同期中</span>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        <TodayCard holidayDates={holidayDates} overrides={overrides} setOverride={setOverride} />
        <HolidayToggle holidayDates={holidayDates} toggleHoliday={toggleHoliday} />
        <LunchStatus
          lunchPrepared={lunchPrepared}
          setLunchPrepared={setLunchPrepared}
          holidayDates={holidayDates}
        />
        <Dashboard
          holidayDates={holidayDates}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          overrides={overrides}
          setOverride={setOverride}
        />
        <ExceptionRules />
      </main>
    </div>
  );
}
