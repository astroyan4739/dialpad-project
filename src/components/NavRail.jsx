import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  EnvelopeOpenIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'
import { tagPalette } from '../lib/kb'

const NAV_ITEMS = [
  { view: 'search', label: 'Search', hint: '/', icon: <MagnifyingGlassIcon width={15} height={15}/> },
  { view: 'inbox',  label: 'Inbox',               icon: <EnvelopeOpenIcon  width={15} height={15}/> },
  { view: 'chat',   label: 'Chat',                icon: <ChatBubbleIcon    width={15} height={15}/> },
]

export default function NavRail({ currentView, onViewChange, itemCount, tags = [], tagCounts = {}, selectedTag, onTagSelect }) {
  const [hoveredView, setHoveredView] = useState(null)
  const [tagsOpen, setTagsOpen] = useState(true)

  return (
    <nav style={styles.rail}>
      <div style={styles.logo}>
        <svg style={styles.logoIcon} width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="1"  y="1"  width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
          <rect x="11" y="1"  width="6" height="6" rx="1.5" fill="currentColor" opacity="0.6"/>
          <rect x="1"  y="11" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.6"/>
          <rect x="11" y="11" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
        </svg>
        <span style={styles.logoText}>DKA</span>
      </div>

      <ul style={styles.items}>
        {NAV_ITEMS.map(({ view, label, hint, icon }) => {
          const active  = currentView === view
          const hovered = hoveredView === view && !active
          return (
            <li
              key={view}
              style={{
                ...styles.item,
                ...(active  ? styles.itemActive  : {}),
                ...(hovered ? styles.itemHovered : {}),
              }}
              onClick={() => onViewChange(view)}
              onMouseEnter={() => setHoveredView(view)}
              onMouseLeave={() => setHoveredView(null)}
            >
              {icon}
              {label}
              {hint && <span style={styles.hint}>{hint}</span>}
              {view === 'inbox' && itemCount > 0 && (
                <span style={styles.badge}>{itemCount}</span>
              )}
            </li>
          )
        })}
      </ul>

      {tags.length > 0 && (
        <div style={styles.tagsSection}>
          <div style={styles.tagsLabel} onClick={() => setTagsOpen(o => !o)}>
            Tags
            {tagsOpen
              ? <ChevronDownIcon  width={12} height={12} style={{ marginLeft: 4 }}/>
              : <ChevronRightIcon width={12} height={12} style={{ marginLeft: 4 }}/>
            }
          </div>
          {tagsOpen && (
            <ul style={styles.tagList}>
              {tags.map(tag => {
                const active = currentView === 'tag' && selectedTag === tag
                return (
                  <li
                    key={tag}
                    style={{ ...styles.tagItem, ...(active ? styles.tagItemActive : {}) }}
                    onClick={() => onTagSelect(tag)}
                  >
                    <span style={styles.tagHash}>#</span>
                    <span style={styles.tagName}>{tag}</span>
                    <span style={styles.tagCount}>{tagCounts[tag]}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </nav>
  )
}

const styles = {
  rail: {
    width: 'var(--nav-width)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '4px 8px 20px',
  },
  logoIcon: { color: 'var(--color-primary)', flexShrink: 0 },
  logoText: { fontSize: 16, fontWeight: 600, color: 'var(--color-primary)' },
  items: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 },
  item: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px',
    borderRadius: 'var(--radius-component)',
    cursor: 'pointer',
    fontSize: 14,
    color: 'var(--color-gray-500)',
    userSelect: 'none',
    transition: 'background 0.12s ease, color 0.12s ease',
  },
  itemActive:  { background: 'var(--color-gray-100)', color: 'var(--color-gray-900)', fontWeight: 500 },
  itemHovered: { background: 'var(--color-gray-200)', color: 'var(--color-gray-900)' },
  hint:  { marginLeft: 'auto', fontSize: 10, color: 'var(--color-gray-300)' },
  badge: { marginLeft: 'auto', fontSize: 11, color: 'var(--color-gray-500)', fontWeight: 500 },
  tagsSection: { marginTop: 24, padding: '0 8px' },
  tagsLabel: {
    display: 'flex', alignItems: 'center',
    fontSize: 13, fontWeight: 400, color: 'var(--color-gray-500)',
    marginBottom: 6, padding: '0 2px',
    cursor: 'pointer', userSelect: 'none',
  },
  tagList:     { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 },
  tagItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '5px 6px', borderRadius: 'var(--radius-component)',
    cursor: 'pointer', userSelect: 'none',
  },
  tagItemActive: { background: 'var(--color-gray-100)', color: 'var(--color-gray-900)' },
  tagHash:  { fontSize: 13, color: 'var(--color-gray-400)', fontWeight: 500, flexShrink: 0 },
  tagName:  { fontSize: 13, color: 'var(--color-gray-500)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tagCount: { fontSize: 11, color: 'var(--color-gray-500)', flexShrink: 0 },
}
