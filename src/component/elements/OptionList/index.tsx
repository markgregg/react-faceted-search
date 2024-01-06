import * as React from 'react'
import { Option, ReactFacetedSearchStyles, Config, Value } from '../../types'
import { configContext } from '@/component/state/context'
import { getText, getValue } from '@/component/utils'
import { FaCaretDown, FaCaretUp, FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import './OptionList.css'
import { CategoryOptions } from '../MatcherEdit/MatcherEditFunctions';

interface OptionListProps {
  options: CategoryOptions[]
  activeOption: number | null
  onSelectOption: (option: Option, insert: boolean) => void
  onSelectActiveOption: (index: number) => void
  styles?: ReactFacetedSearchStyles
  onSelectFunction: (func: string) => void
  onSelectOperator: (op: string) => void
  onSelectComparison: (comp: string) => void
  onSelectText: (option: Option) => void
}

interface StaticItem {
  text: string
  value: Value
  type: 'operator' | 'comparison' | string
}

interface StaticHeader {
  header: string
  items: StaticItem[]
}

const OptionList: React.FC<OptionListProps> = ({
  options,
  activeOption,
  onSelectOption,
  onSelectActiveOption,
  onSelectFunction,
  onSelectOperator,
  onSelectComparison,
  onSelectText,
  styles,
}) => {
  const [showSubItems, setShowSubItems] = React.useState<string | null>(null)
  const [width, setWidth] = React.useState<number>(0)
  const activeItemRef = React.useRef<HTMLLIElement | null>(null)
  const config = React.useContext<Config>(configContext)

  //scroll selected item into view
  React.useEffect(() => {
    if (activeItemRef.current && activeItemRef.current.scrollIntoView) {
      activeItemRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }, [activeOption])

  /*
    @param {HTMLDivElement} divElement: current div element
    @param {string} showItems: shown header
    @param {string} header: header of item
  */
  const updateWidth = (
    divElement: HTMLDivElement | null,
    showItems: string | null,
    header: string
  ) => {
    if (divElement && showItems === header) {
      setWidth(divElement.clientWidth - 2)
    }
  }

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
    let cnt = 0
    let groupIndex: number | null = null
    if (activeOption !== null) {
      for (let i = 0; i < options.length; i++) {
        if (activeOption >= cnt &&
          activeOption < (cnt + options[i].options.length)) {
          groupIndex = i
          break
        }
        cnt += options[i].options.length
      }
    }
    cnt = 0

    return options.map((entry, index) => {
      const { category, options: categoryOptions, delayedPromise } = entry

      //work out what help text to display for home/end/pageup/pagedown
      const homeEnd = index === 0 && (groupIndex !== 0 || groupIndex > 0) ? 'Home' : index === options.length - 1 && (!groupIndex || groupIndex < options.length - 1) ? 'End' : ''
      const pgUpDown = (index + 1 === groupIndex ? 'PgUp' : index - 1 === groupIndex ? 'PgDown' : '')
      const allKeys = (homeEnd !== '' && pgUpDown !== '' ? `${homeEnd} / ${pgUpDown}` : homeEnd !== '' ? homeEnd : pgUpDown)

      if (delayedPromise) {
        console.log('here')
      }
      return (
        <ul key={category} className={delayedPromise ? 'optionListOptionDelayedItem' : ''}>
          <li className="optionListCategory" style={styles?.optionCategory}>
            {category}
            <i>{
              allKeys !== ''
                ? ` (${allKeys})`
                : ''
            }</i>
          </li>
          {
            categoryOptions.length === 0 &&
            <li
              className='optionListOption'
              style={styles?.option}
            >
              Loading
            </li>
          }
          {categoryOptions.map((option) => {
            const idx = cnt++
            return (
              <li
                ref={idx === activeOption ? activeItemRef : undefined}
                className={
                  idx === activeOption
                    ? 'optionListOption optionListActiveOption'
                    : 'optionListOption'
                }
                style={
                  idx === activeOption ? styles?.activeOption : styles?.option
                }
                key={option.value.toString()}
                onMouseEnter={() => onSelectActiveOption(idx)}
                onClick={(e) => selectOption(e, option)}
              >
                {option.text}
              </li>
            )
          })}
        </ul>
      )
    })
  }

  const showStaticOptions = (showItems: string | null) => {
    //create a list of all items to show
    const items: StaticHeader[] = []
    if (config.functions && config.functions.length > 0) {
      items.push({
        header: 'Functions',
        items: config.functions.map(func => { return { text: func.name, value: func.name, type: 'function' } })
      })
    }
    if (config.operators !== 'Simple') {
      items.push({
        header: 'Operators',
        items: [
          { text: 'And', value: 'and', type: 'operator' },
          { text: 'Or', value: 'or', type: 'operator' },
          ...(config.operators === 'Complex' ? [{ text: '( Open bracket', value: '(', type: 'operator' }, { text: ') Close bracket', value: ')', type: 'operator' }] : [])
        ]
      })
    }
    if (config.operators !== 'Simple') {
      items.push({
        header: 'Comparisons',
        items: config.comparisonDescriptions.map(c => { return { text: c.description === '' ? c.symbol : c.description, value: c.symbol, type: 'comparison' } })
      })
    }
    //show static field lists
    config.fields.forEach(ds => {
      let lastItem: string | null = null
      ds.definitions.forEach(def => {
        if (!ds.hideOnShortcut) {
          if ('source' in def && def.source) {
            if (typeof def.source !== 'function') {
              if (lastItem !== ds.title) {
                items.push({
                  header: ds.title,
                  items: def.source.map(i => { return { text: getText(i, def), value: getValue(i, def), type: ds.name } })
                })
              }
            }
          }
          lastItem = ds.title
        }
      })
    })
    return <div className='staticListContainer' >
      {
        !config.hideHelp &&
        <div className='optionsHelp'>
          <div><b>Edit Prev Matcher</b>  (Shift+<FaLongArrowAltLeft />)</div>
          <div><b>Edit Next Matcher</b>  (Shift+<FaLongArrowAltRight />)</div>
          <div><b>Move Matcher Left</b>  (Ctrl+<FaLongArrowAltLeft />)</div>
          <div><b>Move Matcher Right</b>  (Ctrl+<FaLongArrowAltRight />)</div>
          <div><b>Delete Matcher</b>  (Shift+BackSp)</div>
          <div><b>Delete All</b>  (Ctrl+BackSp)</div>
        </div>
      }
      <div className='optionStaticList'>
        <div className='optionsStaticHeaders'>
          {
            items.map(item => ('header' in item)
              && <div
                id={'options_' + item.header.replaceAll(' ', '_')}
                key={item.header}
                className='optionsStaticHeadersItem'
                onMouseEnter={() => setShowSubItems(item.header)}
                onMouseLeave={() => setShowSubItems(null)}
                ref={ref => updateWidth(ref, showItems, item.header)}
              >
                <span className='optionsStaticHeadersItemText'>{item.header}</span>
                {
                  showItems === item.header
                    ? <FaCaretUp className='optionsStaticHeadersIcon' />
                    : <FaCaretDown className='optionsStaticHeadersIcon' />
                }
                {
                  showItems === item.header &&
                  <div className='optionsStaticSubItemsList' style={{ width }}>
                    {
                      item.items.map(subItem =>
                        <div
                          className='optionStaticItem'
                          key={subItem.text + '-' + subItem.type}
                          onClick={() => {
                            if (subItem.type === 'function') {
                              onSelectFunction(subItem.text)
                            } else if (subItem.type === 'comparison') {
                              onSelectComparison(typeof subItem.value === 'string' ? subItem.value : subItem.value.toString())
                            } else if (subItem.type === 'operator') {
                              onSelectOperator(typeof subItem.value === 'string' ? subItem.value : subItem.value.toString())
                            } else {
                              onSelectText({ text: subItem.text, value: subItem.value, source: subItem.type })
                            }
                          }}
                        >
                          {subItem.text}
                        </div>)
                    }
                  </div>
                }
              </div>
            )
          }
        </div>
        {
        }
      </div>
    </div>
  }

  const listStyle = {
    ...styles?.optionsList,
  }

  return (
    <div id="option_list" className={options.length > 0 ? 'optionListMain optionListMainActive' : 'optionListMain'} style={listStyle}>
      {
        options.length > 0
          ? <div className='optionDynamicList' style={{ maxHeight: config.maxDropDownHeight }}>
            <div className='optionSelectMultiple'>{'Hold Shift to select multiple items'}</div>
            {showOptions()}
          </div>
          : showStaticOptions(showSubItems)
      }

    </div>
  )
}

export default OptionList
