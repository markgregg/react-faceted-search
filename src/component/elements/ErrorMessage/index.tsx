import * as React from 'react'
import { MdClear } from 'react-icons/md'
import './ErrorMessage.css'

interface ErrorMessageProperties {
  errorMessage: string | null //error message
  onErrorAcknowledged: () => void //error has been acknowledged
  style?: React.CSSProperties
}

const ErrorMessage: React.FC<ErrorMessageProperties> = ({
  errorMessage,
  onErrorAcknowledged,
  style,
}) => {
  const divRef = React.useRef<HTMLDivElement | null>(null)
  const [top, setTop] = React.useState<number>(22)

  React.useEffect(() => {
    setTop((divRef.current?.clientHeight ?? 22) * -1 - 4)
  }, [])

  return (
    <div
      id="editError"
      className="errorMessageMain"
      style={{
        ...style,
        top
      }}
      ref={divRef}
    >
      <MdClear className="errorMessageIcon" onClick={onErrorAcknowledged} />
      {errorMessage}
    </div>
  )
}

export default ErrorMessage
