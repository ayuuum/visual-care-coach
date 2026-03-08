

# 修正プラン: カメラ起動エラー + 文字の視認性改善

## 問題1: スマホでカメラがエラーになる

**原因**: `GuidePage.tsx` の `useEffect` 内で `camera.start()` を呼んでいる（17行目）。Safari/モバイルブラウザでは `getUserMedia` をユーザージェスチャー（ボタンクリック等）から直接呼ばないとセキュリティエラーになる。

**修正**: 
- `GuidePage` の自動起動 `useEffect` を削除
- Index.tsx の「ガイドを開始する」ボタンクリック時にカメラを起動し、成功後にページ遷移
- または GuidePage に「カメラを起動」ボタンを表示し、クリックで起動する方式に変更（こちらの方がシンプル）

## 問題2: HUD上の文字が見づらい

**原因**: `--foreground` が暗いグリーン（`163 22% 20%`）で、`hud-panel`（半透明黒背景）上では暗い文字が暗い背景に重なり読めない。

**修正**:
- HUD内テキストに `text-white` を適用（instruction, scene, controls）
- `hud-text-glow` の輝度を上げる
- HUDパネルの背景不透明度を `bg-black/70` に上げてコントラスト確保

## 実装タスク

1. **GuidePage にカメラ起動ボタンを追加** — マウント時の自動起動をやめ、ボタンクリックで `camera.start()` を呼ぶ
2. **HUDテキストを白に変更** — scene表示、instruction、ボタンラベル等をすべて `text-white` 系に
3. **HUDパネルのコントラスト強化** — `bg-black/70` + `border-white/15` に調整

