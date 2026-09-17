import { supabase } from "./supabaseClient";
import { HOUSE_SIZE, CATEGORY_LIST, dominantCategory } from "./categories";

const CACHE_KEY = "tsumiki_cache_v1";
const PENDING_KEY = "tsumiki_pending_v1";

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(state) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ...state, cachedAt: Date.now() }),
    );
  } catch {
    // localStorage が使えない環境でも、アプリ自体は動かし続ける
  }
}

function readPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writePending(list) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function queuePending(entry) {
  const list = readPending();
  list.push({ ...entry, queuedAt: Date.now() });
  writePending(list);
}

/** サーバーから最新の状態を読み込む。オフラインならキャッシュを返す。 */
export async function fetchState() {
  try {
    const [bricksRes, housesRes, monumentsRes] = await Promise.all([
      supabase.from("bricks").select("*").order("created_at", { ascending: true }),
      supabase.from("houses").select("*").order("completed_at", { ascending: true }),
      supabase.from("monuments").select("*").order("created_at", { ascending: true }),
    ]);
    if (bricksRes.error) throw bricksRes.error;
    if (housesRes.error) throw housesRes.error;
    if (monumentsRes.error) throw monumentsRes.error;

    const state = {
      bricks: bricksRes.data ?? [],
      houses: housesRes.data ?? [],
      monuments: monumentsRes.data ?? [],
    };
    writeCache(state);
    await flushPending();
    return { ...state, offline: false };
  } catch {
    const cached = readCache();
    if (cached) {
      return {
        bricks: cached.bricks ?? [],
        houses: cached.houses ?? [],
        monuments: cached.monuments ?? [],
        offline: true,
      };
    }
    throw err;
  }
}

/** 手前の更地に積まれている、まだ家に組み込まれていない煉瓦（作成順） */
export function currentSlotBricks(bricks) {
  return bricks
    .filter((b) => !b.house_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

/** 命名待ちの完成済みの家（あれば上棟式を出す） */
export function findUnnamedHouse(houses) {
  return houses.find((h) => !h.name) ?? null;
}

async function tryCompleteHouse() {
  const { data: bricks } = await supabase
    .from("bricks")
    .select("*")
    .is("house_id", null)
    .order("created_at", { ascending: true });

  const slot = (bricks ?? []).slice(0, HOUSE_SIZE);
  if (slot.length < HOUSE_SIZE || slot.some((b) => !b.fired)) return null;

  const counts = { work: 0, learn: 0, make: 0, trip: 0 };
  for (const b of slot) counts[b.cat] = (counts[b.cat] ?? 0) + 1;
  const dominant = dominantCategory(counts);
  const color = CATEGORY_LIST.find((c) => c.key === dominant)?.color ?? "#3D5C42";

  const { data: house, error: houseErr } = await supabase
    .from("houses")
    .insert({ name: null, color, counts, completed_at: new Date().toISOString() })
    .select()
    .single();
  if (houseErr) throw houseErr;

  const ids = slot.map((b) => b.id);
  const { error: updateErr } = await supabase
    .from("bricks")
    .update({ house_id: house.id })
    .in("id", ids);
  if (updateErr) throw updateErr;

  return house;
}

export async function addBrick({ text, isMonument }) {
  if (isMonument) {
    try {
      const { data, error } = await supabase
        .from("monuments")
        .insert({ text })
        .select()
        .single();
      if (error) throw error;
      return { monument: data };
    } catch {
      queuePending({ type: "addMonument", payload: { text } });
      return {
        monument: { id: `local-${Date.now()}`, text, created_at: new Date().toISOString(), _pending: true },
        offline: true,
      };
    }
  }

  try {
    const { data, error } = await supabase
      .from("bricks")
      .insert({ text, fired: false, cat: null })
      .select()
      .single();
    if (error) throw error;
    return { brick: data };
  } catch {
    queuePending({ type: "addBrick", payload: { text } });
    return {
      brick: {
        id: `local-${Date.now()}`,
        text,
        cat: null,
        fired: false,
        house_id: null,
        created_at: new Date().toISOString(),
        _pending: true,
      },
      offline: true,
    };
  }
}

export async function updateBrickText(id, text) {
  try {
    const { error } = await supabase.from("bricks").update({ text }).eq("id", id);
    if (error) throw error;
    return { offline: false };
  } catch {
    queuePending({ type: "updateBrickText", payload: { id, text } });
    return { offline: true };
  }
}

export async function deleteBrick(id) {
  try {
    const { error } = await supabase.from("bricks").delete().eq("id", id);
    if (error) throw error;
    return { offline: false };
  } catch {
    queuePending({ type: "deleteBrick", payload: { id } });
    return { offline: true };
  }
}

/** 味わい終えて、カテゴリ色を入れて焼き上げる。完成した家があれば返す。 */
export async function fireBrick(id, category) {
  try {
    const { error } = await supabase
      .from("bricks")
      .update({ cat: category, fired: true, fired_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    const completedHouse = await tryCompleteHouse();
    return { offline: false, completedHouse };
  } catch {
    queuePending({ type: "fireBrick", payload: { id, category } });
    return { offline: true, completedHouse: null };
  }
}

export async function nameHouse(houseId, name) {
  try {
    const { error } = await supabase.from("houses").update({ name }).eq("id", houseId);
    if (error) throw error;
    return { offline: false };
  } catch {
    queuePending({ type: "nameHouse", payload: { houseId, name } });
    return { offline: true };
  }
}

/** オフライン中にたまった変更を、繋がったときに反映する */
export async function flushPending() {
  const list = readPending();
  if (list.length === 0) return;
  const remaining = [];
  for (const entry of list) {
    try {
      switch (entry.type) {
        case "addBrick":
          await supabase.from("bricks").insert({ text: entry.payload.text, fired: false, cat: null });
          break;
        case "addMonument":
          await supabase.from("monuments").insert({ text: entry.payload.text });
          break;
        case "updateBrickText":
          await supabase.from("bricks").update({ text: entry.payload.text }).eq("id", entry.payload.id);
          break;
        case "deleteBrick":
          await supabase.from("bricks").delete().eq("id", entry.payload.id);
          break;
        case "fireBrick":
          await supabase
            .from("bricks")
            .update({ cat: entry.payload.category, fired: true, fired_at: new Date().toISOString() })
            .eq("id", entry.payload.id);
          break;
        case "nameHouse":
          await supabase.from("houses").update({ name: entry.payload.name }).eq("id", entry.payload.houseId);
          break;
        default:
          break;
      }
    } catch {
      remaining.push(entry);
    }
  }
  writePending(remaining);
  if (remaining.length < list.length) {
    await tryCompleteHouse().catch(() => null);
  }
}

export function hasPendingWrites() {
  return readPending().length > 0;
}
