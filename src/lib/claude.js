const CLAUDE_API_KEY  = import.meta.env.VITE_CLAUDE_API_KEY
const CLAUDE_MODEL    = 'claude-sonnet-4-6'
const CLAUDE_ENDPOINT = 'https://api.anthropic.com/v1/messages'

const HEADERS = {
  'Content-Type':                              'application/json',
  'x-api-key':                                 CLAUDE_API_KEY,
  'anthropic-version':                         '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
}

// Fetches real title + description from a URL via CORS proxy
// Special-cases GitHub Gists to use the API directly
export async function fetchPageMeta(url) {
  try {
    // Strip tracking params so the proxy gets a clean URL
    const cleanUrl = url.split('?')[0]
    const proxy    = `https://corsproxy.io/?url=${encodeURIComponent(cleanUrl)}`
    console.log('[fetchPageMeta] fetching:', proxy)
    const res  = await fetch(proxy, { signal: AbortSignal.timeout(8000) })
    const html = await res.text()
    const doc  = new DOMParser().parseFromString(html, 'text/html')
    const title = doc.querySelector('title')?.textContent?.trim() || ''
    const desc  =
      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
      doc.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    console.log('[fetchPageMeta] result:', { title, desc })
    return { title, desc }
  } catch (e) {
    console.warn('[fetchPageMeta] failed:', e)
    return null
  }
}

// Extracts JSON object from a string even if Claude adds surrounding text
export function extractJSON(text) {
  try { return JSON.parse(text) } catch {}
  const match = text.match(/\{[\s\S]*\}/)
  if (match) return JSON.parse(match[0])
  throw new Error('No valid JSON found in response')
}

export async function callClaude(systemPrompt, userMessage) {
  const res  = await fetch(CLAUDE_ENDPOINT, {
    method: 'POST', headers: HEADERS,
    body: JSON.stringify({
      model: CLAUDE_MODEL, max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error?.message ?? `API error ${res.status}`)
  return data.content[0].text
}

export async function callClaudeStream(systemPrompt, userMessage, onChunk, onDone) {
  const res = await fetch(CLAUDE_ENDPOINT, {
    method: 'POST', headers: HEADERS,
    body: JSON.stringify({
      model: CLAUDE_MODEL, max_tokens: 1000, stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${res.status}`)
  }
  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let   buffer  = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') continue
      try {
        const evt = JSON.parse(payload)
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') onChunk(evt.delta.text)
        if (evt.type === 'message_stop') { onDone(); return }
      } catch {}
    }
  }
  onDone()
}
