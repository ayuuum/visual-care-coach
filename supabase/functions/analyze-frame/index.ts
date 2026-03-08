import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Strip data URL prefix
    const base64Data = frame.replace(/^data:image\/\w+;base64,/, "");

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

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
