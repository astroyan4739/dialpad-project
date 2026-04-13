import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  EnvelopeOpenIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'
import { tagPalette } from '../lib/kb'

const AI_GRADIENT = 'linear-gradient(135deg, #7C3AED 0%, #C026D3 50%, #F97316 100%)'

const AiChatIcon = () => (
  <div style={{
    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
    background: AI_GRADIENT,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <ChatBubbleIcon width={11} height={11} color="white"/>
  </div>
)

const ArchiveNavIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1.5" y="1.5" width="12" height="3" rx="0.6" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M2.5 4.5V12a1 1 0 001 1h8a1 1 0 001-1V4.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5.5 7.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const NAV_ITEMS = [
  { view: 'search',  label: 'Search',  hint: '/', icon: <MagnifyingGlassIcon width={15} height={15}/> },
  { view: 'inbox',   label: 'Inbox',              icon: <EnvelopeOpenIcon    width={15} height={15}/> },
  { view: 'archive', label: 'Archive',             icon: <ArchiveNavIcon /> },
  { view: 'chat',    label: 'AI Chat', ai: true,  icon: <AiChatIcon /> },
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
        <span style={styles.logoText}>Knowledge Hub</span>
      </div>

      <ul style={styles.items}>
        {NAV_ITEMS.map(({ view, label, hint, icon, ai }) => {
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
              {ai ? (
                <span style={styles.aiLabel}>{label}</span>
              ) : label}
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
  logoText: { fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' },
  items: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 },
  item: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px',
    borderRadius: 'var(--radius-component)',
    cursor: 'pointer',
    fontSize: 14,
    color: '#694AC6',
    userSelect: 'none',
    transition: 'background 0.12s ease, color 0.12s ease',
  },
  itemActive:  { background: '#E8E5FF', color: '#3D1F8A', fontWeight: 500 },
  itemHovered: { background: '#E8E5FF', color: '#3D1F8A' },
  hint:  { marginLeft: 'auto', fontSize: 10, color: '#C4AFF5' },
  badge: { marginLeft: 'auto', fontSize: 11, color: '#694AC6', fontWeight: 500 },
  tagsSection: { marginTop: 24, padding: '0 8px' },
  tagsLabel: {
    display: 'flex', alignItems: 'center',
    fontSize: 13, fontWeight: 400, color: '#694AC6',
    marginBottom: 6, padding: '0 2px',
    cursor: 'pointer', userSelect: 'none',
  },
  tagList:     { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 },
  tagItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '5px 6px', borderRadius: 'var(--radius-component)',
    cursor: 'pointer', userSelect: 'none',
  },
  tagItemActive: { background: '#E8E5FF', color: '#3D1F8A' },
  aiLabel: {
    background: AI_GRADIENT,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 500,
  },
  tagHash:  { fontSize: 13, color: '#9B7AE0', fontWeight: 500, flexShrink: 0 },
  tagName:  { fontSize: 13, color: '#694AC6', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  tagCount: { fontSize: 11, color: '#694AC6', flexShrink: 0 },
}
