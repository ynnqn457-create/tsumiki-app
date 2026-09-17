# つみき

もう起きたことを、味わうためのアプリ。

達成を記録するアプリではなく、達成を味わうためのアプリ。26個の煉瓦を積んで一軒の家を建て、街に並べていく。

## 仕組み

- 保存先: Supabase（Postgres）。ブラウザのストレージだけに頼らないので、しばらく開かなくてもデータは消えない
- 認証: メールのマジックリンク（個人利用のための簡易な保護）
- 街ビュー: SVGで描画

## 開発

```bash
npm install
npm run dev
```

`.env.local` に以下を設定する（Supabaseプロジェクトの Settings → API から取得）。

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## デプロイ

Vercelにこのリポジトリを接続し、上記の環境変数を Vercel 側の Project Settings → Environment Variables にも設定する。Root Directory はリポジトリ直下のまま（変更不要）。
