import { useState } from 'react'
import { callClaude, extractJSON } from '../lib/claude'
import { addItem } from '../lib/kb'

export default function AddResourceModal({ onClose, onSave, initialText = '' }) {
  const [text, setText]     = useState(initialText)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const system = `You are a design knowledge assistant. The user will paste text, a URL, or a note. Your job is ALWAYS to return valid JSON — never refuse, never explain. If given a URL you cannot visit, infer the title and topic from the URL path and domain. Respond ONLY with this JSON shape: {"title": "", "summary": "", "tags": ["tag1", "tag2", "tag3"]}. Rules: title is concise (≤8 words), summary is 1–2 sentences, tags is exactly 3 lowercase strings. No markdown, no code fences, no explanation — just the raw JSON object.`
      const parsed = extractJSON(await callClaude(system, text))
      onSave(parsed.title, parsed.summary, parsed.tags, text)
      onClose()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={styles.title}>Add Resource</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <p style={styles.hint}>Pro tip: Press <kbd style={styles.kbd}>⌘V</kbd> anywhere on the page to save a link.</p>
        <textarea
          autoFocus
          style={styles.textarea}
          rows={5}
          placeholder="Save a link…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div style={styles.footer}>
          <span style={styles.error}>{error}</span>
          <button
            style={{ ...styles.saveBtn, ...(loading ? styles.saveBtnDisabled : {}) }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:   { background: 'var(--color-white)', borderRadius: 'var(--radius-card)', padding: 24, width: 480, maxWidth: '90vw', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:   { fontSize: 15, fontWeight: 600, color: 'var(--color-gray-900)' },
  closeBtn:{ width: 28, height: 28, border: 'none', background: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  textarea:{ width: '100%', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-component)', padding: '10px 12px', fontFamily: 'var(--font-family)', fontSize: 14, resize: 'none', outline: 'none', color: 'var(--color-gray-900)' },
  footer:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 12, color: 'var(--color-gray-400)', margin: '-6px 0' },
  kbd:  { fontFamily: 'inherit', background: 'var(--color-gray-100)', borderRadius: 4, padding: '1px 5px', fontSize: 11 },
  error:   { fontSize: 12, color: '#DC2626' },
  saveBtn: { background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-component)', padding: '8px 20px', fontFamily: 'var(--font-family)', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  saveBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
}
