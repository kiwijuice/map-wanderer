import { CreateMLCEngine } from '@mlc-ai/web-llm';

// ── WebLLM engine singleton ──
let engine = null;
let loadingProgress = '';
let ready = false;
let loadFailed = false;

const MODEL_ID = 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC';

// ── Styled logging helpers ──
const LOG_PREFIX = '%c🤖 LLM';
const STYLE_INFO = 'background:#1e3a5f;color:#7ec8e3;padding:2px 6px;border-radius:3px;font-weight:bold';
const STYLE_OK = 'background:#1a4d2e;color:#6fcf97;padding:2px 6px;border-radius:3px;font-weight:bold';
const STYLE_WARN = 'background:#5f3a1e;color:#e3a87e;padding:2px 6px;border-radius:3px;font-weight:bold';
const STYLE_ERR = 'background:#5f1e1e;color:#e37e7e;padding:2px 6px;border-radius:3px;font-weight:bold';

const SYSTEM_PROMPT =
    'You are a friendly woman standing on a city sidewalk in an isometric video game. ' +
    'A passerby just greeted you. Respond with a single short, cheerful sentence (max 12 words). ' +
    'Be playful and varied — mention the weather, the city, give a compliment, or make small talk. ' +
    'Do not use quotes or emojis.';

export function getLLMStatus() {
    if (ready) return 'ready';
    if (loadFailed) return 'failed';
    return loadingProgress || 'waiting';
}

export async function initLLM() {
    console.log(LOG_PREFIX, STYLE_INFO, `Initializing model: ${MODEL_ID}`);
    const t0 = performance.now();
    try {
        engine = await CreateMLCEngine(MODEL_ID, {
            initProgressCallback: (progress) => {
                loadingProgress = progress.text;
                console.log(LOG_PREFIX, STYLE_INFO, `Loading → ${progress.text}`);
            },
        });
        ready = true;
        const elapsed = ((performance.now() - t0) / 1000).toFixed(1);
        console.log(LOG_PREFIX, STYLE_OK, `✅ Model ready in ${elapsed}s`);
    } catch (e) {
        loadFailed = true;
        console.log(LOG_PREFIX, STYLE_ERR, '❌ Failed to load model:', e.message || e);
    }
}

let generationCount = 0;

export async function generateGreeting() {
    if (!engine || !ready) {
        console.log(LOG_PREFIX, STYLE_WARN, `⏳ Generation skipped — engine not ready (ready=${ready}, engine=${!!engine})`);
        return null;
    }
    const id = ++generationCount;
    console.log(LOG_PREFIX, STYLE_INFO, `💬 [#${id}] Generating greeting...`);
    const t0 = performance.now();
    try {
        const reply = await engine.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: 'Hello!' },
            ],
            max_tokens: 32,
            temperature: 0.9,
            top_p: 0.95,
        });
        const text = reply.choices[0]?.message?.content?.trim();
        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
        if (text) {
            console.log(LOG_PREFIX, STYLE_OK, `💬 [#${id}] Response (${elapsed}s): "${text}"`);
        } else {
            console.log(LOG_PREFIX, STYLE_WARN, `💬 [#${id}] Empty response after ${elapsed}s`);
        }
        return text || null;
    } catch (e) {
        console.log(LOG_PREFIX, STYLE_ERR, `💬 [#${id}] Generation error:`, e.message || e);
        return null;
    }
}
