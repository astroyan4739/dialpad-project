import { useState, useEffect, useRef } from 'react'
import { Agentation } from 'agentation'
import NavRail from './components/NavRail'
import ListPane from './components/ListPane'
import ChatPane from './components/ChatPane'
import AddResourceModal from './components/AddResourceModal'
import EditItemModal from './components/EditItemModal'
import NoteDetailPane from './components/NoteDetailPane'
import { getKB, saveKB, addItem, deleteItem, SEED_ITEMS, extractUrl } from './lib/kb'
import { callClaude, extractJSON, fetchPageMeta } from './lib/claude'

export default function App() {
  const [kb, setKB]                     = useState([])
  const [currentView, setCurrentView]   = useState('inbox')
  const [searchQuery, setSearchQuery]   = useState('')
  const [modalOpen, setModalOpen]       = useState(false)
  const [editItem, setEditItem]         = useState(null)
  const [detailItem, setDetailItem]     = useState(null)
  const [selectedTag, setSelectedTag]   = useState(null)
  const [toast, setToast]               = useState(null) // { msg, type: 'saving'|'done'|'error' }
  const toastTimer                      = useRef(null)
  const kbRef                           = useRef(kb)
  const saveRef                         = useRef(null)
  kbRef.current = kb

  /* Load KB on mount */
  useEffect(() => {
    const stored = getKB()
    if (stored.length === 0) {
      saveKB(SEED_ITEMS)
      setKB(SEED_ITEMS)
    } else {
      setKB(stored)
    }
  }, [])

  function showToast(msg, type = 'saving') {
    clearTimeout(toastTimer.current)
    setToast({ msg, type })
    if (type !== 'saving') {
      toastTimer.current = setTimeout(() => setToast(null), 2500)
    }
  }

  saveRef.current = saveFromClipboard
  async function saveFromClipboard(text) {
    if (!text?.trim()) return
    showToast('Saving…', 'saving')
    try {
      const url  = extractUrl(text)
      const meta = url ? await fetchPageMeta(url) : null

      const userMsg = meta
        ? `URL: ${url}\nTitle: ${meta.title}\nDescription: ${meta.desc}`
        : text

      const system = `You are a design knowledge assistant. The user will paste text, a URL, or a note — sometimes with extracted page title and description. Your job is ALWAYS to return valid JSON — never refuse, never explain. Respond ONLY with this JSON shape: {"title": "", "summary": "", "tags": ["tag1", "tag2", "tag3"]}. Rules: title is concise (≤8 words), summary is 1–2 sentences, tags is exactly 3 lowercase strings. No markdown, no code fences, no explanation — just the raw JSON object.`
      const parsed  = extractJSON(await callClaude(system, userMsg))
      const updated = addItem(kbRef.current, { type: 'resource', title: parsed.title, summary: parsed.summary, tags: parsed.tags, url, content: text, creatorId: 'u1' })
      setKB(updated)
      showToast('Saved to inbox', 'done')
    } catch {
      showToast('Failed to save', 'error')
    }
  }

  /* Keyboard shortcuts */
  useEffect(() => {
    function onKey(e) {
      if (e.key === '/' && !e.target.matches('textarea, input')) {
        e.preventDefault()
        switchView('search')
      }
      if (e.key === 'Escape') setModalOpen(false)
    }
    function onPaste(e) {
      if (e.target.matches('textarea, input')) return
      const text = e.clipboardData?.getData('text')
      if (text?.trim()) { e.preventDefault(); saveRef.current(text) }
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('paste', onPaste)
    }
  }, [])

  function switchView(view) {
    setCurrentView(view)
    setSearchQuery('')
    setSelectedTag(null)
  }

  function handleTagSelect(tag) {
    setCurrentView('tag')
    setSelectedTag(tag)
    setSearchQuery('')
  }

  function handleDelete(id) {
    const updated = deleteItem(kb, id)
    setKB(updated)
  }

  function handleArchive(id) {
    const updated = kb.map(i => i.id === id ? { ...i, archived: !i.archived } : i)
    saveKB(updated)
    setKB(updated)
  }

  function handleEditSave(id, title, summary) {
    const updated = kb.map(i => i.id === id ? { ...i, title, summary } : i)
    saveKB(updated)
    setKB(updated)
  }

  function handleUpdateTags(id, newTags) {
    const updated = kb.map(i => i.id === id ? { ...i, tags: newTags } : i)
    saveKB(updated)
    setKB(updated)
  }

  function handleSaveResource(title, summary, tags, content) {
    const updated = addItem(kb, { type: 'resource', title, summary, tags, url: extractUrl(content), content, creatorId: 'u1' })
    setKB(updated)
    switchView('inbox')
  }

  const tags = [...new Set(kb.flatMap(i => i.tags || []))].filter(t => t !== 'Q&A')
  const tagCounts = Object.fromEntries(
    tags.map(t => [t, kb.filter(i => (i.tags || []).includes(t)).length])
  )

  const isListView = currentView === 'inbox' || currentView === 'search' || currentView === 'tag' || currentView === 'archive'

  return (
    <>
      <NavRail
        currentView={currentView}
        onViewChange={switchView}
        itemCount={kb.filter(i => !i.archived && i.type !== 'qa').length}
        tags={tags}
        tagCounts={tagCounts}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
      />

      <div style={styles.contentArea}>
        {isListView && !detailItem && (
          <ListPane
            currentView={currentView}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            items={kb}
            onDelete={handleDelete}
            onOpenModal={() => setModalOpen(true)}
            selectedTag={selectedTag}
            allTags={tags}
            onUpdateTags={handleUpdateTags}
            onEditItem={setEditItem}
            onOpenDetail={setDetailItem}
            onArchive={handleArchive}
          />
        )}
        {isListView && detailItem && (
          <NoteDetailPane item={detailItem} onBack={() => setDetailItem(null)} />
        )}
        {currentView === 'chat' && (
          <ChatPane kb={kb} onKBChange={setKB} />
        )}

        {/* Toast */}
        {toast && (
          <div style={{ ...styles.toast, ...(toast.type === 'error' ? styles.toastError : toast.type === 'done' ? styles.toastDone : {}) }}>
            {toast.type === 'saving' && <span style={styles.toastSpinner}/>}
            {toast.msg}
          </div>
        )}
      </div>

      {modalOpen && (
        <AddResourceModal
          onClose={() => setModalOpen(false)}
          onSave={handleSaveResource}
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleEditSave}
        />
      )}

      {import.meta.env.DEV && <Agentation />}
    </>
  )
}

const styles = {
  contentArea: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    border: '1px solid rgba(216, 217, 224, 0.5)',
    borderRadius: 16,
    position: 'relative',
    boxShadow: '0 4px 20px 0 rgba(180, 160, 255, 0.18), 0 1px 4px 0 rgba(180, 160, 255, 0.10)',
  },
  toast: {
    position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    background: 'var(--color-gray-900)', color: '#fff',
    padding: '10px 18px', borderRadius: 10,
    fontSize: 13, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    zIndex: 300, pointerEvents: 'none',
  },
  toastDone:  { background: '#16A34A' },
  toastError: { background: '#DC2626' },
  toastSpinner: {
    width: 12, height: 12, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite',
    flexShrink: 0,
  },
}
