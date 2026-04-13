const KB_KEY = 'dka_kb'

export const TEAM = [
  { id: 'u1', name: 'Astro Yan',   initials: 'AY', color: '#7C3AED' },
  { id: 'u2', name: 'Sarah Chen',  initials: 'SC', color: '#0EA5E9' },
  { id: 'u3', name: 'Mike Park',   initials: 'MP', color: '#16A34A' },
  { id: 'u4', name: 'Lily Wang',   initials: 'LW', color: '#EA580C' },
]

export const SEED_ITEMS = [
  {
    id: 'seed-1', type: 'resource',
    title: 'Designing with Claude Code',
    summary: 'A video walkthrough of how designers can use Claude Code to drive their workflow — from idea to working interface without handing off to engineering. Shows how natural-language prompting changes what a designer can ship alone.',
    tags: ['Claude Code', 'AI tools', 'design workflow'],
    url: 'https://www.youtube.com/watch?v=lkKGQVHrXzE', content: '',
    creatorId: 'u1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 'seed-2', type: 'resource',
    title: 'Build a Beautiful Mobile App with Claude Code in 16 Minutes',
    summary: 'A full tutorial demonstrating how to take a mobile app from zero to visually polished in under 20 minutes using Claude Code. Makes the case that the bottleneck in shipping is now taste and direction, not code.',
    tags: ['Claude Code', 'mobile', 'tutorial'],
    url: 'https://www.youtube.com/watch?v=oS53by4Hwvo', content: '',
    creatorId: 'u2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'seed-3', type: 'resource',
    title: 'When Software Had a Soul',
    summary: 'A meditation on how software once had texture, personality, and humanity — and how optimisation culture and AI have traded that soul for scale. The argument: taste and obsession are irreplaceable, and the best outcome of AI is empowering people with vision, not factories that ship slop.',
    tags: ['design culture', 'craft', 'AI'],
    url: 'https://x.com/ryolu_/status/2038841219556724924',
    content: `when software had a soul — there was a moment around 2005 when using a Mac felt like touching something alive. the dock bounced. the genie effect swooped. none of it was strictly necessary. all of it felt like someone cared. software back then had texture, philosophy, personality. somewhere along the way, we traded all of that for growth. A/B tests flattened the edges. design systems standardized the personality out. and then came AI agents, and the speed got inhuman. when making things is too easy, the slop comes for free too. AI doesn't make taste irrelevant — it makes it rarer and more valuable. if we get this right, we don't get a faster factory. we get a renaissance.`,
    creatorId: 'u3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'seed-4', type: 'resource',
    title: 'Designing Delightful Frontends with GPT-5.4',
    summary: 'Practical techniques for using GPT-5.4 to create polished, production-ready frontend designs — emphasising real design constraints, visual references, and avoiding generic patterns. Lower reasoning levels, grounded copy, and intentional design systems consistently outperform unconstrained generation.',
    tags: ['AI UX', 'frontend', 'GPT'],
    url: 'https://developers.openai.com/blog/designing-delightful-frontends-with-gpt-5-4', content: '',
    creatorId: 'u4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
]

// Returns the first URL found in text, or ''
export function extractUrl(text) {
  if (!text) return ''
  const match = text.match(/https?:\/\/[^\s]+/)
  return match ? match[0] : ''
}

export function getKB() {
  try { return JSON.parse(localStorage.getItem(KB_KEY) || '[]') }
  catch { return [] }
}

export function saveKB(items) {
  try { localStorage.setItem(KB_KEY, JSON.stringify(items)) } catch {}
}

export function addItem(items, item) {
  const newItem = {
    id:        item.id        ?? String(Date.now()),
    type:      item.type      ?? 'resource',
    title:     item.title     ?? 'Untitled',
    summary:   item.summary   ?? '',
    tags:      item.tags      ?? [],
    url:       item.url       ?? '',
    content:   item.content   ?? '',
    question:  item.question  ?? undefined,
    answer:    item.answer    ?? undefined,
    createdAt: item.createdAt ?? new Date().toISOString(),
  }
  const updated = [newItem, ...items]
  saveKB(updated)
  return updated
}

export function deleteItem(items, id) {
  const updated = items.filter(i => i.id !== id)
  saveKB(updated)
  return updated
}

export function relativeTime(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (d < 1)  return 'just now'
  if (d < 60) return `${d}m ago`
  const h = Math.floor(d / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function tagPalette(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  const p = [
    { bg: '#EDE9FE', color: '#5B21B6' },
    { bg: '#DBEAFE', color: '#1E40AF' },
    { bg: '#D1FAE5', color: '#065F46' },
    { bg: '#FEF3C7', color: '#92400E' },
  ]
  return p[Math.abs(hash) % 4]
}
