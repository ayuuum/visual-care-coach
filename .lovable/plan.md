

## Convert entire app to English

All Japanese text across every page and the AI system prompt will be translated to English.

### Changes

#### 1. `src/pages/Index.tsx`
- Title/tagline → "AR Care Assistant" / "Real-time AI care assistant for AR glasses..."
- Feature cards → "Image Recognition", "Voice Guide", "Safety Alerts"
- Button → "Start Guide"
- Footer note → "※ MVP uses smartphone camera"

#### 2. `src/pages/GuidePage.tsx`
- Pre-start: "Point the camera at the care scene" / "Start Camera"
- HUD labels: "Scene", "Scanning...", "Analyzing..."
- Timer label
- Stop/complete buttons
- Warning/loading text

#### 3. `src/pages/CompletePage.tsx`
- "Guide Complete" / "Great work"
- "Care assistance completed correctly"
- "Duration" label
- "Try Again" / Home button

#### 4. `src/lib/ai-prompt.ts`
- Translate entire system prompt to English (scene recognition instructions, JSON format, rules)

#### 5. `supabase/functions/analyze-frame/index.ts`
- Translate the system prompt in the edge function to match

#### 6. `src/hooks/useSpeech.ts`
- Change `utterance.lang` from `"ja-JP"` to `"en-US"`

#### 7. `index.html`
- Change `lang="ja"` to `lang="en"` if present, update title/description

