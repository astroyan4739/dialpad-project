import { useState, useRef } from 'react'
import { callClaudeStream } from '../lib/claude'
import { addItem } from '../lib/kb'

export default function ChatPane({ kb, onKBChange }) {
  const [question, setQuestion]   = useState('')
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [saved, setSaved]         = useState(false)
  const messagesEndRef             = useRef(null)

  async function handleAsk() {
    if (!question.trim() || loading) return

    const q       = question.trim()
    const context = kb.map(i =>
      `Title: ${i.title}\nSummary: ${i.summary}\nTags: ${i.tags.join(', ')}`
    ).join('\n\n---\n\n')

    const system = `You are a design knowledge assistant for a product design team. You have access to the team's shared knowledge base. Answer the designer's question using the knowledge base context. Be specific, practical, and reference relevant resources when helpful. Knowledge base:\n\n${context}`

    const msgId = Date.now()
    setMessages(prev => [...prev, { id: msgId, q, answer: '', streaming: true }])
    setQuestion('')
    setLoading(true)
    setSaved(false)

    let fullAnswer = ''
    try {
      await callClaudeStream(system, q,
        chunk => {
          fullAnswer += chunk
          setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, answer: fullAnswer } : m
          ))
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        },
        () => {
          setMessages(prev => prev.map(m =>
            m.id === msgId ? { ...m, streaming: false } : m
          ))
          const updated = addItem(kb, {
            type: 'qa', title: q.slice(0, 60),
            summary: fullAnswer.slice(0, 200),
            answer: fullAnswer, question: q, tags: ['Q&A'],
          })
          onKBChange(updated)
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
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

  return (
    <div style={styles.pane}>
      <div style={styles.header}>
        <h2 style={styles.title}>Chat</h2>
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <p style={styles.hint}>Ask a design question — I'll search the knowledge base and synthesise an answer.</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} style={styles.msgBlock}>
            <p style={styles.q}>{msg.q}</p>
            <div style={{ ...styles.answer, ...(msg.streaming ? styles.streaming : {}) }}>
              {msg.answer || <span style={styles.dot} />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <textarea
          style={styles.textarea}
          rows={3}
          placeholder="What design patterns work best for onboarding flows?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk() }}
        />
        <div style={styles.controls}>
          {saved ? <span style={styles.savedConfirm}>✓ Saved to knowledge base</span> : <span />}
          <button
            style={{ ...styles.askBtn, ...(loading ? styles.askBtnDisabled : {}) }}
            onClick={handleAsk}
            disabled={loading}
          >
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  pane:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:  { height: 52, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--color-gray-200)', flexShrink: 0 },
  title:   { fontSize: 16, fontWeight: 600, color: 'var(--color-gray-900)' },
  messages:{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  hint:    { fontSize: 13, color: 'var(--color-gray-500)', lineHeight: 1.5, padding: 12, background: 'var(--color-gray-50)', borderRadius: 'var(--radius-component)', border: '1px solid var(--color-gray-200)' },
  msgBlock:{ display: 'flex', flexDirection: 'column', gap: 6 },
  q:       { fontSize: 13, fontWeight: 500, color: 'var(--color-gray-900)' },
  answer:  { background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-component)', padding: 14, fontSize: 13, lineHeight: 1.65, color: 'var(--color-gray-900)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', minHeight: 40 },
  streaming: {},
  dot:     { display: 'inline-block', width: 8, height: 8, background: 'var(--color-primary)', borderRadius: '50%' },
  inputArea:{ padding: '14px 20px', borderTop: '1px solid var(--color-gray-200)', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 },
  textarea: { width: '100%', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-component)', padding: '10px 12px', fontFamily: 'var(--font-family)', fontSize: 14, resize: 'none', outline: 'none', color: 'var(--color-gray-900)', transition: 'border-color 0.15s, box-shadow 0.15s' },
  controls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  savedConfirm: { fontSize: 12, color: '#16A34A' },
  askBtn:   { background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-component)', padding: '8px 20px', fontFamily: 'var(--font-family)', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s, transform 0.1s, opacity 0.15s' },
  askBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
}
