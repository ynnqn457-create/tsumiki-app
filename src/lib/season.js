export const SEASONS = ["spring", "summer", "autumn", "winter"];

export const SEASON_LABEL = {
  spring: "春・ミモザ",
  summer: "夏・大樹",
  autumn: "秋・紅葉",
  winter: "冬・裸木",
};

export function currentSeasonByDate(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}
