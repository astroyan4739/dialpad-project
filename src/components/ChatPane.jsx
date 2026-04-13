import { useState, useRef, useEffect } from 'react'
import { ArrowUpIcon, ChevronDownIcon, PlusIcon, ChatBubbleIcon, BookmarkIcon } from '@radix-ui/react-icons'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import ReactMarkdown from 'react-markdown'
import SourceIcon from './SourceIcon'
import { callClaude, callClaudeStream } from '../lib/claude'
import { addItem } from '../lib/kb'

const AI_GRADIENT = 'linear-gradient(135deg, #7C3AED 0%, #C026D3 50%, #F97316 100%)'

const mdComponents = {
  p:      ({ children }) => <p style={{ margin: '0 0 10px', lineHeight: 1.8 }}>{children}</p>,
  ul:     ({ children }) => <ul style={{ margin: '0 0 10px', paddingLeft: 20 }}>{children}</ul>,
  ol:     ({ children }) => <ol style={{ margin: '0 0 10px', paddingLeft: 20 }}>{children}</ol>,
  li:     ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  code:   ({ children }) => <code style={{ background: '#EDE9FF', borderRadius: 4, padding: '1px 5px', fontSize: 12, fontFamily: 'monospace' }}>{children}</code>,
  pre:    ({ children }) => <pre style={{ background: '#EDE9FF', borderRadius: 6, padding: '10px 12px', fontSize: 12, overflowX: 'auto', margin: '0 0 8px' }}>{children}</pre>,
  h1:     ({ children }) => <h1 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>{children}</h1>,
  h2:     ({ children }) => <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 6px' }}>{children}</h2>,
  h3:     ({ children }) => <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{children}</h3>,
  hr:     () => null,
}
const CHATS_KEY   = 'dka_chats'

function getSessions() {
  try { return JSON.parse(localStorage.getItem(CHATS_KEY) || '[]') } catch { return [] }
}
function saveSessions(s) {
  try { localStorage.setItem(CHATS_KEY, JSON.stringify(s)) } catch {}
}
function newSessionId() { return `chat-${Date.now()}` }

function relativeDate(iso) {
  const d = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (d < 1)  return 'just now'
  if (d < 60) return `${d}m ago`
  const h = Math.floor(d / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ChatPane({ kb, onKBChange }) {
  const [question, setQuestion]     = useState('')
  const [messages, setMessages]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [savedIds, setSavedIds]     = useState(new Set())
  const [sessions, setSessions]     = useState(() => getSessions())
  const [sessionId, setSessionId]   = useState(() => newSessionId())
  const [sessionTitle, setSessionTitle] = useState('New chat')
  const messagesEndRef               = useRef(null)

  // Persist current session whenever messages change
  useEffect(() => {
    if (messages.length === 0) return
    setSessions(prev => {
      const exists = prev.find(s => s.id === sessionId)
      const updated = exists
        ? prev.map(s => s.id === sessionId ? { ...s, messages, title: sessionTitle } : s)
        : [{ id: sessionId, title: sessionTitle, messages, createdAt: new Date().toISOString() }, ...prev]
      saveSessions(updated)
      return updated
    })
  }, [messages, sessionId, sessionTitle])

  // Generate AI title after first exchange completes
  async function generateTitle(q, answer) {
    try {
      const title = await callClaude(
        'Generate a concise 4-6 word title summarising this Q&A. Respond with ONLY the title text, no punctuation at the end.',
        `Q: ${q}\nA: ${answer.slice(0, 300)}`
      )
      setSessionTitle(title.trim())
    } catch {}
  }

  function startNewChat() {
    setMessages([])
    setQuestion('')
    setSessionId(newSessionId())
    setSessionTitle('New chat')
    setSavedIds(new Set())
  }

  function loadSession(s) {
    setMessages(s.messages)
    setSessionId(s.id)
    setSessionTitle(s.title || 'New chat')
    setSavedIds(new Set(s.messages.filter(m => m.savedToKB).map(m => m.id)))
    setQuestion('')
  }

  function saveNote(msg) {
    if (savedIds.has(msg.id)) return
    const updated = addItem(kb, {
      type: 'qa', title: msg.q.slice(0, 60),
      summary: msg.answer.slice(0, 200),
      answer: msg.answer, question: msg.q, tags: ['note'],
    })
    onKBChange(updated)
    setSavedIds(prev => new Set([...prev, msg.id]))
  }

  async function handleAsk() {
    if (!question.trim() || loading) return

    const q       = question.trim()
    const context = kb.map(i =>
      `[ID:${i.id}] Title: ${i.title}\nSummary: ${i.summary}\nTags: ${i.tags.join(', ')}`
    ).join('\n\n---\n\n')

    const system = `You are a design knowledge assistant for a product design team. You have access to the team's shared knowledge base. Answer the designer's question using the knowledge base context. Be specific, practical, and reference relevant resources when helpful.\n\nAt the very end of your response, on its own line, add exactly: SOURCES: id1,id2 — listing only the IDs of knowledge base items you directly referenced (e.g. SOURCES: seed-1,seed-3). If you referenced none, omit this line entirely.\n\nKnowledge base:\n\n${context}`

    const msgId = Date.now()
    setMessages(prev => [...prev, { id: msgId, q, answer: '', sources: [], streaming: true }])
    setQuestion('')
    setLoading(true)

    let fullAnswer = ''
    try {
      await callClaudeStream(system, q,
        chunk => {
          fullAnswer += chunk
          // Strip SOURCES line from visible answer while streaming
          const visible = fullAnswer.replace(/\nSOURCES:.*$/s, '')
          setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, answer: visible } : m
          ))
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        },
        () => {
          // Parse SOURCES ids
          const sourcesMatch = fullAnswer.match(/\nSOURCES:\s*([^\n]+)/)
          const sourceIds = sourcesMatch
            ? sourcesMatch[1].split(',').map(s => s.trim()).filter(Boolean)
            : []
          const sources = sourceIds.map(id => kb.find(i => i.id === id)).filter(Boolean)
          const cleanAnswer = fullAnswer.replace(/\nSOURCES:.*$/s, '').trimEnd()

          setMessages(prev => {
            const updated = prev.map(m =>
              m.id === msgId ? { ...m, answer: cleanAnswer, sources, streaming: false } : m
            )
            // Generate title after first exchange only
            if (updated.filter(m => !m.streaming && m.answer).length === 1) {
              generateTitle(q, cleanAnswer)
            }
            return updated
          })
          setLoading(false)
        }
      )
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, answer: `Error: ${err.message}`, streaming: false } : m
      ))
      setLoading(false)
    }
  }

  const canSend = question.trim().length > 0 && !loading

  return (
    <div style={styles.pane}>
      {/* Header */}
      <div style={styles.header}>
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button style={styles.sessionBtn}>
              <span style={styles.sessionTitle}>{sessionTitle}</span>
              <ChevronDownIcon width={13} height={13} style={{ flexShrink: 0 }}/>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="bottom" align="start" sideOffset={4} style={styles.menu}>
              {/* New chat */}
              <DropdownMenu.Item style={styles.menuItem} onSelect={startNewChat}>
                <PlusIcon width={13} height={13}/>
                New chat
              </DropdownMenu.Item>

              {sessions.length > 0 && <DropdownMenu.Separator style={styles.menuSep}/>}

              {/* History */}
              {sessions.length === 0 ? (
                <div style={styles.menuEmpty}>No previous chats</div>
              ) : (
                sessions.map(s => (
                  <DropdownMenu.Item
                    key={s.id}
                    style={{ ...styles.menuItem, ...(s.id === sessionId ? styles.menuItemActive : {}) }}
                    onSelect={() => loadSession(s)}
                  >
                    <ChatBubbleIcon width={12} height={12} style={{ flexShrink: 0, opacity: 0.5 }}/>
                    <span style={styles.menuItemText}>{s.title}</span>
                    <span style={styles.menuItemDate}>{relativeDate(s.createdAt)}</span>
                  </DropdownMenu.Item>
                ))
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map(msg => (
          <div key={msg.id} style={styles.msgBlock}>
            {/* User bubble */}
            <div style={styles.userRow}>
              <div style={styles.userBubble}>{msg.q}</div>
            </div>
            {/* AI response */}
            <div style={styles.aiRow}>
              <div style={styles.aiAvatar}>
                <svg width="10" height="10" viewBox="0 0 18 18" fill="none">
                  <rect x="1"  y="1"  width="7" height="7" rx="1.5" fill="white" opacity="0.95"/>
                  <rect x="10" y="1"  width="7" height="7" rx="1.5" fill="white" opacity="0.65"/>
                  <rect x="1"  y="10" width="7" height="7" rx="1.5" fill="white" opacity="0.65"/>
                  <rect x="10" y="10" width="7" height="7" rx="1.5" fill="white" opacity="0.35"/>
                </svg>
              </div>
              <div style={styles.aiContent}>
                {msg.answer
                  ? <ReactMarkdown components={mdComponents}>{msg.answer}</ReactMarkdown>
                  : <span style={styles.dot} />
                }
                {!msg.streaming && msg.answer && (
                  <button
                    style={{ ...styles.saveNoteBtn, ...(savedIds.has(msg.id) ? styles.saveNoteBtnDone : {}) }}
                    className={savedIds.has(msg.id) ? '' : 'save-note-btn'}
                    onClick={() => saveNote(msg)}
                    disabled={savedIds.has(msg.id)}
                  >
                    <BookmarkIcon width={11} height={11}/>
                    {savedIds.has(msg.id) ? 'Saved to notes' : 'Save to note'}
                  </button>
                )}
                {!msg.streaming && msg.sources?.length > 0 && (
                  <div style={styles.sources}>
                    <span style={styles.sourcesLabel}>Sources</span>
                    <div style={styles.sourceCards}>
                      {msg.sources.map(src => (
                        <a
                          key={src.id}
                          href={src.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.sourceCard}
                          className="source-card"
                          onClick={e => !src.url && e.preventDefault()}
                        >
                          <SourceIcon url={src.url} size={16}/>
                          <span style={styles.sourceTitle}>{src.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <textarea
            style={styles.textarea}
            rows={3}
            placeholder="Send a message"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleAsk()
              }
            }}
          />
          <button
            style={{ ...styles.sendBtn, ...(canSend ? styles.sendBtnActive : {}) }}
            onClick={handleAsk}
            disabled={!canSend}
          >
            <ArrowUpIcon width={14} height={14}/>
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  pane:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:  { height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid rgba(216, 217, 224, 0.5)', flexShrink: 0 },

  sessionBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '6px 8px', borderRadius: 'var(--radius-component)',
    fontFamily: 'var(--font-family)', fontSize: 15, fontWeight: 400,
    color: 'var(--color-gray-900)',
    maxWidth: 320,
    transition: 'background 0.12s',
  },
  sessionTitle: {
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    maxWidth: 260,
  },

  menu: {
    minWidth: 280,
    background: 'var(--color-white)',
    borderRadius: 10,
    padding: 4,
    boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
    zIndex: 100,
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 10px', borderRadius: 6,
    fontSize: 13, color: 'var(--color-gray-900)',
    cursor: 'pointer', outline: 'none', userSelect: 'none',
  },
  menuItemActive: { background: '#E8E5FF' },
  menuItemText: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  menuItemDate: { fontSize: 11, color: 'var(--color-gray-500)', flexShrink: 0 },
  menuSep:  { height: 1, background: 'var(--color-gray-200)', margin: '4px 0' },
  menuEmpty:{ padding: '10px 12px', fontSize: 13, color: 'var(--color-gray-500)', textAlign: 'center' },

  messages: { flex: 1, overflowY: 'auto', padding: '24px 28px 12px', display: 'flex', flexDirection: 'column', gap: 28 },
  msgBlock: { display: 'flex', flexDirection: 'column', gap: 12 },

  userRow:   { display: 'flex', justifyContent: 'flex-end' },
  userBubble:{
    maxWidth: '72%', background: '#E8E5FF',
    borderRadius: '16px 16px 4px 16px',
    padding: '10px 14px', fontSize: 14,
    lineHeight: 1.55, color: 'var(--color-gray-900)',
    wordBreak: 'break-word',
  },

  aiRow:    { display: 'flex', gap: 10, alignItems: 'flex-start' },
  aiAvatar: {
    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
    background: AI_GRADIENT,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  aiContent: { flex: 1, fontSize: 14, lineHeight: 1.8, color: 'var(--color-gray-900)', wordBreak: 'break-word', minHeight: 24 },

  streaming: {},
  dot:     { display: 'inline-block', width: 8, height: 8, background: 'var(--color-primary)', borderRadius: '50%' },

  sources:      { marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  sourcesLabel: { fontSize: 11, fontWeight: 500, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.6px' },
  sourceCards:  { display: 'flex', flexWrap: 'wrap', gap: 6 },
  sourceCard: {
    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 7,
    padding: '6px 10px', borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'transparent',
    textDecoration: 'none', cursor: 'pointer',
    maxWidth: 220, transition: 'background 0.12s, border-color 0.12s',
  },
  sourceTitle: { fontSize: 12, fontWeight: 500, color: 'var(--color-gray-900)', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

  inputArea: { padding: '14px 20px 20px', borderTop: '1px solid rgba(216, 217, 224, 0.5)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  saveNoteBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    marginTop: 10,
    padding: '5px 10px', borderRadius: 6,
    border: '1px solid var(--color-border)',
    background: 'transparent', cursor: 'pointer',
    fontSize: 12, fontWeight: 500, color: '#694AC6',
    fontFamily: 'var(--font-family)',
    transition: 'background 0.12s, color 0.12s',
  },
  saveNoteBtnDone: {
    background: '#E8E5FF', borderColor: '#BEB5FC',
    color: '#3D1F8A', cursor: 'default',
  },
  inputWrapper: {
    position: 'relative',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    background: 'var(--color-white)',
  },
  textarea: {
    width: '100%', border: 'none', borderRadius: 0,
    padding: '12px 48px 12px 14px',
    fontFamily: 'var(--font-family)', fontSize: 14,
    resize: 'none', outline: 'none',
    color: 'var(--color-gray-900)',
    background: 'transparent',
    lineHeight: 1.5,
  },
  sendBtn: {
    position: 'absolute', bottom: 10, right: 10,
    width: 28, height: 28, borderRadius: '50%',
    border: 'none', cursor: 'not-allowed',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--color-gray-200)',
    color: 'var(--color-gray-500)',
    transition: 'opacity 0.15s',
    flexShrink: 0,
  },
  sendBtnActive: {
    background: AI_GRADIENT,
    color: '#fff',
    cursor: 'pointer',
  },
}
