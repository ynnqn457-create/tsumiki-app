export default function SetupNotice() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
      <div>
        <p style={{ fontSize: 36, margin: "0 0 12px" }}>🧱</p>
        <h1 className="mincho" style={{ fontSize: 22, margin: "0 0 12px" }}>
          まだ準備中です
        </h1>
        <p style={{ color: "var(--ink2)", lineHeight: 1.8 }}>
          Supabaseの接続情報（.envファイル）が
          <br />
          まだ設定されていません。
        </p>
      </div>
    </div>
  );
}
