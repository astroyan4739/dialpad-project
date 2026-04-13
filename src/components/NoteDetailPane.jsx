import { ArrowLeftIcon } from '@radix-ui/react-icons'
import ReactMarkdown from 'react-markdown'

const mdComponents = {
  p:      ({ children }) => <p style={{ margin: '0 0 10px', lineHeight: 1.8 }}>{children}</p>,
  ul:     ({ children }) => <ul style={{ margin: '0 0 10px', paddingLeft: 20 }}>{children}</ul>,
  ol:     ({ children }) => <ol style={{ margin: '0 0 10px', paddingLeft: 20 }}>{children}</ol>,
  li:     ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  code:   ({ children }) => <code style={{ background: '#EDE9FF', borderRadius: 4, padding: '1px 5px', fontSize: 12, fontFamily: 'monospace' }}>{children}</code>,
  pre:    ({ children }) => <pre style={{ background: '#EDE9FF', borderRadius: 6, padding: '10px 12px', fontSize: 12, overflowX: 'auto', margin: '0 0 10px' }}>{children}</pre>,
  h1:     ({ children }) => <h1 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>{children}</h1>,
  h2:     ({ children }) => <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>{children}</h2>,
  h3:     ({ children }) => <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>{children}</h3>,
  hr:     () => null,
}

export default function NoteDetailPane({ item, onBack }) {
  return (
    <div style={styles.pane}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          <ArrowLeftIcon width={14} height={14}/>
          Back
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <p style={styles.question}>{item.question || item.title}</p>
        <div style={styles.answer}>
          {item.answer
            ? <ReactMarkdown components={mdComponents}>{item.answer}</ReactMarkdown>
            : <p style={{ color: 'var(--color-gray-500)' }}>{item.summary}</p>
          }
        </div>
      </div>
    </div>
  )
}

const styles = {
  pane:    { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:  { height: 52, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid var(--color-gray-200)', flexShrink: 0 },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, color: '#694AC6',
    fontFamily: 'var(--font-family)', padding: '4px 8px',
    borderRadius: 6, transition: 'background 0.12s',
  },
  content:  { flex: 1, overflowY: 'auto', padding: '28px 32px' },
  question: { fontSize: 16, fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 20, lineHeight: 1.5 },
  answer:   { fontSize: 14, lineHeight: 1.8, color: 'var(--color-gray-900)' },
}
