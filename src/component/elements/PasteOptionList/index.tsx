import * as React from 'react'
import { ReactFacetedSearchStyles } from '../../types'
import { TiMinus } from 'react-icons/ti'
import { MdClear } from 'react-icons/md'
import PasteOption from '@/component/types/PasteOption';
import MatcherDisplay from '../MatcherDisplay';
import './PasteOptionList.css'


interface PasteOptionListProps {
  options: PasteOption[]
  selectedOption?: string
  onSelectOption: (key: string) => void
  onDeleteOption: (key: string) => void
  onCompelteOption: (key: string) => void
  onClearAll: () => void
  styles?: ReactFacetedSearchStyles
}

const PasteOptionList: React.FC<PasteOptionListProps> = ({
  options,
  selectedOption,
  onSelectOption,
  onDeleteOption,
  onCompelteOption,
  onClearAll,
  styles,
}) => {

  const deleteOption = (event: React.MouseEvent<HTMLDivElement>, key: string) => {
    onDeleteOption(key)
    event.stopPropagation()
  }

  return (
    <div id="paste_option_list" className="pasteOptionListMain" style={styles?.optionsList}>
      <ul>
        {
          options.map(option => <li
            className={
              option.key === selectedOption
                ? 'pasteOptionListOption pasteOptionListActiveOption'
                : 'pasteOptionListOption'
            }
            key={option.key}
            onClick={() => onSelectOption(option.key)}
            onDoubleClick={() => onCompelteOption(option.key)}
          >
            <div
              className="deleteIcon" onClick={e => deleteOption(e, option.key)}
            >
              <TiMinus />
            </div>
            <MatcherDisplay
              key={'Function' + option.key}
              matcher={option.function}
              bold={true}
            />
            {
              option.matchers.map((matcher, index) => <MatcherDisplay
                key={matcher.key}
                matcher={matcher}
                first={index === 0}
              />)
            }
          </li>
          )
        }
      </ul>
      <div
        className='pasteOptionClearAllDiv'
        onClick={onClearAll}
      >
        <MdClear className='pasteOptionClearAll' />
      </div>
    </div>
  )
}

export default PasteOptionList
