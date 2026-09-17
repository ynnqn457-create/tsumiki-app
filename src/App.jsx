import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseReady } from "./lib/supabaseClient";
import * as store from "./lib/dataStore";
import { currentSlotBricks, findUnnamedHouse } from "./lib/dataStore";
import LoginScreen from "./components/LoginScreen";
import SetupNotice from "./components/SetupNotice";
import HouseGrid from "./components/HouseGrid";
import NewBrickModal from "./components/NewBrickModal";
import TasteModal from "./components/TasteModal";
import BrickView from "./components/BrickView";
import UpwardCeremonyModal from "./components/UpwardCeremonyModal";
import BackupPanel from "./components/BackupPanel";
import TownView from "./components/TownView";
import "./App.css";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = 判定中
  const [data, setData] = useState({ bricks: [], houses: [], monuments: [], offline: false });
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("home");
  const [showNewBrick, setShowNewBrick] = useState(false);
  const [tasteBrick, setTasteBrick] = useState(null);
  const [viewBrick, setViewBrick] = useState(null);
  const [showBackup, setShowBackup] = useState(false);
  const [hideCeremony, setHideCeremony] = useState(false);

  useEffect(() => {
    if (!supabaseReady) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    const state = await store.fetchState();
    setData(state);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (session) refresh();
  }, [session, refresh]);

  useEffect(() => {
    window.addEventListener("online", refresh);
    return () => window.removeEventListener("online", refresh);
  }, [refresh]);

  const unnamedHouse = findUnnamedHouse(data.houses);

  useEffect(() => {
    setHideCeremony(false);
  }, [unnamedHouse?.id]);

  if (!supabaseReady) return <SetupNotice />;
  if (session === undefined) return null;
  if (!session) return <LoginScreen />;
  if (!loaded) {
    return (
      <div className="app-loading">
        <p>🧱</p>
      </div>
    );
  }

  const slotBricks = currentSlotBricks(data.bricks);
  const namedHouses = data.houses.filter((h) => h.name);

  async function handleAddBrick({ text, isMonument }) {
    await store.addBrick({ text, isMonument });
    await refresh();
  }
  async function handleFire(id, category) {
    await store.fireBrick(id, category);
    await refresh();
  }
  async function handleEditText(id, text) {
    await store.updateBrickText(id, text);
    await refresh();
  }
  async function handleDelete(id) {
    await store.deleteBrick(id);
    await refresh();
    return true;
  }
  async function handleNameHouse(houseId, name) {
    await store.nameHouse(houseId, name);
    await refresh();
  }

  return (
    <div className="app">
      {data.offline && <div className="offline-banner">オフライン中（つながったら自動で送ります）</div>}
      {unnamedHouse && hideCeremony && (
        <button className="ceremony-pill" onClick={() => setHideCeremony(false)}>
          🏠 名前を付けていない家があります
        </button>
      )}

      <main className="app-main">
        {view === "home" ? (
          <div className="home">
            <h1 className="mincho home-title">つみき</h1>
            <HouseGrid slotBricks={slotBricks} onTapRaw={setTasteBrick} onTapFired={setViewBrick} />
          </div>
        ) : (
          <TownView houses={namedHouses} monuments={data.monuments} />
        )}
      </main>

      {view === "home" && (
        <button className="fab" onClick={() => setShowNewBrick(true)} aria-label="積む">
          +
        </button>
      )}

      <nav className="tabbar">
        <button className={view === "home" ? "tab tab--active" : "tab"} onClick={() => setView("home")}>
          積む
        </button>
        <button className={view === "town" ? "tab tab--active" : "tab"} onClick={() => setView("town")}>
          街
        </button>
        <button className="tab" onClick={() => setShowBackup(true)}>
          設定
        </button>
      </nav>

      {showNewBrick && <NewBrickModal onClose={() => setShowNewBrick(false)} onSubmit={handleAddBrick} />}
      {tasteBrick && (
        <TasteModal
          brick={tasteBrick}
          onClose={() => setTasteBrick(null)}
          onFire={handleFire}
          onEditText={handleEditText}
          onDelete={handleDelete}
        />
      )}
      {viewBrick && <BrickView brick={viewBrick} onClose={() => setViewBrick(null)} />}
      {unnamedHouse && !hideCeremony && (
        <UpwardCeremonyModal house={unnamedHouse} onClose={() => setHideCeremony(true)} onSubmit={handleNameHouse} />
      )}
      {showBackup && <BackupPanel state={data} onClose={() => setShowBackup(false)} onRestored={refresh} />}
    </div>
  );
}
