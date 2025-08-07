import { useEffect, useCallback } from 'react'

export function useKeyboardShortcuts() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Cmd/Ctrl + K to open search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      // Dispatch a custom event that the search component can listen to
      window.dispatchEvent(new CustomEvent('openSearch'))
    }

    // Escape to close search
    if (event.key === 'Escape') {
      window.dispatchEvent(new CustomEvent('closeSearch'))
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
} 