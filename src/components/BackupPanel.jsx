import { useRef, useState } from "react";
import Modal from "./Modal";
import { buildExport, downloadJSON, copyToClipboard, parseBackupText, restoreToSupabase } from "../lib/backup";
import "./FormShared.css";

export default function BackupPanel({ state, onClose, onRestored }) {
  const fileRef = useRef(null);
  const [pasteText, setPasteText] = useState("");
  const [status, setStatus] = useState("");
  const [confirmingRestore, setConfirmingRestore] = useState(null);

  function handleExport() {
    downloadJSON(buildExport(state));
    setStatus("書き出しました。ダウンロードフォルダを確認してください。");
  }

  async function handleCopy() {
    await copyToClipboard(JSON.stringify(buildExport(state), null, 2));
    setStatus("コピーしました。メモアプリなどに貼り付けて保管してください。");
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseBackupText(String(reader.result));
        setConfirmingRestore(parsed);
      } catch {
        setStatus("ファイルを読み取れませんでした。");
      }
    };
    reader.readAsText(file);
  }

  function handlePasteRestore() {
    try {
      const parsed = parseBackupText(pasteText);
      setConfirmingRestore(parsed);
    } catch {
      setStatus("貼り付けた内容を読み取れませんでした。");
    }
  }

  async function runRestore() {
    setStatus("復元しています…");
    try {
      const result = await restoreToSupabase(confirmingRestore);
      setStatus(`復元しました（煉瓦 ${result.bricks} / 家 ${result.houses} / 碑 ${result.monuments}）`);
      setConfirmingRestore(null);
      onRestored();
    } catch {
      setStatus("復元できませんでした。オンラインか確認してください。");
    }
  }

  if (confirmingRestore) {
    return (
      <Modal onClose={() => setConfirmingRestore(null)}>
        <h2 className="mincho form-title">この内容を追加しますか？</h2>
        <p style={{ textAlign: "center", color: "var(--ink2)", lineHeight: 1.8, marginBottom: 20 }}>
          煉瓦 {confirmingRestore.bricks.length}個 / 家 {confirmingRestore.houses.length}軒 / 碑{" "}
          {confirmingRestore.monuments.length}基
          <br />
          今のデータに追加されます（上書きではありません）。
        </p>
        <button className="form-submit" onClick={runRestore}>
          追加する
        </button>
        <button className="form-secondary" style={{ marginTop: 10 }} onClick={() => setConfirmingRestore(null)}>
          やめる
        </button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="mincho form-title">バックアップ</h2>
      <div className="form-body">
        <button className="form-submit" onClick={handleExport}>
          ファイルに書き出す
        </button>
        <button className="form-secondary" onClick={handleCopy}>
          コピーする（メモアプリに貼れます）
        </button>

        <div style={{ height: 1, background: "rgba(46,64,52,0.1)", margin: "10px 0" }} />

        <p style={{ fontSize: 13, color: "var(--ink2)" }}>ファイルから復元する</p>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleFileChange} />

        <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 10 }}>
          貼り付けて復元する（メモアプリからコピーしたもの）
        </p>
        <textarea
          rows={4}
          placeholder="ここに貼り付け"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
        />
        <button className="form-secondary" onClick={handlePasteRestore} disabled={!pasteText.trim()}>
          貼り付けた内容を読み込む
        </button>

        {status && <p style={{ fontSize: 13, color: "var(--ink2)", textAlign: "center" }}>{status}</p>}
      </div>
    </Modal>
  );
}
