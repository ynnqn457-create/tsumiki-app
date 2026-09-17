import { useState } from "react";
import Modal from "./Modal";
import { CATEGORY_LIST } from "../lib/categories";
import "./TasteModal.css";

export default function TasteModal({ brick, onClose, onFire, onEditText, onDelete }) {
  const [category, setCategory] = useState(null);
  const [firing, setFiring] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(brick.text);

  async function handleFire() {
    if (!category) return;
    setFiring(true);
    await onFire(brick.id, category);
    setFiring(false);
    onClose();
  }

  async function handleSaveText() {
    if (text.trim() && text.trim() !== brick.text) {
      await onEditText(brick.id, text.trim());
    }
    setEditing(false);
  }

  return (
    <Modal onClose={onClose}>
      <p className="taste-lead">味わう</p>
      {editing ? (
        <textarea
          className="taste-edit"
          rows={3}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSaveText}
        />
      ) : (
        <p className="taste-text mincho" onClick={() => setEditing(true)}>
          {brick.text}
        </p>
      )}
      <p className="taste-hint">これは、どこに置く？</p>
      <div className="taste-categories">
        {CATEGORY_LIST.map((cat) => (
          <button
            key={cat.key}
            className={`taste-cat ${category === cat.key ? "taste-cat--active" : ""}`}
            style={{ "--cat-color": cat.color }}
            onClick={() => setCategory(cat.key)}
          >
            <span className="taste-cat-emoji">{cat.emoji}</span>
            <span className="taste-cat-label">{cat.label}</span>
          </button>
        ))}
      </div>
      <button className="taste-fire" disabled={!category || firing} onClick={handleFire}>
        {firing ? "焼いています…" : "焼き上げる"}
      </button>
      <button className="taste-delete" onClick={() => onDelete(brick.id).then(onClose)}>
        記録を取り消す
      </button>
    </Modal>
  );
}
