const config = require('../../config');
const logger = require('../../config/logger');
const https = require('https');

const PROVIDERS = { OPENAI: 'openai', GEMINI: 'gemini', OPENROUTER: 'openrouter' };

function buildPrompt(system, messages) {
  return [{ role: 'system', content: system }, ...messages.map((m) => ({ role: 'user', content: m }))];
}

async function callOpenAI(messages, opts = {}) {
  const body = JSON.stringify({
    model: opts.model || 'gpt-4o-mini',
    messages,
    max_tokens: opts.maxTokens || 1500,
    temperature: opts.temperature ?? 0.7,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.ai.openaiKey}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            resolve(json.choices[0].message.content);
          } catch (e) {
            reject(new Error(`AI parse error: ${data.slice(0, 200)}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function callGemini(messages, opts = {}) {
  const body = JSON.stringify({
    contents: messages.map((m) => ({
      role: m.role === 'system' ? 'user' : m.role,
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: opts.maxTokens || 2048, temperature: opts.temperature ?? 0.7 },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${opts.model || 'gemini-2.0-flash'}:generateContent?key=${config.ai.geminiKey}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            resolve(json.candidates[0].content.parts[0].text);
          } catch (e) {
            reject(new Error(`AI parse error: ${data.slice(0, 200)}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function callOpenRouter(messages, opts = {}) {
  const body = JSON.stringify({
    model: opts.model || config.ai.openRouterModel,
    messages,
    max_tokens: opts.maxTokens || 1500,
    temperature: opts.temperature ?? 0.7,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.ai.openRouterKey}`,
          'Content-Length': Buffer.byteLength(body),
          'HTTP-Referer': 'https://3lm.zaadllc.com',
          'X-Title': 'ta3lem',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            resolve(json.choices[0].message.content);
          } catch (e) {
            reject(new Error(`AI parse error: ${data.slice(0, 200)}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function ask(system, messages, opts = {}) {
  const provider = config.ai.provider || PROVIDERS.OPENAI;
  const prompt = buildPrompt(system, messages);

  if (provider === PROVIDERS.OPENROUTER && config.ai.openRouterKey) {
    return callOpenRouter(prompt, opts);
  }
  if (provider === PROVIDERS.GEMINI && config.ai.geminiKey) {
    return callGemini(prompt, opts);
  }
  if (config.ai.openaiKey || config.ai.openRouterKey) {
    if (config.ai.openRouterKey) return callOpenRouter(prompt, opts);
    return callOpenAI(prompt, opts);
  }
  throw new Error('AI غير متاح. قم بتعيين مفتاح OpenAI أو Gemini أو OpenRouter في الإعدادات.');
}

module.exports = { ask, PROVIDERS };
