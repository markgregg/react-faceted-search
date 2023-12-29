import * as React from 'react'
import { Option, ReactFacetedSearchStyles, Config, Value } from '../../types'
import { configContext } from '@/component/state/context'
import { getText, getValue } from '@/component/utils'
import { FaCaretDown, FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";
import './OptionList.css'

interface OptionListProps {
  options: [string, Option[]][]
  activeOption: number | null
  onSelectOption: (option: Option, insert: boolean) => void
  onSelectActiveOption: (index: number) => void
  styles?: ReactFacetedSearchStyles
  onSelectFunction: (func: string) => void
  onSelectOperator: (op: string) => void
  onSelectComparison: (comp: string) => void
  onSelectText: (option: Option) => void
}

interface StaticHeader {
  header: string
}

interface StaticItem {
  text: string
  value: Value
  type: 'operator' | 'comparison' | string
}

interface StaticList {
  header: string
  items: StaticItem[]
}

interface StaticOther {
  header: string
  type: string
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
  const activeItemRef = React.useRef<HTMLLIElement | null>(null)
  const config = React.useContext<Config>(configContext)


  React.useEffect(() => {
    if (activeItemRef.current && activeItemRef.current.scrollIntoView) {
      activeItemRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' })
    }
  }, [activeOption])

  const selectOption = (event: React.MouseEvent, option: Option) => {
    onSelectOption(option, event.shiftKey)
    event.stopPropagation()
  }

  const showOptions = () => {
    let cnt = 0
    let groupIndex: number | null = null
    if (activeOption !== null) {
      for (let i = 0; i < options.length; i++) {
        if (activeOption >= cnt &&
          activeOption < (cnt + options[i][1].length)) {
          groupIndex = i
          break
        }
        cnt += options[i][1].length
      }
    }
    cnt = 0
    return options.map((entry, index) => {
      const [category, categoryOptions] = entry

      const homeEnd = index === 0 && (groupIndex !== 0 || groupIndex > 0) ? 'Home' : index === options.length - 1 && (!groupIndex || groupIndex < options.length - 1) ? 'End' : ''
      const pgUpDown = (index + 1 === groupIndex ? 'PgUp' : index - 1 === groupIndex ? 'PgDown' : '')
      const selectMultiple = index === 0 ? 'Hold Shift to select multiple items' : ''
      const allKeys = (homeEnd !== '' && pgUpDown !== '' ? `${homeEnd} / ${pgUpDown}` : homeEnd !== '' ? homeEnd : pgUpDown)

      return (
        <ul key={category}>

          <li className="optionListCategory" style={styles?.optionCategory}>
            {category}
            <i>{
              allKeys !== ''
                ? ` (${allKeys})`
                : ''
            }</i>
            <span className='optionSelectMultiple'>{selectMultiple}</span>
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
    const items: (StaticHeader | StaticItem | StaticList | StaticOther)[] = []
    if (config.functions && config.functions.length > 0) {
      items.push({ header: 'Functions' })
      config.functions.forEach(func => items.push({ text: func.name, value: func.name, type: 'function' }))
    }
    if (config.operators !== 'Simple') {
      items.push({ header: 'Operators' })
      items.push({ text: 'And', value: 'and', type: 'operator' })
      items.push({ text: 'Or', value: 'or', type: 'operator' })
      if (config.operators === 'Complex') {
        items.push({ text: '( Open bracket', value: '(', type: 'operator' })
        items.push({ text: ') Close bracket', value: ')', type: 'operator' })
      }
    }
    if (config.operators !== 'Simple') {
      items.push({ header: 'Comparison' })
      items.push(...config.comparisonDescriptions.map(c => { return { text: c.description === '' ? c.symbol : c.description, value: c.symbol, type: 'comparison' } }) as StaticItem[])
    }

    config.dataSources.forEach(ds => {
      let lastItem: string | null = null
      ds.definitions.forEach(def => {
        if (!ds.hideOnShortcut) {
          if ('source' in def && def.source) {
            if (typeof def.source !== 'function') {
              if (lastItem !== ds.title) {
                items.push({ header: ds.title })
                items.push(...def.source.map(i => { return { text: getText(i, def), value: getValue(i, def), type: ds.name } }) as StaticItem[])
              }
            }
          }
          lastItem = ds.title
        }
      })
    })
    return <div
      style={{
        maxHeight: config.maxDropDownHeight ?? 210
      }}
    >
      <div className='optionsHelp'>
        <div><b>Edit Prev Matcher</b>  (Shift+<FaLongArrowAltLeft />)</div>
        <div><b>Edit Next Matcher</b>  (Shift+<FaLongArrowAltRight />)</div>
        <div><b>Move Matcher Left</b>  (Ctrl+<FaLongArrowAltLeft />)</div>
        <div><b>Move Matcher Right</b>  (Ctrl+<FaLongArrowAltRight />)</div>
      </div>
      <div
        className='optionStaticList'
        style={{
          minHeight: config.minStaticListHeight,
          maxHeight: config.maxStaticListHeight ?? 200
        }}
      >
        {
          items.map(item =>
            !('header' in item)
              ? <div
                className='optionStaticItem'
                key={item.text + '-' + item.type}
                onClick={() => {
                  if (item.type === 'function') {
                    onSelectFunction(item.text)
                  } else if (item.type === 'comparison') {
                    onSelectComparison(typeof item.value === 'string' ? item.value : item.value.toString())
                  } else if (item.type === 'operator') {
                    onSelectOperator(typeof item.value === 'string' ? item.value : item.value.toString())
                  } else {
                    onSelectText({ text: item.text, value: item.value, source: item.type })
                  }
                }}
              >
                {item.text}
              </div>
              : !('items' in item)
                ? ('type' in item)
                  ? <div className='optionStaticHeader' key={item.header}>{item.header} - {item.type}</div>
                  : <div className='optionStaticHeader' key={item.header}>{item.header}</div>
                : <div
                  className='optionStaticHeaderMenu'
                  key={item.header}
                  onMouseEnter={() => setShowSubItems(item.header)}
                  onMouseLeave={() => setShowSubItems(null)}
                >
                  {item.header}<FaCaretDown />
                  <div>
                    {
                      showItems === item.header &&
                      <div className='subItemsList'>
                        {
                          item.items.map(subItem => <div key={item.header + '-' + subItem.text}>{subItem.text}</div>)
                        }
                      </div>
                    }
                  </div>
                </div>
          )
        }
      </div>
    </div>
  }

  const listStyle = {
    ...styles?.optionsList,
    ...(config.maxDropDownHeight
      ? { maxHeight: config.maxDropDownHeight }
      : {})
  }

  return (
    <div id="option_list" className="optionListMain" style={listStyle}>
      {
        options.length > 0
          ? showOptions()
          : showStaticOptions(showSubItems)
      }

    </div>
  )
}

export default OptionList
