import { useState, useEffect } from 'react'
import { Agentation } from 'agentation'
import NavRail from './components/NavRail'
import ListPane from './components/ListPane'
import ChatPane from './components/ChatPane'
import AddResourceModal from './components/AddResourceModal'
import EditItemModal from './components/EditItemModal'
import { getKB, saveKB, addItem, deleteItem, SEED_ITEMS } from './lib/kb'

export default function App() {
  const [kb, setKB]                     = useState([])
  const [currentView, setCurrentView]   = useState('inbox')
  const [searchQuery, setSearchQuery]   = useState('')
  const [modalOpen, setModalOpen]       = useState(false)
  const [modalText, setModalText]       = useState('')
  const [editItem, setEditItem]         = useState(null)
  const [selectedTag, setSelectedTag]   = useState(null)

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

  /* "/" shortcut → search view */
  useEffect(() => {
    function onKey(e) {
      if (e.key === '/' && !e.target.matches('textarea, input')) {
        e.preventDefault()
        switchView('search')
      }
      if (e.key === 'Escape') setModalOpen(false)
      if (e.key === 'v' && (e.metaKey || e.ctrlKey) && !e.target.matches('textarea, input')) {
        e.preventDefault()
        navigator.clipboard.readText().then(text => {
          setModalText(text)
          setModalOpen(true)
        }).catch(() => {
          setModalText('')
          setModalOpen(true)
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
    const updated = addItem(kb, { type: 'resource', title, summary, tags, content })
    setKB(updated)
    switchView('inbox')
  }

  const tags = [...new Set(kb.flatMap(i => i.tags || []))]
  const tagCounts = Object.fromEntries(
    tags.map(t => [t, kb.filter(i => (i.tags || []).includes(t)).length])
  )

  const isListView = currentView === 'inbox' || currentView === 'search' || currentView === 'tag'

  return (
    <>
      <NavRail
        currentView={currentView}
        onViewChange={switchView}
        itemCount={kb.length}
        tags={tags}
        tagCounts={tagCounts}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
      />

      <div style={styles.contentArea}>
        {isListView && (
          <ListPane
            currentView={currentView}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            items={kb}
            onDelete={handleDelete}
            onOpenModal={() => { setModalText(''); setModalOpen(true) }}
            selectedTag={selectedTag}
            allTags={tags}
            onUpdateTags={handleUpdateTags}
            onEditItem={setEditItem}
          />
        )}
        {currentView === 'chat' && (
          <ChatPane kb={kb} onKBChange={setKB} />
        )}
      </div>

      {modalOpen && (
        <AddResourceModal
          onClose={() => setModalOpen(false)}
          onSave={handleSaveResource}
          initialText={modalText}
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
    border: '1px solid var(--color-gray-200)',
    borderRadius: 16,
  },
}
