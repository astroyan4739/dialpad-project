const iconContainer = {
  width: 20, height: 20, borderRadius: 5,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}

export default function SourceIcon({ url, size = 20 }) {
  const container = { ...iconContainer, width: size, height: size }
  const domain = (() => {
    try { return new URL(url || '').hostname.replace('www.', '') } catch { return '' }
  })()

  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    return (
      <div style={{ ...container, background: '#FF0000' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M19.615 3.184C18.65 2.9 12 2.9 12 2.9s-6.65 0-7.615.284A2.45 2.45 0 0 0 2.659 4.92C2.4 5.938 2.4 12 2.4 12s0 6.062.259 7.08a2.45 2.45 0 0 0 1.726 1.736C5.35 21.1 12 21.1 12 21.1s6.65 0 7.615-.284a2.45 2.45 0 0 0 1.726-1.736C21.6 18.062 21.6 12 21.6 12s0-6.062-.259-7.08a2.45 2.45 0 0 0-1.726-1.736zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" fill="white"/>
        </svg>
      </div>
    )
  }

  if (domain.includes('x.com') || domain.includes('twitter.com')) {
    return (
      <div style={{ ...container, background: '#000000' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white"/>
        </svg>
      </div>
    )
  }

  if (domain.includes('openai.com')) {
    return (
      <div style={{ ...container, background: '#000000' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M22.282 10.921a5.6 5.6 0 0 0-.479-4.614 5.655 5.655 0 0 0-6.084-2.715 5.6 5.6 0 0 0-4.218-1.882 5.655 5.655 0 0 0-5.394 3.918 5.6 5.6 0 0 0-3.736 2.717 5.655 5.655 0 0 0 .694 6.627 5.6 5.6 0 0 0 .48 4.614 5.655 5.655 0 0 0 6.083 2.715 5.6 5.6 0 0 0 4.218 1.882 5.655 5.655 0 0 0 5.395-3.92 5.6 5.6 0 0 0 3.735-2.716 5.655 5.655 0 0 0-.694-6.626ZM13.502 21.3a4.189 4.189 0 0 1-2.692-.975l.132-.075 4.474-2.583a.737.737 0 0 0 .372-.641v-6.31l1.892 1.091a.069.069 0 0 1 .037.052v5.227a4.2 4.2 0 0 1-4.215 4.214Zm-9.06-3.866a4.19 4.19 0 0 1-.502-2.823l.133.08 4.474 2.583a.736.736 0 0 0 .742 0l5.462-3.153v2.183a.07.07 0 0 1-.026.055l-4.52 2.61a4.2 4.2 0 0 1-5.762-1.535ZM3.37 9.154a4.189 4.189 0 0 1 2.19-1.841v5.313a.737.737 0 0 0 .372.641l5.462 3.153-1.892 1.091a.069.069 0 0 1-.065.007L4.92 14.9a4.2 4.2 0 0 1-1.551-5.745Zm15.558 3.605-5.462-3.153 1.892-1.09a.069.069 0 0 1 .065-.008l4.516 2.608a4.2 4.2 0 0 1-.649 7.575v-5.313a.736.736 0 0 0-.362-.619Zm1.882-2.835-.133-.08-4.474-2.582a.737.737 0 0 0-.742 0L10 10.415V8.232a.07.07 0 0 1 .027-.055l4.516-2.607a4.2 4.2 0 0 1 6.267 4.354ZM8.888 13.17l-1.892-1.09a.069.069 0 0 1-.037-.053V6.8a4.2 4.2 0 0 1 6.89-3.223l-.133.075-4.474 2.583a.737.737 0 0 0-.372.641l-.002 6.294Zm1.027-2.215 2.43-1.403 2.43 1.402v2.806l-2.43 1.402-2.43-1.402V10.955Z" fill="white"/>
        </svg>
      </div>
    )
  }

  return (
    <div style={{ ...container, background: 'var(--color-gray-100)' }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="var(--color-gray-400)" strokeWidth="1.5"/>
        <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18" stroke="var(--color-gray-400)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
