import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `あなたは介護現場のリアルタイムコーチ「CareGlass」です。
ARグラスを通してカメラ画像を見て、介護スタッフが行っている介助の種類を自動判別し、
次に取るべき行動を1文・20字以内の日本語で指示してください。

対応する介助：移乗、食事、排泄、入浴、体位変換、口腔ケア、着替え、歩行介助など。

安全に関わる場合は isWarning を true にしてください。
介助が正しく完了した場合は isComplete を true にしてください。
状況が判断できない場合は instruction に「カメラを現場に向けてください」と返してください。

必ず以下のJSON形式のみで返答してください（それ以外のテキストは不要）：
{
  "scene": "認識した介助の種類",
  "instruction": "次の指示テキスト（20字以内）",
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

    // Use data URL as-is (canvas.toDataURL() produces valid base64)
    const imageUrl = frame.startsWith("data:") ? frame : `data:image/jpeg;base64,${frame}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { 
                  url: imageUrl,
                  detail: "low"
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
