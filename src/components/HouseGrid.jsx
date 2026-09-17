import { HOUSE_SIZE, categoryColor } from "../lib/categories";
import "./HouseGrid.css";

const ROW_SIZE = 4;

export default function HouseGrid({ slotBricks, onTapRaw, onTapFired }) {
  const cells = [];
  for (let i = 0; i < HOUSE_SIZE; i++) {
    cells.push(slotBricks[i] ?? null);
  }
  const rows = [];
  for (let i = 0; i < cells.length; i += ROW_SIZE) {
    rows.push(cells.slice(i, i + ROW_SIZE));
  }

  return (
    <div className="house-grid">
      {rows.map((row, rowIndex) => (
        <div className={`house-row ${rowIndex % 2 === 1 ? "house-row--offset" : ""}`} key={rowIndex}>
          {row.map((brick, i) => {
            if (!brick) {
              return <div className="brick brick--empty" key={i} />;
            }
            if (!brick.fired) {
              return (
                <button
                  className="brick brick--raw"
                  key={brick.id}
                  onClick={() => onTapRaw(brick)}
                  aria-label="味わう"
                />
              );
            }
            return (
              <button
                className="brick brick--fired"
                key={brick.id}
                style={{ background: categoryColor(brick.cat) }}
                onClick={() => onTapFired(brick)}
                aria-label="焼き上がった煉瓦"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
