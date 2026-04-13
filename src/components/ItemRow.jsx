import { useState } from 'react'
import * as HoverCard from '@radix-ui/react-hover-card'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import SourceIcon from './SourceIcon'
import {
  ExternalLinkIcon,
  DotsHorizontalIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  Link2Icon,
  Pencil1Icon,
  TrashIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckIcon,
} from '@radix-ui/react-icons'
import { tagPalette, TEAM } from '../lib/kb'


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
                border: checked ? 'none' : '1.5px solid var(--color-border)',
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

function CreatorAvatar({ creatorId, size = 18 }) {
  const creator = TEAM.find(t => t.id === creatorId)
  if (!creator) return null
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: creator.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: size * 0.5, fontWeight: 600, color: '#fff', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{creator.initials[0]}</span>
    </div>
  )
}

export default function ItemRow({ item, onDelete, allTags = [], onUpdateTags, onEditItem, onOpenDetail }) {
  const [hovered, setHovered]       = useState(false)
  const [hoverOpen, setHoverOpen]   = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const isNote = item.type === 'qa'
  const creator = TEAM.find(t => t.id === item.creatorId)

  const summaryText = isNote ? item.answer || item.summary : item.summary

  function handleRowClick() {
    if (isNote) { onOpenDetail?.(item); return }
    if (item.url) window.open(item.url, '_blank')
  }

  return (
    <HoverCard.Root
      open={isNote ? false : (menuOpen ? false : hoverOpen)}
      onOpenChange={open => !isNote && !menuOpen && setHoverOpen(open)}
      openDelay={300}
      closeDelay={0}
    >

      <HoverCard.Trigger asChild>
        <div
          style={{ ...styles.row, ...(hovered ? styles.rowHovered : {}), ...(isNote || item.url ? styles.rowClickable : {}) }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleRowClick}
          className="item-row"
        >
          {isNote
            ? <div style={styles.noteIcon}><BookmarkFilledIcon width={11} height={11} color="white"/></div>
            : <SourceIcon url={item.url} />
          }

          <span style={styles.title}>{item.title}</span>
          {creator && (
            <div style={styles.creatorInline}>
              <CreatorAvatar creatorId={item.creatorId} size={16}/>
              <span style={styles.creatorName}>{creator.name}</span>
            </div>
          )}

          <div style={styles.actions} onClick={e => e.stopPropagation()}>
            {/* External link — only for resource type */}
            {!isNote && item.url && (
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
                      <BookmarkFilledIcon width={13} height={13}/>
                      Tags
                      <ChevronRightIcon width={11} height={11} style={{ marginLeft: 'auto' }}/>
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <TagsSubContent item={item} allTags={allTags} onUpdateTags={onUpdateTags} />
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>

                  {/* Copy link + Edit only for resources — same group as Tags */}
                  {!isNote && <>
                    <DropdownMenu.Item
                      style={styles.menuItem}
                      onSelect={() => item.url && navigator.clipboard.writeText(item.url)}
                    >
                      <Link2Icon width={13} height={13}/>
                      Copy link
                    </DropdownMenu.Item>
                    <DropdownMenu.Item style={styles.menuItem} onSelect={() => onEditItem(item)}>
                      <Pencil1Icon width={13} height={13}/>
                      Edit
                    </DropdownMenu.Item>
                  </>}

                  <DropdownMenu.Separator style={styles.menuSep}/>

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
  rowHovered: { background: '#E8E5FF' },
  rowClickable: { cursor: 'pointer' },
  title: {
    fontSize: 14, fontWeight: 500, color: 'var(--color-gray-900)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    flex: 1,
  },
  creatorInline: { display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 },
  creatorName:   { fontSize: 12, color: 'var(--color-gray-500)', whiteSpace: 'nowrap' },
  noteIcon: {
    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
    background: 'var(--color-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  actions: { display: 'flex', gap: 4, flexShrink: 0 },
  actionBtn: {
    width: 24, height: 24, border: 'none', background: 'none',
    borderRadius: 4, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-gray-500)', transition: 'background 0.12s, color 0.12s',
  },
  actionBtnHovered: {
    background: '#8464EE',
    color: '#fff',
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
  menuSep: { height: '0.5px', background: '#D8D9E0', margin: '4px 0' },
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
