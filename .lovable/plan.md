

## AIの指示をイラストで表示する

現在テキストのみで表示しているAI指示に、イラスト画像を追加します。Lovable AIの画像生成モデル（gemini-2.5-flash-image）を使い、指示内容に基づいたイラストを生成して表示します。

### 実装内容

**1. 新規Edge Function: `supabase/functions/generate-instruction-image/index.ts`**
- AI指示テキストを受け取り、ケア場面のイラストを生成
- `google/gemini-2.5-flash-image`モデルを使用
- base64画像を返却
- 429/402エラーハンドリング含む

**2. `src/hooks/useAIGuide.ts` 修正**
- AIレスポンス取得後、指示テキストを元に画像生成Edge Functionを呼び出し
- `AIResponse`に`illustrationUrl`フィールドを追加
- 画像生成は非同期で行い、テキスト指示は即座に表示（画像は後から表示）

**3. `src/pages/GuidePage.tsx` 修正**
- 指示パネル内にイラスト画像を表示（テキストの上に配置）
- 画像読み込み中はスケルトン表示
- テキスト指示は引き続き併記

### UI イメージ

```text
┌──────────────────────────┐
│  ┌────────────────────┐  │
│  │   🖼 イラスト       │  │
│  │  (ケア手順の図解)   │  │
│  └────────────────────┘  │
│  腰を支えて立ち上がりを   │
│  サポートしてください      │
└──────────────────────────┘
```

### 対象ファイル

| ファイル | 操作 |
|----------|------|
| `supabase/functions/generate-instruction-image/index.ts` | 新規作成 |
| `src/hooks/useAIGuide.ts` | イラスト生成呼び出し追加 |
| `src/pages/GuidePage.tsx` | イラスト表示追加 |

