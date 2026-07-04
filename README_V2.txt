Production Interview AI Coach V2
================================

What is included:
- Online-ready Vercel project
- OpenRouter backend: /api/ai-coach
- Vocabulary bank: 744 entries
- CSV sheet: data/vocabulary.csv
- JS data file: data/vocabulary.js
- Speaking Room with 60-second recorder, timer, waveform
- AI feedback in short structured cards
- Interview Practice
- Factory Role-play
- Error Notebook with localStorage

Deploy:
1. Upload all files/folders to GitHub.
2. Deploy with Vercel.
3. Add Vercel Environment Variable:
   OPENROUTER_API_KEY = your OpenRouter key
   Environment = Production
4. Redeploy.
5. Open the site and test AI in Settings.

Important:
- This version uses OpenRouter only.
- Do not put API keys in index.html.
- Pronunciation scoring is transcript-based and waveform-based only. True word-level pronunciation scoring needs a separate speech assessment API such as Azure Speech Pronunciation Assessment.


V2.1 update:
- Added Học từ tab with topic/category/type/status filters.
- Added speaker buttons for word and example sentence in learning mode.
- Vocabulary source: data/vocabulary.csv and data/vocabulary.js.


V2.2 update
===========
- Feedback now includes Follow-up question actions.
- Click "Trả lời follow-up" to turn the AI follow-up into the next prompt.
- The recorder opens again for 60 seconds, so the interview can continue as a loop.
- Click "Nghe follow-up" to hear the next question.


V2.3 update
===========
- Fixes intermittent OpenRouter provider errors.
- Uses OpenRouter free router first, then retries fallback free model IDs.
- Cleans accidental markdown code fences from AI response.
- Keeps the same OPENROUTER_API_KEY setup on Vercel.


V2.4 update
===========
- Fixes misleading AI status badge in Speaking Room.
- Room no longer shows "AI online" by default.
- Status now starts as "AI chưa test", changes to "Đang test AI..." while calling API, then "AI online" or "AI offline / lỗi kết nối".
- CallAI errors are shown more clearly in Settings.


V2.5 update
===========
- Adds a safety fallback if data/vocabulary.js is missing or not uploaded.
- Fixes blank page/content issue when only index.html is tested locally without the data folder.
- Full 600+ vocabulary still requires uploading the /data folder.


V2.6 full fix
===========
- Fixes blank Speaking/Interview/Role-play caused by VOCAB_DATA not being available as an unqualified global variable.
- Adds explicit const VOCAB_DATA = window.VOCAB_DATA || [] binding.
- Adds safeRender so one section error cannot make all later sections blank.
- Keep uploading full source including /data folder for the complete 600+ vocabulary bank.


V2.7 final fixed
===========
- Restores AI status helper functions missing in V2.6.
- Fixes blank Speaking Room caused by getAIStatusBadge not defined.
- Keeps VOCAB_DATA binding fix and safeRender protection.
- Use this full package for upload.
