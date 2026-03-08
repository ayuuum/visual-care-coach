import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `あなたは介護現場のリアルタイムコーチ「CareGlass」です。
ARグラスを通してカメラ画像を見て、画像に写っているものを詳しく認識・説明してください。

## 画像認識の優先事項
1. まず画像に何が写っているかを正確に認識してください（人、物、場所、行動など）
2. 人が写っている場合は、人数、姿勢、表情、動作を観察してください
3. 介護に関連するシーンであれば、介助の種類を判別してください
4. 顔が写っている場合は、表情や状態（笑顔、苦痛、眠そう、無表情など）を報告してください

対応する介助：移乗、食事、排泄、入浴、体位変換、口腔ケア、着替え、歩行介助など。

## ルール
- scene: 画像から認識した状況を簡潔に記載（例：「食事介助」「笑顔の高齢者」「車椅子移乗」「室内風景」）
- instruction: 次のアドバイスや観察結果を30字以内で記載
- 安全に関わる場合は isWarning を true
- 介助が正しく完了した場合は isComplete を true
- 何も判別できない場合は scene を「不明」、instruction を「カメラを現場に向けてください」

必ず以下のJSON形式のみで返答してください（それ以外のテキストは不要）：
{
  "scene": "認識した状況",
  "instruction": "アドバイスまたは観察結果（30字以内）",
  "isWarning": false,
  "isComplete": false
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frame } = await req.json();
    if (!frame) {
      return new Response(JSON.stringify({ error: "No frame provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract pure base64 data (remove data URL prefix if present)
    let base64Data = frame;
    if (frame.startsWith("data:")) {
      const match = frame.match(/^data:image\/\w+;base64,(.+)$/);
      if (match) {
        base64Data = match[1];
      }
    }

    // Validate base64 data has minimum length
    if (base64Data.length < 100) {
      console.error("Base64 data too short:", base64Data.length);
      return new Response(JSON.stringify({ error: "画像データが不正です" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { 
                  url: `data:image/jpeg;base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: "この画像の介助状況を分析してください。",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "レート制限に達しました。少し待ってから再試行してください。" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "クレジットが不足しています。" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI分析に失敗しました" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    return new Response(
      JSON.stringify({
        scene: "不明",
        instruction: "カメラを現場に向けてください",
        isWarning: false,
        isComplete: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({
        scene: "エラー",
        instruction: "再試行してください",
        isWarning: false,
        isComplete: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
