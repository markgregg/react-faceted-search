import * as React from 'react'
import { Matcher, ReactFacetedSearchStyles } from '../../types'
import MatcherEdit from '../MatcherEdit'
import { TiMinus } from 'react-icons/ti'
import Nemonic from '@/component/types/Nemonic'
import './MatcherView.css'
import { matcherToolTip } from './MatcherViewFunctions'
import MatcherDisplay from '../MatcherDisplay'

const reactFacetedSearchPrefix = 'multi-select/matcher/'

interface MatcherViewProps {
  matcher: Matcher | Nemonic //matcher to show
  onMatcherChanged?: (matcher: Matcher) => void //notify parent matcher has changed
  onValidate?: (matcher: Matcher) => string | null //ask parent to validate matcher
  onDelete: () => void //notify parent to delete
  onSelect?: () => void //notify parent, matcher selected
  onCancel?: () => void //cancel edit
  onSwapMatcher?: (matcher: Matcher, swapMatcher: Matcher) => void //request matcher swap
  onEditPrevious?: () => void //command to parent
  onEditNext?: () => void //command to parent
  onChanging?: () => void //notify parent matcher being edited
  onInsertMatcher?: (matcher: Matcher) => void //request parent edit matcher
  selected?: boolean //is selected
  first?: boolean //is first matcher in list
  showWarning?: boolean //show warning
  hideToolTip?: boolean //hide tool tips
  allowFreeText?: boolean //allow free text to pasted or entereds
  styles?: ReactFacetedSearchStyles
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
  showWarning,
  hideToolTip,
  allowFreeText,
  styles,
}) => {
  const [showToopTip, setShowToolTip] = React.useState<boolean>(false)
  const [deleted, setDeleted] = React.useState<boolean>(false)
  const [showDelete, setShowDelete] = React.useState<boolean>(false)
  const [height, setHeight] = React.useState<number | undefined>()

  //if selected hide tooltips
  React.useEffect(() => {
    if (selected && showToopTip) {
      setShowToolTip(false)
    }
  }, [selected, showToopTip])

  //if selected hide show delete
  React.useEffect(() => {
    if (selected && showDelete) {
      setShowDelete(false)
    }
  }, [selected, showDelete])

  /*
    @param {boolean} deleting: are we deleting or moving
  */
  const editPrevious = (deleting: boolean) => {
    if (deleting) {
      onDelete()
    } else if (onEditPrevious) {
      onEditPrevious()
    }
  }

  /*
    @param {React.MouseEvent} event: mouse event
  */
  const deleteMatcher = (event: React.MouseEvent) => {
    setDeleted(true)
    setTimeout(() => {
      onDelete()
    }, 500)
    event.stopPropagation()
  }

  /*
    @param {Matcher} update: matcher to update
  */
  const matcherUpdated = (update: Matcher | null): void => {
    if (update) {
      if (onMatcherChanged) {
        onMatcherChanged(update)
      }
    } else {
      onDelete()
    }
  }

  /*
    @param {DragEvent} event: drag event
  */
  const dragMatcher = (event: React.DragEvent<HTMLDivElement>) => {

    if ('key' in matcher) {
      event.dataTransfer.setData(
        `${reactFacetedSearchPrefix}${matcher.key}`,
        JSON.stringify(matcher),
      )
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  /*
    @param {DragEvent} event: drag event
  */
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

  /*
    @param {DragEvent} event: drag event
  */
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
        ...(selected ? styles?.matcherViewSelected : styles?.matcherView)
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
                top: (height ?? 10) * -1 - 4,
                ...styles?.matcherToolTip,
              }}
            >
              {matcherToolTip(matcher)}
            </div>
          )}
          <MatcherDisplay
            matcher={matcher}
            first={first}
            deleted={deleted}
            showWarning={showWarning}
            onLabelHeight={setHeight}
            onShowToolTip={setShowToolTip}
            styles={styles}
          />
        </>
      )}
    </div>
  )
}

export default MatcherView
