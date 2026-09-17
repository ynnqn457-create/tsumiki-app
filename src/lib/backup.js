import { supabase } from "./supabaseClient";

/** 現在のデータを、書き出し用のJSONの形に変換する（家はidの代わりに配列の順番で参照する） */
export function buildExport({ bricks, houses, monuments }) {
  const houseIndexById = new Map(houses.map((h, i) => [h.id, i]));
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    houses: houses.map((h) => ({
      name: h.name,
      color: h.color,
      counts: h.counts,
      completed_at: h.completed_at,
    })),
    bricks: bricks.map((b) => ({
      text: b.text,
      cat: b.cat,
      fired: b.fired,
      created_at: b.created_at,
      fired_at: b.fired_at ?? null,
      house_index: b.house_id != null ? houseIndexById.get(b.house_id) ?? null : null,
    })),
    monuments: monuments.map((m) => ({
      text: m.text,
      created_at: m.created_at,
    })),
  };
}

export function downloadJSON(data, filename = "tsumiki-backup.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}

function parseLegacyDate(str) {
  if (!str) return new Date().toISOString();
  const [y, m, d] = str.split("/").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0).toISOString();
}

/** 旧形式（メモに残っていたもの）を、日付順に26個ずつ家へ割り当てて新形式に変換する */
function convertLegacy(json) {
  const HOUSE_SIZE = 26;
  const legacyBricks = [...(json.bricks ?? [])].sort(
    (a, b) => new Date(parseLegacyDate(a.date)) - new Date(parseLegacyDate(b.date)),
  );
  const legacyHouses = json.houses ?? [];

  const bricks = legacyBricks.map((b) => ({
    text: b.text,
    cat: b.cat ?? null,
    fired: Boolean(b.fired),
    created_at: parseLegacyDate(b.date),
    fired_at: b.fired ? parseLegacyDate(b.date) : null,
    house_index: null,
  }));

  legacyHouses.forEach((h, i) => {
    const start = i * HOUSE_SIZE;
    for (let j = start; j < start + HOUSE_SIZE && j < bricks.length; j++) {
      bricks[j].house_index = i;
    }
  });

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    houses: legacyHouses.map((h) => ({
      name: h.name,
      color: h.color,
      counts: h.counts,
      completed_at: parseLegacyDate(h.date),
    })),
    bricks,
    monuments: (json.monuments ?? []).map((m) => ({
      text: m.text,
      created_at: parseLegacyDate(m.date),
    })),
  };
}

export function parseBackupText(text) {
  const json = JSON.parse(text);
  if (json.version === 2) return json;
  return convertLegacy(json);
}

/** 変換済みのデータをSupabaseへ書き込む（オンライン時のみ。復元は取り消せないので呼ぶ前に確認をとること） */
export async function restoreToSupabase(data) {
  let houseIds = [];
  if (data.houses.length > 0) {
    const { data: inserted, error } = await supabase.from("houses").insert(data.houses).select();
    if (error) throw error;
    houseIds = inserted.map((h) => h.id);
  }

  if (data.bricks.length > 0) {
    const rows = data.bricks.map((b) => ({
      text: b.text,
      cat: b.cat,
      fired: b.fired,
      created_at: b.created_at,
      fired_at: b.fired_at,
      house_id: b.house_index != null ? houseIds[b.house_index] ?? null : null,
    }));
    const { error } = await supabase.from("bricks").insert(rows);
    if (error) throw error;
  }

  if (data.monuments.length > 0) {
    const rows = data.monuments.map((m) => ({ text: m.text, created_at: m.created_at }));
    const { error } = await supabase.from("monuments").insert(rows);
    if (error) throw error;
  }

  return {
    houses: data.houses.length,
    bricks: data.bricks.length,
    monuments: data.monuments.length,
  };
}
