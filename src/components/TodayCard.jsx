import { Utensils } from 'lucide-react';
import { getDutyWithOverrides, DAYS, personToKey, nextPerson } from '../scheduleRules';

export default function TodayCard({ holidayDates, overrides, setOverride }) {
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);
  const isHoliday = holidayDates.has(dateKey);
  const duty = getDutyWithOverrides(today, isHoliday, overrides);
  const dayOverride = overrides[dateKey] || {};

  const formatted = `${today.getMonth() + 1}/${today.getDate()}（${DAYS[today.getDay()]}）`;

  const handleTap = (meal) => {
    const cur = dayOverride[meal] || personToKey(duty[meal]);
    setOverride(dateKey, meal, nextPerson(cur, meal));
  };

  return (
    <div className="bg-gradient-to-br from-leaf-400 to-leaf-500 rounded-2xl shadow-md p-5 text-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-leaf-100 text-xs">TODAY</p>
          <p className="text-xl font-bold">{formatted}</p>
        </div>
        <Utensils size={28} className="text-leaf-100" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MealBlock label="朝食" person={duty.breakfast} isOverridden={!!dayOverride.breakfast} onTap={() => handleTap('breakfast')} />
        <MealBlock label="昼食" person={duty.lunch} isOverridden={!!dayOverride.lunch} onTap={() => handleTap('lunch')} />
        <MealBlock label="夕食" person={duty.dinner} isOverridden={!!dayOverride.dinner} onTap={() => handleTap('dinner')} />
      </div>
    </div>
  );
}

function MealBlock({ label, person, isOverridden, onTap }) {
  return (
    <button
      onClick={onTap}
      className={`backdrop-blur rounded-xl p-3 text-center w-full active:opacity-60 transition ${
        isOverridden ? 'bg-amber-300/40 ring-2 ring-amber-200' : 'bg-white/20'
      }`}
    >
      <p className="text-[10px] text-leaf-100 uppercase tracking-wider">{label}</p>
      <p className="text-3xl mt-1">{person.emoji}</p>
      <p className="text-xs mt-1 font-medium">{person.name}</p>
    </button>
  );
}
