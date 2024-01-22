import * as React from 'react'
import { Option, ReactFacetedSearchStyles, Config } from '../../types'
import { configContext } from '@/component/state/context'
import { FlattenedOption } from '../MatcherEdit/MatcherEditFunctions'
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import './OptionList.css'


interface OptionListProps {
  flattenedOptions: FlattenedOption[]
  activeOption: number
  onSelectOption: (option: Option, insert: boolean) => void
  onSelectActiveOption: (index: number) => void
  styles?: ReactFacetedSearchStyles
}

const OptionList: React.FC<OptionListProps> = ({
  flattenedOptions,
  activeOption,
  onSelectOption,
  onSelectActiveOption,
  styles,
}) => {
  const activeItemRef = React.useRef<HTMLLIElement | null>(null)
  const config = React.useContext<Config>(configContext)

  //scroll selected item into view
  React.useEffect(() => {
    if (activeItemRef.current && activeItemRef.current.scrollIntoView) {
      activeItemRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }, [activeOption])

  /*
    @param {MouseEvent} event: mouse event
    @param {Option} option: option to select
  */
  const selectOption = (
    event: React.MouseEvent,
    option: Option
  ) => {
    onSelectOption(option, event.shiftKey)
    event.stopPropagation()
  }

  const showOptions = () => {
    const itemsToShow = config.maxItemsToShow ?? 5 < flattenedOptions.length
      ? config.maxItemsToShow ?? 5
      : flattenedOptions.length
    const topHalf = Math.floor((itemsToShow - 1) / 2)
    const bottomHalf = itemsToShow - 1 - topHalf

    const visibleOptions = [
      ...(topHalf > 0 && topHalf - activeOption > 0 ? flattenedOptions.slice(flattenedOptions.length - (topHalf - activeOption), flattenedOptions.length + 1) : []),
      ...(topHalf > 0 && activeOption > 0 ? flattenedOptions.slice(activeOption - topHalf - 1 < 0 ? 0 : activeOption - topHalf, activeOption) : []),
      flattenedOptions[activeOption >= flattenedOptions.length ? flattenedOptions.length - 1 : activeOption],
      ...(bottomHalf > 0 ? flattenedOptions.slice(activeOption + 1, activeOption + bottomHalf + 1 <= flattenedOptions.length ? activeOption + bottomHalf + 1 : flattenedOptions.length) : []),
      ...(bottomHalf > 0 && activeOption + bottomHalf + 1 > flattenedOptions.length ? flattenedOptions.slice(0, activeOption + bottomHalf + 1 - flattenedOptions.length) : [])
    ]
    if (visibleOptions.findIndex(i => !i) !== -1) {
      console.log('bad')
    }
    return visibleOptions.map(option => {
      return (
        <li
          ref={option.actualIndex === activeOption ? activeItemRef : undefined}
          className={
            option.actualIndex === activeOption
              ? 'optionListOption optionListActiveOption'
              : 'optionListOption'
          }
          style={
            option.actualIndex === activeOption ? styles?.activeOption : styles?.option
          }
          key={option.actualIndex}
          onClick={(e) => selectOption(e, option)}
        >
          {option.text} <span className='optionListCategory'>({option.source === '~~func~~' ? 'Function' : option.source})</span>
        </li>
      )
    })
  }

  const listStyle = {
    ...styles?.optionsList,
  }

  return (
    <div id="option_list" className="optionListMain" style={listStyle}>
      <div className="optionListContainer">
        <ul>
          {
            flattenedOptions.length > (config.maxItemsToShow ?? 5) &&
            <div className='optionListUpArrowAndPage'>
              <FaCaretUp
                className='optionListUpArrow'
                onClick={() => onSelectActiveOption(activeOption > 0 ? activeOption - 1 : flattenedOptions.length - 1)}
              />
              <span className='optionListNavText'>{` (Hold Shift to select multiple)`}</span>
            </div>
          }
          {showOptions()}
          {
            flattenedOptions.length > (config.maxItemsToShow ?? 5) &&
            <div className='optionListDownArrowAndPage'>
              <FaCaretDown
                className='optionListDownArrow'
                onClick={() => onSelectActiveOption(activeOption < flattenedOptions.length - 1 ? activeOption + 1 : 0)}
              />
              <span className='optionListNavText'>{` (${activeOption + 1} of ${flattenedOptions.length})`}</span>
            </div>
          }
        </ul>
      </div>
    </div>
  )
}

export default OptionList
