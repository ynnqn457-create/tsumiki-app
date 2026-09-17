import { useState } from "react";
import Modal from "./Modal";
import "./FormShared.css";

export default function NewBrickModal({ onClose, onSubmit }) {
  const [text, setText] = useState("");
  const [isMonument, setIsMonument] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    await onSubmit({ text: text.trim(), isMonument });
    setSaving(false);
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="mincho form-title">なにが、あった？</h2>
      <form onSubmit={handleSubmit} className="form-body">
        <textarea
          autoFocus
          rows={3}
          placeholder="起きたことを、そのまま書く"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isMonument}
            onChange={(e) => setIsMonument(e.target.checked)}
          />
          一発の大物（碑として広場に立てる）
        </label>
        <button type="submit" className="form-submit" disabled={saving || !text.trim()}>
          {isMonument ? "碑を立てる" : "積む"}
        </button>
      </form>
    </Modal>
  );
}
