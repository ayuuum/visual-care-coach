

## 問題

Edge functionのログから、Google Gemini APIが `Unable to process input image` (400 INVALID_ARGUMENT) を返している。

原因: `data:image/jpeg;base64,...` 形式のdata URLをそのまま `image_url` として送っているが、Gemini（OpenAI互換API経由）ではこの形式の処理に問題がある可能性がある。また、カメラから取得した画像が小さすぎたり、不正なbase64になっている可能性もある。

## 修正方針

### 1. Edge Function (`supabase/functions/analyze-frame/index.ts`)
- `image_url` の代わりに、OpenAI互換のinline base64形式を正しく使う
- base64データのバリデーションを追加（空や不正データのチェック）
- data URLプレフィックスの処理を修正

### 2. カメラキャプチャ (`src/hooks/useCamera.ts`)
- `captureFrame` でdata URLプレフィックスを除去し、純粋なbase64のみ送信
- 画像品質と解像度の調整（小さすぎる画像の回避）

### 3. Edge Functionのリクエスト形式変更
現在:
```json
{
  "type": "image_url",
  "image_url": { "url": "data:image/jpeg;base64,..." }
}
```

修正後（base64部分のみ送信し、edge function側で正しく構築）:
- クライアントからはプレフィックスなしのbase64を送信
- edge function側で `data:image/jpeg;base64,{base64Data}` を正しく構築
- base64データが最低限の長さであることを検証

