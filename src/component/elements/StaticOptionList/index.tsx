import * as React from 'react'
import { Option, ReactFacetedSearchStyles, Config, Value } from '../../types'
import { configContext } from '@/component/state/context'
import { getText, getValue } from '@/component/utils'
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import './StaticOptionList.css'

interface StaticOptionListProps {
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

const StaticOptionList: React.FC<StaticOptionListProps> = ({
  onSelectFunction,
  onSelectOperator,
  onSelectComparison,
  onSelectText,
  styles,
}) => {
  const [showSubItems, setShowSubItems] = React.useState<string | null>(null)
  const [width, setWidth] = React.useState<number>(0)
  const config = React.useContext<Config>(configContext)

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
    return <div className='optionsStaticHeaders'>
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
  }

  const listStyle = {
    ...styles?.optionsList,
  }

  return (
    <div id="option_list" className='staticOptionListMain' style={listStyle}>
      {
        showStaticOptions(showSubItems)
      }

    </div>
  )
}

export default StaticOptionList
