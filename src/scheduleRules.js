// 祝日判定用（日本の祝日は外部APIが理想だが、MVPではトグルで対応）

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

const SHOTA = { name: '翔太', emoji: '\u{1F64B}\u200D\u2642\uFE0F' };
const RENA = { name: '玲奈', emoji: '\u{1F64B}\u200D\u2640\uFE0F' };
const EACH = { name: '各自', emoji: '🍽️' };

/**
 * 当日の担当を返す
 * @param {Date} date
 * @param {boolean} isHoliday - 祝日モードON
 * @returns {{ breakfast: object, lunch: object, dinner: object }}
 */
export function getDuty(date, isHoliday = false) {
  const dow = date.getDay(); // 0=日, 6=土
  const isWeekend = dow === 0 || dow === 6;
  const treatAsHoliday = isHoliday || isWeekend;

  // 朝食
  let breakfast;
  if (treatAsHoliday) {
    breakfast = RENA;
  } else {
    breakfast = EACH;
  }

  // 夕食
  let dinner;
  if (treatAsHoliday) {
    dinner = SHOTA;
  } else {
    // 平日: 月火木=玲奈, 水金=翔太
    if (dow === 1 || dow === 2 || dow === 4) {
      dinner = RENA;
    } else {
      dinner = SHOTA;
    }
  }

  // 昼食
  let lunch;
  if (treatAsHoliday) {
    lunch = dow === 0 ? SHOTA : RENA; // 日=翔太自炊, 土=玲奈自炊
    if (isHoliday && !isWeekend) {
      // 平日祝日 → 翔太（祝日モードなので夕食が翔太 → 昼も翔太負担扱い）
      lunch = SHOTA;
    }
  } else {
    // 平日: 前夜の夕食担当が準備。不可時は担当者負担
    // 前夜の夕食担当を算出
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDow = prevDate.getDay();
    const prevIsWeekend = prevDow === 0 || prevDow === 6;
    if (prevIsWeekend) {
      lunch = SHOTA; // 土日夜は翔太 → 月曜昼は翔太準備
    } else if (prevDow === 1 || prevDow === 2 || prevDow === 4) {
      lunch = RENA;
    } else {
      lunch = SHOTA;
    }
  }

  return { breakfast, lunch, dinner };
}

/**
 * 前夜の夕食担当者を返す（昼食アラート用）
 */
export function getPrevNightDuty(date, isHoliday = false) {
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  return getDuty(prevDate, isHoliday).dinner;
}

const PERSON_MAP = { SHOTA, RENA, EACH };

/**
 * getDuty の結果にオーバーライドを適用して返す
 * @param {Date} date
 * @param {boolean} isHoliday
 * @param {Object} overrides - { "2026-04-02": { breakfast: "SHOTA", dinner: "RENA" } }
 */
export function getDutyWithOverrides(date, isHoliday, overrides = {}) {
  const duty = getDuty(date, isHoliday);
  const dateKey = date.toISOString().slice(0, 10);
  const dayOverride = overrides[dateKey] || {};
  return {
    breakfast: dayOverride.breakfast ? PERSON_MAP[dayOverride.breakfast] : duty.breakfast,
    lunch: dayOverride.lunch ? PERSON_MAP[dayOverride.lunch] : duty.lunch,
    dinner: dayOverride.dinner ? PERSON_MAP[dayOverride.dinner] : duty.dinner,
  };
}

/**
 * meal の次の担当（SHOTA→RENA→SHOTA、朝食のみEACHも含む）
 */
export function nextPerson(currentKey, meal) {
  if (meal === 'breakfast') {
    const cycle = ['EACH', 'SHOTA', 'RENA'];
    const idx = cycle.indexOf(currentKey);
    return cycle[(idx + 1) % cycle.length];
  }
  return currentKey === 'SHOTA' ? 'RENA' : 'SHOTA';
}

/**
 * person オブジェクト → キー文字列
 */
export function personToKey(person) {
  if (person === SHOTA) return 'SHOTA';
  if (person === RENA) return 'RENA';
  return 'EACH';
}

export { DAYS, SHOTA, RENA, EACH };
