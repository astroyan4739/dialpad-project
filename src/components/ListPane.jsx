import { useState } from 'react'
import ItemRow from './ItemRow'
import { PlusIcon } from '@radix-ui/react-icons'

function getDateGroup(iso) {
  const now = new Date()
  const d   = new Date(iso)
  const todayStart     = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart - 86400000)
  if (d >= todayStart)     return 'Today'
  if (d >= yesterdayStart) return 'Yesterday'
  return 'Older'
}

export default function ListPane({
  currentView, searchQuery, onSearchChange,
  items, onDelete, onOpenModal, selectedTag,
  allTags, onUpdateTags, onEditItem,
}) {
  const [addHovered, setAddHovered] = useState(false)
  const isSearch = currentView === 'search' && searchQuery.trim()
  const isTag    = currentView === 'tag'

  const filtered = isSearch
    ? items.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : isTag
    ? items.filter(i => (i.tags || []).includes(selectedTag))
    : items

  // Group by date (inbox + tag views)
  const grouped = isSearch
    ? [{ label: null, items: filtered }]
    : (() => {
        const order = ['Today', 'Yesterday', 'Older']
        const map = {}
        filtered.forEach(item => {
          const g = getDateGroup(item.createdAt)
          if (!map[g]) map[g] = []
          map[g].push(item)
        })
        return order.filter(l => map[l]).map(l => ({ label: l, items: map[l] }))
      })()

  const title = isTag ? selectedTag : currentView === 'search' ? 'Search' : 'Inbox'

  return (
    <div style={styles.pane}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        {currentView === 'inbox' && (
          <button
            style={{ ...styles.addBtn, ...(addHovered ? styles.addBtnHovered : {}) }}
            title="Add resource"
            onClick={onOpenModal}
            onMouseEnter={() => setAddHovered(true)}
            onMouseLeave={() => setAddHovered(false)}
          ><PlusIcon width={16} height={16}/></button>
        )}
      </div>

      {/* Search bar */}
      {currentView === 'search' && (
        <div style={styles.searchBar}>
          <input
            autoFocus
            style={styles.searchInput}
            type="text"
            placeholder="Search resources…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {/* List */}
      <div style={styles.list}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <svg style={styles.emptyIcon} width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="2"/>
              <path d="M13 20h14M20 13v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h3 style={styles.emptyHeading}>Nothing here yet</h3>
            <p style={styles.emptyText}>Click <strong>+</strong> to add your first design resource.</p>
          </div>
        ) : (
          grouped.map(({ label, items: groupItems }, i) => (
            <div key={label || 'results'} style={{ marginTop: 20 }}>
              {label && <div style={styles.groupLabel}>{label}</div>}
              {groupItems.map(item => (
                <ItemRow key={item.id} item={item} onDelete={onDelete} allTags={allTags} onUpdateTags={onUpdateTags} onEditItem={onEditItem} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles = {
  pane:   { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--color-gray-200)', flexShrink: 0 },
  title:  { fontSize: 16, fontWeight: 400, color: 'var(--color-gray-900)' },
  addBtn: {
    width: 28, height: 28, border: 'none', background: 'none',
    borderRadius: 6, cursor: 'pointer', fontSize: 20,
    color: 'var(--color-gray-500)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', lineHeight: 1,
    transition: 'background 0.12s, color 0.12s',
  },
  addBtnHovered: {
    background: 'var(--color-gray-100)',
    color: 'var(--color-gray-900)',
  },
  searchBar:   { padding: '10px 16px', borderBottom: '1px solid var(--color-gray-200)', flexShrink: 0 },
  searchInput: {
    width: '100%', border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-component)', padding: '8px 12px',
    fontFamily: 'var(--font-family)', fontSize: 14, outline: 'none',
    background: 'var(--color-white)', color: 'var(--color-gray-900)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  list: { flex: 1, overflowY: 'auto' },
  groupLabel: {
    padding: '10px 20px 4px',
    fontSize: 13, fontWeight: 400,
    color: 'var(--color-gray-500)',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', textAlign: 'center', padding: 40,
  },
  emptyIcon:    { color: 'var(--color-gray-300)', marginBottom: 16 },
  emptyHeading: { fontSize: 16, fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 8 },
  emptyText:    { fontSize: 14, color: 'var(--color-gray-500)', lineHeight: 1.5, maxWidth: 220 },
}
