export const HOUSE_SIZE = 26;

export const CATEGORIES = {
  work: { key: "work", label: "見えない勝ち", emoji: "🥷", color: "#3D5C42" },
  learn: { key: "learn", label: "学び", emoji: "📖", color: "#8A9A7B" },
  make: { key: "make", label: "アプリ・制作", emoji: "🔨", color: "#C2674E" },
  trip: { key: "trip", label: "旅・経験", emoji: "🧳", color: "#E3B458" },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export function categoryColor(key) {
  return CATEGORIES[key]?.color ?? "#D9CBAE";
}

export function dominantCategory(counts) {
  let best = null;
  let bestCount = -1;
  for (const cat of CATEGORY_LIST) {
    const c = counts?.[cat.key] ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = cat.key;
    }
  }
  return best ?? "work";
}
