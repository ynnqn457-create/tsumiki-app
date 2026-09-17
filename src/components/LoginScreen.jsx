import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./LoginScreen.css";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) {
      setError("送れませんでした。メールアドレスを確認してください。");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="login-screen">
        <p className="login-mark">🧱</p>
        <h1 className="mincho">メールをおくりました</h1>
        <p className="login-body">
          {email} 宛にログイン用のリンクを送りました。
          <br />
          メールを開いて、リンクをタップしてください。
        </p>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <p className="login-mark">🧱</p>
      <h1 className="mincho">つみき</h1>
      <p className="login-body">
        もう起きたことを、
        <br />
        味わうためのアプリ
      </p>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={sending} className="login-submit">
          {sending ? "送っています…" : "ログインリンクを送る"}
        </button>
      </form>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}
