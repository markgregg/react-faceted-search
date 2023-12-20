import * as React from 'react'

const useExternalClicks = (
  divRef: HTMLDivElement | null,
  callback: () => void,
) => {
  React.useEffect(() => {
    const mouseClick = (mouseEvent: MouseEvent) => {
      if (divRef && mouseEvent.target) {
        if (!divRef.contains(mouseEvent.target as Node)) {
          callback()
        }
      }
    }

    document.addEventListener('mousedown', mouseClick)
    return () => document.removeEventListener('mousedown', mouseClick)
  }, [divRef, callback])
}

export default useExternalClicks
