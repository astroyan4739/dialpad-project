import { useState } from 'react'
import * as HoverCard from '@radix-ui/react-hover-card'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  ExternalLinkIcon,
  DotsHorizontalIcon,
  BookmarkIcon,
  Link2Icon,
  Pencil1Icon,
  TrashIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckIcon,
} from '@radix-ui/react-icons'
import { tagPalette } from '../lib/kb'

const iconContainer = {
  width: 20, height: 20, borderRadius: 5,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}

function SourceIcon({ url }) {
  const domain = (() => {
    try { return new URL(url || '').hostname.replace('www.', '') } catch { return '' }
  })()

  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    return (
      <div style={{ ...iconContainer, background: '#FF0000' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M19.615 3.184C18.65 2.9 12 2.9 12 2.9s-6.65 0-7.615.284A2.45 2.45 0 0 0 2.659 4.92C2.4 5.938 2.4 12 2.4 12s0 6.062.259 7.08a2.45 2.45 0 0 0 1.726 1.736C5.35 21.1 12 21.1 12 21.1s6.65 0 7.615-.284a2.45 2.45 0 0 0 1.726-1.736C21.6 18.062 21.6 12 21.6 12s0-6.062-.259-7.08a2.45 2.45 0 0 0-1.726-1.736zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" fill="white"/>
        </svg>
      </div>
    )
  }

  if (domain.includes('x.com') || domain.includes('twitter.com')) {
    return (
      <div style={{ ...iconContainer, background: '#000000' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white"/>
        </svg>
      </div>
    )
  }

  if (domain.includes('openai.com')) {
    return (
      <div style={{ ...iconContainer, background: '#000000' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M22.282 10.921a5.6 5.6 0 0 0-.479-4.614 5.655 5.655 0 0 0-6.084-2.715 5.6 5.6 0 0 0-4.218-1.882 5.655 5.655 0 0 0-5.394 3.918 5.6 5.6 0 0 0-3.736 2.717 5.655 5.655 0 0 0 .694 6.627 5.6 5.6 0 0 0 .48 4.614 5.655 5.655 0 0 0 6.083 2.715 5.6 5.6 0 0 0 4.218 1.882 5.655 5.655 0 0 0 5.395-3.92 5.6 5.6 0 0 0 3.735-2.716 5.655 5.655 0 0 0-.694-6.626ZM13.502 21.3a4.189 4.189 0 0 1-2.692-.975l.132-.075 4.474-2.583a.737.737 0 0 0 .372-.641v-6.31l1.892 1.091a.069.069 0 0 1 .037.052v5.227a4.2 4.2 0 0 1-4.215 4.214Zm-9.06-3.866a4.19 4.19 0 0 1-.502-2.823l.133.08 4.474 2.583a.736.736 0 0 0 .742 0l5.462-3.153v2.183a.07.07 0 0 1-.026.055l-4.52 2.61a4.2 4.2 0 0 1-5.762-1.535ZM3.37 9.154a4.189 4.189 0 0 1 2.19-1.841v5.313a.737.737 0 0 0 .372.641l5.462 3.153-1.892 1.091a.069.069 0 0 1-.065.007L4.92 14.9a4.2 4.2 0 0 1-1.551-5.745Zm15.558 3.605-5.462-3.153 1.892-1.09a.069.069 0 0 1 .065-.008l4.516 2.608a4.2 4.2 0 0 1-.649 7.575v-5.313a.736.736 0 0 0-.362-.619Zm1.882-2.835-.133-.08-4.474-2.582a.737.737 0 0 0-.742 0L10 10.415V8.232a.07.07 0 0 1 .027-.055l4.516-2.607a4.2 4.2 0 0 1 6.267 4.354ZM8.888 13.17l-1.892-1.09a.069.069 0 0 1-.037-.053V6.8a4.2 4.2 0 0 1 6.89-3.223l-.133.075-4.474 2.583a.737.737 0 0 0-.372.641l-.002 6.294Zm1.027-2.215 2.43-1.403 2.43 1.402v2.806l-2.43 1.402-2.43-1.402V10.955Z" fill="white"/>
        </svg>
      </div>
    )
  }

  // Fallback — generic globe icon
  return (
    <div style={{ ...iconContainer, background: 'var(--color-gray-100)' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="var(--color-gray-400)" strokeWidth="1.5"/>
        <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" stroke="var(--color-gray-400)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function TagsSubContent({ item, allTags, onUpdateTags }) {
  const [search, setSearch] = useState('')
  const itemTags = item.tags || []
  const filtered = allTags.filter(t => t.toLowerCase().includes(search.toLowerCase()))
  const canCreate = search.trim() && !allTags.some(t => t.toLowerCase() === search.trim().toLowerCase())

  function toggleTag(tag) {
    const next = itemTags.includes(tag) ? itemTags.filter(t => t !== tag) : [...itemTags, tag]
    onUpdateTags(item.id, next)
  }

  function createTag() {
    const tag = search.trim()
    if (!tag) return
    onUpdateTags(item.id, [...itemTags, tag])
    setSearch('')
  }

  return (
    <DropdownMenu.SubContent style={styles.menu} sideOffset={8}>
      <div style={styles.tagSearchWrap}>
        <input
          style={styles.tagSearchInput}
          placeholder="Search or create tag…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && canCreate) createTag() }}
          autoFocus
        />
      </div>
      <div style={styles.menuSep}/>
      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
        {filtered.map(tag => {
          const checked = itemTags.includes(tag)
          return (
            <DropdownMenu.Item
              key={tag}
              style={styles.menuItem}
              onSelect={e => { e.preventDefault(); toggleTag(tag) }}
            >
              <span style={{
                width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                border: checked ? 'none' : '1.5px solid var(--color-gray-300)',
                background: checked ? 'var(--color-primary)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {checked && <CheckIcon width={9} height={9} color="white"/>}
              </span>
              {tag}
            </DropdownMenu.Item>
          )
        })}
        {canCreate && (
          <DropdownMenu.Item style={styles.menuItem} onSelect={e => { e.preventDefault(); createTag() }}>
            <PlusIcon width={13} height={13}/>
            Create "{search.trim()}"
          </DropdownMenu.Item>
        )}
      </div>
    </DropdownMenu.SubContent>
  )
}

export default function ItemRow({ item, onDelete, allTags = [], onUpdateTags, onEditItem }) {
  const [hovered, setHovered]       = useState(false)
  const [hoverOpen, setHoverOpen]   = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const isQA = item.type === 'qa'

  const summaryText = item.type === 'qa'
    ? item.answer || item.summary
    : item.summary

  return (
    <HoverCard.Root
      open={menuOpen ? false : hoverOpen}
      onOpenChange={open => !menuOpen && setHoverOpen(open)}
      openDelay={120}
      closeDelay={200}
    >

      <HoverCard.Trigger asChild>
        <div
          style={{ ...styles.row, ...(hovered ? styles.rowHovered : {}) }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="item-row"
        >
          <SourceIcon url={item.url} />
          <span style={styles.title}>{item.title}</span>
          {isQA && <span style={styles.qaBadge}>Q&amp;A</span>}
          <div style={styles.actions}>
            {/* External link */}
            {item.url && (
              <button
                style={{ ...styles.actionBtn, ...(hoveredBtn === 'link' ? styles.actionBtnHovered : {}) }}
                title="Open in new tab"
                onClick={e => { e.stopPropagation(); window.open(item.url, '_blank') }}
                onMouseEnter={() => setHoveredBtn('link')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <ExternalLinkIcon width={13} height={13}/>
              </button>
            )}

            {/* More menu */}
            <DropdownMenu.Root modal={false} onOpenChange={setMenuOpen}>
              <DropdownMenu.Trigger asChild>
                <button
                  style={{ ...styles.actionBtn, ...(hoveredBtn === 'more' || menuOpen ? styles.actionBtnHovered : {}) }}
                  title="More"
                  onClick={e => e.stopPropagation()}
                  onMouseEnter={() => setHoveredBtn('more')}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  <DotsHorizontalIcon width={13} height={13}/>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content side="bottom" align="end" sideOffset={4} style={styles.menu}>

                  {/* Tags */}
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger style={styles.menuItem}>
                      <BookmarkIcon width={13} height={13}/>
                      Tags
                      <ChevronRightIcon width={11} height={11} style={{ marginLeft: 'auto' }}/>
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <TagsSubContent item={item} allTags={allTags} onUpdateTags={onUpdateTags} />
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>

                  <DropdownMenu.Separator style={styles.menuSep}/>

                  {/* Copy link */}
                  <DropdownMenu.Item
                    style={styles.menuItem}
                    onSelect={() => item.url && navigator.clipboard.writeText(item.url)}
                  >
                    <Link2Icon width={13} height={13}/>
                    Copy link
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator style={styles.menuSep}/>

                  {/* Edit */}
                  <DropdownMenu.Item style={styles.menuItem} onSelect={() => onEditItem(item)}>
                    <Pencil1Icon width={13} height={13}/>
                    Edit
                  </DropdownMenu.Item>

                  {/* Delete */}
                  <DropdownMenu.Item
                    style={{ ...styles.menuItem, color: '#E53E3E' }}
                    onSelect={() => onDelete(item.id)}
                  >
                    <TrashIcon width={13} height={13}/>
                    Delete
                  </DropdownMenu.Item>

                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="bottom"
          sideOffset={4}
          align="end"
          alignOffset={24}
          style={styles.popover}
        >
          <h3 style={styles.popTitle}>{item.title}</h3>
          <div style={styles.tags}>
            {(item.tags || []).map(tag => {
              if (tag === 'Q&A') return (
                <span key={tag} style={{ ...styles.pill, background: 'var(--color-primary)', color: '#fff' }}>Q&amp;A</span>
              )
              const { bg, color } = tagPalette(tag)
              return <span key={tag} style={{ ...styles.pill, background: bg, color }}>{tag}</span>
            })}
          </div>
          <p style={styles.summary}>{summaryText || 'No summary available.'}</p>
        </HoverCard.Content>
      </HoverCard.Portal>

    </HoverCard.Root>
  )
}

const styles = {
  row: {
    display: 'flex', alignItems: 'center',
    padding: '10px 20px', gap: 12,
    transition: 'background 0.1s ease',
    position: 'relative',
    cursor: 'default',
  },
  rowHovered: { background: 'var(--color-gray-50)' },
  title: {
    flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--color-gray-900)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  qaBadge: {
    fontSize: 10, padding: '2px 6px', borderRadius: 3,
    background: 'var(--color-primary-light)', color: 'var(--color-primary)',
    flexShrink: 0, fontWeight: 500,
  },
  actions: { display: 'flex', gap: 4, flexShrink: 0 },
  actionBtn: {
    width: 24, height: 24, border: 'none', background: 'none',
    borderRadius: 4, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-gray-500)', transition: 'background 0.12s, color 0.12s',
  },
  actionBtnHovered: {
    background: 'var(--color-gray-100)',
    color: 'var(--color-gray-900)',
  },
  menu: {
    minWidth: 180,
    background: 'var(--color-white)',
    borderRadius: 10,
    padding: '4px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
    zIndex: 100,
  },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '7px 10px', borderRadius: 6,
    fontSize: 13, color: 'var(--color-gray-700)',
    cursor: 'pointer', outline: 'none',
    userSelect: 'none',
  },
  menuSep: { height: 1, background: 'var(--color-gray-100)', margin: '4px 0' },
  menuEmpty: { padding: '6px 10px', fontSize: 12, color: 'var(--color-gray-400)' },
  tagSearchWrap: { padding: '6px 8px' },
  tagSearchInput: {
    width: '100%', border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, color: 'var(--color-gray-900)',
    fontFamily: 'var(--font-family)',
    '::placeholder': { color: 'var(--color-gray-400)' },
  },

  /* Popover */
  popover: {
    width: 260,
    background: 'var(--color-white)',
    borderRadius: 12,
    padding: '16px 24px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)',
    zIndex: 50,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  popTitle: { fontSize: 14, fontWeight: 600, color: 'var(--color-gray-900)', lineHeight: 1.45 },
  tags:     { display: 'flex', flexWrap: 'wrap', gap: 4 },
  label:    { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.7px', color: 'var(--color-gray-500)', fontWeight: 600 },
  summary:  { fontSize: 13, color: 'var(--color-gray-500)', lineHeight: 1.65 },
  pill:     { fontSize: 11, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', fontWeight: 500 },
}
