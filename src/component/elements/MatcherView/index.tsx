import * as React from 'react'
import { Matcher, MutliSelectStyles } from '../../types'
import MatcherEdit from '../MatcherEdit'
import { TiMinus } from 'react-icons/ti'
import Nemonic from '@/component/types/Nemonic'
import './MatcherView.css'
import { matcherDisplay, matcherToolTip } from './MatcherViewFunctions'

const reactFacetedSearchPrefix = 'multi-select/matcher/'

interface MatcherViewProps {
  matcher: Matcher | Nemonic
  onMatcherChanged?: (matcher: Matcher) => void
  onValidate?: (matcher: Matcher) => string | null
  onDelete: () => void
  onSelect?: () => void
  onCancel?: () => void
  onSwapMatcher?: (matcher: Matcher, swapMatcher: Matcher) => void
  onEditPrevious?: () => void
  onEditNext?: () => void
  onChanging?: () => void
  onInsertMatcher?: (matcher: Matcher) => void
  selected?: boolean
  first?: boolean
  hideOperators?: boolean
  showWarning?: boolean
  showCategory?: boolean
  categoryPosition?: 'top' | 'left'
  hideToolTip?: boolean
  allowFreeText?: boolean
  styles?: MutliSelectStyles
}

const MatcherView: React.FC<MatcherViewProps> = ({
  matcher,
  onMatcherChanged,
  onValidate,
  onDelete,
  onSelect,
  onCancel,
  onSwapMatcher,
  onEditPrevious,
  onEditNext,
  onChanging,
  onInsertMatcher,
  selected,
  first,
  hideOperators,
  showWarning,
  showCategory,
  categoryPosition,
  hideToolTip,
  allowFreeText,
  styles,
}) => {
  const labelRef = React.useRef<HTMLDivElement | null>(null)
  const [showToopTip, setShowToolTip] = React.useState<boolean>(false)
  const [showDelete, setShowDelete] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (selected && showToopTip) {
      setShowToolTip(false)
    }
  }, [selected, showToopTip])

  React.useEffect(() => {
    if (selected && showDelete) {
      setShowDelete(false)
    }
  }, [selected, showDelete])

  const editPrevious = (deleting: boolean) => {
    if (deleting) {
      onDelete()
    } else if (onEditPrevious) {
      onEditPrevious()
    }
  }
  const deleteMatcher = (event: React.MouseEvent) => {
    onDelete()
    event.stopPropagation()
  }

  const matcherUpdated = (update: Matcher | null): void => {
    if (update) {
      if (onMatcherChanged) {
        onMatcherChanged(update)
      }
    } else {
      onDelete()
    }
  }

  const dragMatcher = (event: React.DragEvent<HTMLDivElement>) => {
    if ('key' in matcher) {
      event.dataTransfer.setData(
        `${reactFacetedSearchPrefix}${matcher.key}`,
        JSON.stringify(matcher),
      )
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  const dragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if ('key' in matcher) {
      if (
        !event.dataTransfer.types.find((type) => type.includes(matcher.key))
      ) {
        event.dataTransfer.dropEffect = 'move'
        event.preventDefault()
      }
    }
  }

  const dropMatcher = (event: React.DragEvent<HTMLDivElement>) => {
    if ('key' in matcher) {
      const dataType = event.dataTransfer.types.find((type) =>
        type.includes(reactFacetedSearchPrefix),
      )
      if (dataType) {
        const data = event.dataTransfer.getData(dataType)
        if (data && onSwapMatcher) {
          const swapMatcher: Matcher = JSON.parse(data)
          onSwapMatcher(matcher, swapMatcher)
        }
      }
    }
  }

  return (
    <div
      id={'key' in matcher ? matcher.key + '_view' : 'function_view'}
      className="matcherViewMain"
      style={{
        ...(selected ? styles?.matcherViewSelected : styles?.matcherView),
        flexGrow: selected ? 1 : 0,
      }}
      onClick={onSelect}
      draggable
      onDragStart={dragMatcher}
      onDragOver={dragOver}
      onDrop={dropMatcher}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {showDelete && !selected && (
        <TiMinus className="deleteIcon" onClick={deleteMatcher} />
      )}
      {selected && 'key' in matcher ? (
        <MatcherEdit
          matcher={matcher}
          onMatcherChanged={matcherUpdated}
          onValidate={onValidate}
          onCancel={onCancel}
          first={first ?? false}
          styles={styles}
          onEditNext={onEditNext}
          onEditPrevious={editPrevious}
          onChanging={onChanging}
          onInsertMatcher={onInsertMatcher}
          allowFreeText={allowFreeText}
        />
      ) : (
        <>
          {!hideToolTip && showToopTip && 'key' in matcher && (
            <div
              id={matcher.key + '_tool_tip'}
              className="matcherViewToolTip"
              style={{
                top: (labelRef.current?.clientHeight ?? 10) * -1 - 4,
                ...styles?.matcherToolTip,
              }}
            >
              {matcherToolTip(matcher)}
            </div>
          )}
          <div
            onMouseEnter={() => setShowToolTip(true)}
            onMouseLeave={() => setShowToolTip(false)}
            className={'matcherViewContainer'}
            style={
              'key' in matcher && matcher.source !== ''
                ? {
                }
                : {
                  alignSelf: 'end',
                }
            }
          >
            {showCategory && 'key' in matcher && categoryPosition !== 'left' && (
              <div className="matchViewCategory">{matcher.source}</div>
            )}
            <div
              ref={labelRef}
              id={'key' in matcher ? matcher.key + '_label' : 'function_label'}
              className={showWarning ? 'matcherViewWarning' : ''}
            >
              {'key' in matcher
                ? matcherDisplay(
                  matcher,
                  first ?? false,
                  hideOperators ?? false,
                  showCategory,
                  categoryPosition
                )
                : matcher.name}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MatcherView
