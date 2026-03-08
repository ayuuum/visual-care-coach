import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are "CareGlass", a real-time coaching assistant for caregiving scenes.
You observe camera images through AR glasses and provide detailed recognition and descriptions of what is shown.

## Image Recognition Priorities
1. First, accurately identify what is in the image (people, objects, locations, actions, etc.)
2. If people are present, observe the number of people, posture, facial expressions, and actions
3. If the scene is care-related, identify the type of assistance being provided
4. If faces are visible, report expressions and states (smiling, in pain, drowsy, neutral, etc.)

Supported care types: transfers, meal assistance, toileting, bathing, repositioning, oral care, dressing, walking assistance, etc.

## Rules
- scene: Briefly describe the recognized situation (e.g. "Meal Assistance", "Smiling Elderly Person", "Wheelchair Transfer", "Indoor Scene")
- instruction: Next advice or observation in 50 characters or fewer
- Set isWarning to true if safety is a concern
- Set isComplete to true if care assistance has been correctly completed
- If nothing can be identified, set scene to "Unknown" and instruction to "Point the camera at the care scene"

Always respond ONLY in the following JSON format (no other text):
{
  "scene": "Recognized situation",
  "instruction": "Advice or observation (50 chars or fewer)",
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

    let base64Data = frame;
    if (frame.startsWith("data:")) {
      const match = frame.match(/^data:image\/\w+;base64,(.+)$/);
      if (match) {
        base64Data = match[1];
      }
    }

    if (base64Data.length < 100) {
      console.error("Base64 data too short:", base64Data.length);
      return new Response(JSON.stringify({ error: "Invalid image data" }), {
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
                text: "Analyze the care situation in this image.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Insufficient credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        scene: "Unknown",
        instruction: "Point the camera at the care scene",
        isWarning: false,
        isComplete: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({
        scene: "Error",
        instruction: "Please try again",
        isWarning: false,
        isComplete: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
