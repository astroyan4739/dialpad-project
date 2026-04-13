import { tagPalette } from '../lib/kb'

export default function DetailPopover({ item, position }) {
  if (!item) return null

  const summaryText = item.type === 'qa'
    ? item.answer || item.summary
    : item.summary

  return (
    <div style={{ ...styles.popover, top: position.top, left: position.left }}>
      <h3 style={styles.title}>{item.title}</h3>
      <div style={styles.tags}>
        {(item.tags || []).map(tag => {
          if (tag === 'Q&A') return (
            <span key={tag} style={{ ...styles.pill, background: 'var(--color-primary)', color: '#fff' }}>Q&amp;A</span>
          )
          const { bg, color } = tagPalette(tag)
          return <span key={tag} style={{ ...styles.pill, background: bg, color }}>{tag}</span>
        })}
      </div>
      <span style={styles.label}>AI Summary</span>
      <p style={styles.summary}>{summaryText || 'No summary available.'}</p>
    </div>
  )
}

const styles = {
  popover: {
    position: 'fixed',
    width: 260,
    background: 'var(--color-white)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 12,
    padding: '14px 16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)',
    zIndex: 50,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  title:   { fontSize: 14, fontWeight: 600, color: 'var(--color-gray-900)', lineHeight: 1.45 },
  tags:    { display: 'flex', flexWrap: 'wrap', gap: 4 },
  label:   { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--color-gray-500)', fontWeight: 600 },
  summary: { fontSize: 13, color: 'var(--color-gray-500)', lineHeight: 1.65 },
  pill:    { fontSize: 11, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', fontWeight: 500 },
}
