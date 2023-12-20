import * as React from 'react'
import './Select.css'
import useExternalClicks from '@/component/hooks/useExternalClicks/useExternalClicks'

interface SelectProps<T extends string> {
  options: T[]
  selection: T
  onSelectOption: (option: T) => void
}

const Select = <T extends string>(props: SelectProps<T>) => {
  const { options, selection, onSelectOption } = props
  const divRef = React.useRef<HTMLDivElement | null>(null)
  const [selected, setSelected] = React.useState<T>(selection)
  const [optionsVisible, setOptionsVisible] = React.useState<boolean>(false)

  const lostFocus = React.useCallback(() => {
    setOptionsVisible(false)
  }, [])

  useExternalClicks(divRef.current, lostFocus)

  const selectOption = (e: React.MouseEvent, option: T) => {
    setSelected(option)
    setOptionsVisible(false)
    onSelectOption(option)
    e.stopPropagation()
  }

  return (
    <div
      className="selectMain"
      onClick={() => setOptionsVisible(true)}
      ref={divRef}
    >
      {selected}
      {optionsVisible && (
        <div className="selectMainOptionList">
          <ul>
            {options.map((option) => (
              <li key={option} onClick={(e) => selectOption(e, option)}>
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div></div>
    </div>
  )
}

export default Select
