import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'

export default function EditItemModal({ item, onClose, onSave }) {
  const [title,   setTitle]   = useState(item.title   || '')
  const [summary, setSummary] = useState(item.summary || '')

  function handleSave() {
    if (!title.trim()) return
    onSave(item.id, title.trim(), summary.trim())
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={styles.modal}>

        {/* Header — always visible */}
        <div style={styles.header}>
          <h3 style={styles.heading}>Edit link</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            <Cross2Icon width={14} height={14}/>
          </button>
        </div>

        {/* Scrollable fields */}
        <div style={styles.body}>
          <div style={styles.field}>
            <label style={styles.label}>Title</label>
            <input
              autoFocus
              style={styles.input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Summary</label>
            <textarea
              style={styles.textarea}
              rows={4}
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </div>
        </div>

        {/* Footer — always visible */}
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleSave}>Save</button>
        </div>

      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.30)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200,
  },
  modal: {
    background: 'var(--color-white)',
    borderRadius: 16,
    width: 480, maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '24px 28px 0',
    flexShrink: 0,
  },
  heading: { fontSize: 18, fontWeight: 600, color: 'var(--color-gray-900)' },
  closeBtn: {
    width: 28, height: 28, border: 'none', background: 'none',
    borderRadius: 6, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-gray-400)',
  },
  body: {
    flex: 1, overflowY: 'auto',
    padding: '20px 28px',
    display: 'flex', flexDirection: 'column', gap: 20,
  },
  field:    { display: 'flex', flexDirection: 'column', gap: 8 },
  label:    { fontSize: 13, fontWeight: 500, color: 'var(--color-gray-700)' },
  input: {
    border: '1.5px solid var(--color-primary)',
    borderRadius: 'var(--radius-component)',
    padding: '10px 14px',
    fontSize: 14, fontFamily: 'var(--font-family)',
    color: 'var(--color-gray-900)', outline: 'none',
    background: 'var(--color-white)',
  },
  textarea: {
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-component)',
    padding: '10px 14px',
    fontSize: 14, fontFamily: 'var(--font-family)',
    color: 'var(--color-gray-900)', outline: 'none',
    resize: 'vertical', lineHeight: 1.6,
    background: 'var(--color-white)',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: 10,
    padding: '16px 28px 24px',
    flexShrink: 0,
    borderTop: '1px solid var(--color-gray-100)',
  },
  cancelBtn: {
    padding: '8px 20px', borderRadius: 'var(--radius-component)',
    border: '1px solid var(--color-gray-200)', background: 'var(--color-white)',
    fontSize: 14, fontFamily: 'var(--font-family)',
    color: 'var(--color-gray-700)', cursor: 'pointer',
  },
  saveBtn: {
    padding: '8px 20px', borderRadius: 'var(--radius-component)',
    border: 'none', background: 'var(--color-primary)',
    fontSize: 14, fontFamily: 'var(--font-family)',
    color: '#fff', fontWeight: 500, cursor: 'pointer',
  },
}
