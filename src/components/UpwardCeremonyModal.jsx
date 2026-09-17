import { useState } from "react";
import Modal from "./Modal";
import "./FormShared.css";

export default function UpwardCeremonyModal({ house, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSubmit(house.id, name.trim());
    setSaving(false);
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <p className="taste-lead">上棟式</p>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: house.color,
          margin: "0 auto 18px",
          boxShadow: "var(--shadow-soft)",
        }}
      />
      <h2 className="mincho form-title">一軒、建ちました。</h2>
      <p style={{ textAlign: "center", color: "var(--ink2)", marginTop: -8, marginBottom: 20, lineHeight: 1.8 }}>
        26個、積み上がりました。
        <br />
        この家に、名前をつけてください。
      </p>
      <form onSubmit={handleSubmit} className="form-body">
        <input
          type="text"
          autoFocus
          placeholder="家の名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="form-submit" disabled={saving || !name.trim()}>
          この名前で、街へ
        </button>
        <button type="button" className="form-secondary" onClick={onClose}>
          あとで名前をつける
        </button>
      </form>
    </Modal>
  );
}
