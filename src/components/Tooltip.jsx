import { useState, useRef } from 'react'

export default function Tooltip({ label, children }) {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  function show() {
    timer.current = setTimeout(() => setVisible(true), 200)
  }

  function hide() {
    clearTimeout(timer.current)
    setVisible(false)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 5px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a1a1a',
          color: '#fff',
          fontSize: 11,
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: 5,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 500,
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
