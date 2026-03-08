

## モバイル向けフォントサイズ・視認性改善

全3ページのテキストを大きく、モバイルで見やすくする。

### 変更内容

#### 1. Index.tsx（トップページ）
- タイトル: `text-4xl` → `text-5xl`
- サブタイトル説明文: `text-base` → `text-lg`
- 機能カードのラベル: `text-sm` → `text-base`、説明: `text-[10px]` → `text-xs`
- ボタン: `text-lg` → `text-xl`、`py-4` → `py-5`
- 注釈: `text-xs` → `text-sm`

#### 2. GuidePage.tsx（ガイド画面）
- 開始前タイトル: `text-2xl` → `text-3xl`
- 開始前説明: `text-base` → `text-lg`
- ボタン: `text-lg` → `text-xl`、`py-4` → `py-5`
- Scene表示: `text-base` → `text-lg`
- **指示テキスト（最重要）**: `text-xl` → `text-2xl`
- 初期ローディング: `text-lg` → `text-xl`
- 下部コントロール: `w-14 h-14` → `w-16 h-16`、アイコン `w-5 h-5` → `w-6 h-6`

#### 3. CompletePage.tsx（完了画面）
- タイトル: `text-3xl` → `text-4xl`
- 説明: `text-base` → `text-lg`
- 所要時間ラベル: `text-xs` → `text-sm`
- タイマー: `text-5xl` → `text-6xl`
- ボタン: `text-base` → `text-lg`、`py-4` → `py-5`

