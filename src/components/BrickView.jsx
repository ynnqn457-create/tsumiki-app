import Modal from "./Modal";
import { CATEGORIES } from "../lib/categories";
import "./TasteModal.css";

export default function BrickView({ brick, onClose }) {
  const cat = CATEGORIES[brick.cat];
  return (
    <Modal onClose={onClose}>
      <p className="taste-lead">
        {cat ? `${cat.emoji} ${cat.label}` : ""}
      </p>
      <p className="taste-text mincho">{brick.text}</p>
    </Modal>
  );
}
