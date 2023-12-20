import * as React from 'react'
import { MdClear } from 'react-icons/md'
import './ErrorMessage.css'

interface ErrorMessageProperties {
  errorMessage: string | null
  onErrorAcknowledged: () => void
  style?: React.CSSProperties
}

const ErrorMessage: React.FC<ErrorMessageProperties> = ({
  errorMessage,
  onErrorAcknowledged,
  style,
}) => {
  return (
    <div id="editError" className="errorMessageMain" style={style}>
      <MdClear className="errorMessageIcon" onClick={onErrorAcknowledged} />
      {errorMessage}
    </div>
  )
}

export default ErrorMessage
