import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const host = '127.0.0.1';
const port = Number(process.env.PORT || 4173);
const htmlPath = fileURLToPath(new URL('./index.html', import.meta.url));
const apiKey = process.env.TYPESAFE_API_KEY;
const cache = new Map();
const actions = new Set(['hello', 'coffee', 'honest', 'wait']);

function send(response, status, body, type = 'application/json; charset=utf-8') {
  response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  response.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 20_000) throw new Error('요청이 너무 깁니다.');
  }
  return JSON.parse(body);
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/') {
    send(response, 200, await readFile(htmlPath, 'utf8'), 'text/html; charset=utf-8');
    return;
  }
  if (request.method === 'GET' && request.url === '/api/status') {
    send(response, 200, { mode: apiKey ? 'live' : 'demo' });
    return;
  }
  if (request.method !== 'POST' || request.url !== '/api/react') {
    send(response, 404, { error: 'Not found' });
    return;
  }

  try {
    const input = await readJson(request);
    const { action, context, closeness, recentTalk, bandwidth } = input;
    if (!actions.has(action) || typeof context !== 'string' || context.length > 3000 ||
        ![closeness, recentTalk, bandwidth].every((value) => Number.isInteger(value) && value >= 0 && value <= 100)) {
      send(response, 400, { error: '입력값을 확인해 주세요.' });
      return;
    }
    if (!apiKey) {
      send(response, 200, { mode: 'demo' });
      return;
    }

    const key = JSON.stringify(input);
    if (cache.has(key)) {
      send(response, 200, cache.get(key));
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let upstream;
    try {
      upstream = await fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'jev-1.13.0',
          state: {
            relationship_context: context || 'No extra context provided.',
            action_under_consideration: {
              hello: 'Send a light, friendly message',
              coffee: 'Suggest meeting for coffee',
              honest: 'Share romantic feelings directly',
              wait: 'Give the other person space for a day',
            }[action],
            closeness_0_to_100: closeness,
            recent_conversation_0_to_100: recentTalk,
            available_energy_0_to_100: bandwidth,
          },
          questions: {
            reaction: {
              type: 'choice',
              instructions: 'Given only the supplied context, which immediate reaction is most plausible? Treat missing evidence as uncertainty. This is a scenario estimate, not a prediction of a real person.',
              criteria: {
                warm: 'Warm, interested, or pleased',
                neutral: 'Uncertain, reserved, or needs time',
                overwhelmed: 'Uncomfortable, pressured, or overwhelmed',
              },
            },
          },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!upstream.ok) {
      send(response, 502, { error: `Jev 요청 실패 (${upstream.status})` });
      return;
    }
    const data = await upstream.json();
    const answer = data?.answers?.reaction;
    if (!answer || !['warm', 'neutral', 'overwhelmed'].includes(answer.choice)) {
      send(response, 502, { error: 'Jev 응답 형식을 확인할 수 없습니다.' });
      return;
    }
    const result = {
      mode: 'live',
      emotion: answer.choice,
      probabilities: answer.probabilities,
      model: data.model,
    };
    cache.set(key, result);
    if (cache.size > 200) cache.delete(cache.keys().next().value);
    send(response, 200, result);
  } catch (error) {
    send(response, error.name === 'AbortError' ? 504 : 400, {
      error: error.name === 'AbortError' ? 'Jev 응답 시간이 초과됐습니다.' : '요청을 처리할 수 없습니다.',
    });
  }
});

server.listen(port, host, () => {
  process.stdout.write(`Jev reaction POC: http://${host}:${port} (${apiKey ? 'live' : 'demo'})\n`);
});
