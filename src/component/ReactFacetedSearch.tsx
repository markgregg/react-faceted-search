import * as React from 'react'
import {
  Config,
  Field,
  FieldLookup,
  FieldValue,
  Matcher,
  ReactFacetedSearchStyles,
  Option,
  Value,
  OperatorDisplay,
  SourceItem,
  defaultComparison,
  stringComparisons,
  numberComparisons,
  Selection,
  Nemonic,
  FreTextFunc,
} from './types'
import { isUnique } from './utils'
import {
  hasFocusContext,
  configContext,
  selectionContext,
  ITEM_LIMIT,
} from './state/context'
import MatcherView from './elements/MatcherView'
import MatcherEdit from './elements/MatcherEdit'
import {
  checkBracket,
  parseText,
  validateMatcher,
} from './ReactFacetedSearchFunctions'
import { MdClear } from 'react-icons/md'
import { IoIosSearch } from 'react-icons/io'
import useExternalClicks from './hooks/useExternalClicks/useExternalClicks'
import './ReactFacetedSearch.css'
import { ComparisonItem } from './types/Config'
import PasteOption from './types/PasteOption'
import PasteOptionList from './elements/PasteOptionList'

interface ReactFacetedSearchProps {
  matchers?: Matcher[] //when managed, the matchers
  fields: Field[] //available fields
  functions?: Nemonic[] //available functions
  defaultComparison?: string //default comparison
  comparisonDescriptons?: ComparisonItem[] //compairson descriptions to display 
  and?: string //and symbol
  or?: string //or symbol
  defaultItemLimit?: number //default item limit
  operators?: 'Simple' | 'AgGrid' | 'Complex' //and, and/or, and/or/brackets
  onMatchersChanged?: (matchers: Matcher[]) => void //when managed notifies matchers changed
  onComplete?: (matchers: Matcher[], func?: string) => void //when unmanaged fired by hitting return
  onCompleteError?: ( //if there is an error with a function
    func: string,
    errorMessage: string,
    missingFields?: string[],
  ) => void
  clearIcon?: React.ReactElement //clear item
  maxMatcherWidth?: number //maximum width of a matcher view
  maxItemsToShow?: number //max height of dropdown list
  searchStartLength?: number //number of characters before search starts
  showCategories?: boolean //show categories
  categoryPosition?: 'top' | 'left' //category position
  hideToolTip?: boolean //hide tooltips
  allowFreeText?: boolean //allow free text
  pasteMatchTimeout?: number //timeout for matching items when pasting
  pasteFreeTextAction?: FreTextFunc //how to handle free text when pasted
  promiseDelay?: number //delay before firing promise, used to reduce server calls
  showWhenSearching?: boolean //show placholder when searching
  hideStaticMenu?: boolean //hide help
  styles?: ReactFacetedSearchStyles //element styles
}
const comparisonsFromFields = (fields: Field[]): string[] => {
  return fields.flatMap((ds) => ds.comparisons).filter(isUnique)
}

const comparisonsDescriptionsFromFields = (fields: Field[]): ComparisonItem[] => {
  return fields.flatMap((ds) => ds.comparisons).filter(isUnique).map(symbol => { return { symbol, description: '' } })
}

const ReactFacetedSearch: React.FC<ReactFacetedSearchProps> = ({
  matchers,
  defaultComparison,
  comparisonDescriptons,
  and,
  or,
  fields,
  functions,
  defaultItemLimit,
  operators,
  onMatchersChanged,
  onComplete,
  onCompleteError,
  clearIcon,
  maxMatcherWidth,
  maxItemsToShow,
  searchStartLength,
  showCategories,
  categoryPosition,
  hideToolTip,
  allowFreeText,
  pasteFreeTextAction,
  pasteMatchTimeout,
  promiseDelay,
  showWhenSearching,
  hideStaticMenu,
  styles,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const editDivRef = React.useRef<HTMLDivElement | null>(null)
  const [hasFocus, setHasFocus] = React.useState<boolean>(false)
  const [activeMatcher, setActiveMatcher] = React.useState<number | null>(null)
  const [currentMatchers, setCurrentMatchers] = React.useState<Matcher[]>(
    matchers ?? [],
  )
  const [mismatchedBrackets, setMismatchedBrackets] = React.useState<number[]>(
    [],
  )
  const [inEdit, setInEdit] = React.useState<boolean>(false)
  const [activeFunction, setActiveFunction] = React.useState<Nemonic | null>(
    null,
  )
  const config = React.useMemo<Config>(() => {
    return {
      fields,
      functions,
      defaultComparison: defaultComparison ?? '=',
      and: and ?? '&',
      or: or ?? '|',
      comparisons: comparisonsFromFields(fields),
      comparisonDescriptions: comparisonDescriptons ?? comparisonsDescriptionsFromFields(fields),
      defaultItemLimit: defaultItemLimit ?? ITEM_LIMIT,
      operators: operators ?? 'Complex',
      maxMatcherWidth,
      maxItemsToShow,
      searchStartLength,
      promiseDelay,
      showWhenSearching,
      hideStaticMenu,
      showCategory: showCategories,
      categoryPosition
    }
  }, [
    fields,
    functions,
    defaultComparison,
    comparisonDescriptons,
    and,
    or,
    defaultItemLimit,
    operators,
    maxMatcherWidth,
    maxItemsToShow,
    searchStartLength,
    promiseDelay,
    showWhenSearching,
    hideStaticMenu,
    showCategories,
    categoryPosition
  ])
  const [pasteOptions, setPasteOptions] = React.useState<PasteOption[]>([])
  const [selectedOption, setSelectedOption] = React.useState<PasteOption>()

  React.useEffect(() => {
    if (!inEdit) {
      setCurrentMatchers(matchers ?? [])
    } else {
      setInEdit(false)
    }
  }, [matchers])

  //when user clicks away loose focus and hide active matcher
  const clickedAway = React.useCallback(() => {
    setHasFocus(false)
    setActiveMatcher(null)
  }, [])

  useExternalClicks(editDivRef.current, clickedAway)

  const deletePasteOption = (key: string) => {
    setPasteOptions(pasteOptions.filter(p => p.key !== key))
  }

  const selectPasteOption = (key: string) => {
    const pasteOption = pasteOptions.find(p => p.key === key)
    if (pasteOption) {
      setSelectedOption(pasteOption)
      setCurrentMatchers(pasteOption.matchers)
    }
  }

  const compeltePasteOption = (key?: string) => {
    complete(key)
  }

  const clearAllPasteOptions = () => {
    setSelectedOption(undefined)
    setPasteOptions([])
  }

  const complete = (key?: string) => {
    const pasteOption = pasteOptions.find(p => p.key === (key ?? selectedOption?.key))
    if (onComplete && validateFunction()) {
      setTimeout(() => {

        onComplete(pasteOption ? pasteOption?.matchers : currentMatchers, pasteOption ? pasteOption?.function?.name : activeFunction?.name)
        setCurrentMatchers([])
        setActiveMatcher(null)
        setActiveFunction(null)
        setCurrentMatchers([])
        if (pasteOption) {
          setPasteOptions(pasteOptions.filter(p => p.key !== pasteOption.key))
        }
      }, 10)
    }
  }

  const clearActiveMatcher = () => {
    setActiveMatcher(null)
    inputRef.current?.focus()
  }

  const deleteActiveFunction = () => {
    setActiveFunction(null)
  }

  const editFocus = () => {
    if (!hasFocus) {
      setHasFocus(true)
    }
    clearActiveMatcher()
  }

  /*
    @param {Matcher} matchers: when managed, calls the onchanged function
  */
  const notifyMatchersChanged = (
    matchers: Matcher[]
  ) => {
    if (onMatchersChanged) {
      onMatchersChanged(matchers)
    }
  }

  const validateFunction = (): boolean => {
    //validates the active function to ensure it has rquried fields
    if (activeFunction?.requiredFields) {
      const missing = activeFunction.requiredFields.filter(
        (ds) => !currentMatchers.find((m) => m.source === ds),
      )
      if (missing.length > 0) {
        if (onCompleteError) {
          onCompleteError(
            activeFunction.name,
            `mandatory fields are missing (${missing.join('')})`,
            missing,
          )
        }
        return false
      }
    }
    if (activeFunction?.validate) {
      const error = activeFunction.validate(currentMatchers)
      if (error) {
        if (onCompleteError) {
          onCompleteError(activeFunction.name, error)
        }
        return false
      }
    }
    return true
  }

  /*
    @param {Matcher[]} newMatchers: validates that all brackets match
  */
  const validateBrackets = (
    newMatchers: Matcher[]
  ) => {
    const missingBracketIndexes: number[] = []
    const brackets = newMatchers.map((m) => m.comparison)
    checkBracket(brackets, missingBracketIndexes, true)
    checkBracket(brackets, missingBracketIndexes, false)
    setMismatchedBrackets(missingBracketIndexes)
  }

  /*
    @param {Matcher[]} newMatchers: matchers to update
  */
  const updatedMatchers = (
    newMatchers: Matcher[]
  ) => {
    //updates the matchers, notifies the parent and checks brackets
    setCurrentMatchers(newMatchers)
    notifyMatchersChanged(newMatchers)
    validateBrackets(newMatchers)
    if (selectedOption) {
      setPasteOptions(pasteOptions.map(p => p.key !== selectedOption.key
        ? p
        : {
          ...selectedOption,
          matchers: newMatchers
        }
      ))
    }
  }

  /*
    @param {Matcher} matchers: matcher to update
  */
  const updateMatcher = (
    matcher: Matcher
  ): void => {
    const newMatchers = currentMatchers.map((mat) =>
      mat.key === matcher.key ? matcher : mat,
    )
    updatedMatchers(newMatchers)
    clearActiveMatcher()
  }

  const deleteLast = () => {
    //deletes last matcher
    if (currentMatchers.length > 0) {
      deleteMatcher(currentMatchers[currentMatchers.length - 1])
    } else if (activeFunction != null) {
      setActiveFunction(null)
    }
  }

  const deleteAll = () => {
    updatedMatchers([])
    clearActiveMatcher()
    setActiveFunction(null)
  }

  const editLast = () => {
    //sets the last matcher as the active item
    if (currentMatchers.length > 0) {
      if (activeMatcher === null) {
        setActiveMatcher(currentMatchers.length - 1)
      } else {
        if (activeMatcher > 0) {
          setActiveMatcher(activeMatcher - 1)
        }
      }
    }
  }

  const editNext = () => {
    if (
      currentMatchers.length > 0 &&
      activeMatcher !== null &&
      activeMatcher < currentMatchers.length - 1
    ) {
      setActiveMatcher(activeMatcher + 1)
    }
  }

  /*
    @param {Matcher} matcher: matcher to delete
    @param {boolean} forceClearActiveMatcher: clear active matcher
  */
  const deleteMatcher = (
    matcher: Matcher,
    forceClearActiveMatcher = false
  ) => {
    const newMatchers = currentMatchers.filter((mat) => mat.key !== matcher.key)
    updatedMatchers(newMatchers)
    if (
      activeMatcher !== null &&
      (forceClearActiveMatcher || activeMatcher > currentMatchers.length - 1)
    ) {
      clearActiveMatcher()
    }
  }

  /*
    @param {Matcher} matcher: matcher to add
  */
  const addMatcher = (
    matcher: Matcher | null
  ): void => {
    if (matcher) {
      const newMatchers = [...currentMatchers, matcher]
      updatedMatchers(newMatchers)
    }
  }

  /*
    @param {number} index: index of matcher to select
  */
  const selectMatcher = (index: number) => {
    if (!hasFocus) {
      setHasFocus(true)
      setTimeout(() => setActiveMatcher(index), 1)
    } else {
      setActiveMatcher(index)
    }
  }

  /*
    @param {Matcher} matcher: matcher to swap
    @param {Matcher} swapMatcher: matcher to swap with
  */
  const swapMatchers = (
    matcher: Matcher,
    swapMatcher: Matcher
  ) => {
    const idx1 = currentMatchers.findIndex((mtch) => mtch.key === matcher.key)
    const idx2 = currentMatchers.findIndex(
      (mtch) => mtch.key === swapMatcher.key,
    )
    if (idx1 !== -1 && idx2 !== -1) {
      const newMatchers = currentMatchers.map((mtch) =>
        mtch.key === matcher.key
          ? swapMatcher
          : mtch.key === swapMatcher.key
            ? matcher
            : mtch,
      )
      updatedMatchers(newMatchers)
    }
  }

  /*
    @param {Matcher} matcher: matcher that is changing
  */
  const matcherChanging = (
    matcher: Matcher
  ) => {
    //stiops the current matcher from being used to filter
    setInEdit(true)
    notifyMatchersChanged(
      currentMatchers.map((m) => {
        return m.key === matcher.key
          ? {
            ...matcher,
            changing: true,
          }
          : m
      }),
    )
  }

  /*
    @param {Matcher} matcher: matcher to insert
    @param {currentMatcher} matcher to insert before
  */
  const insertMatcher = (
    newMatcher: Matcher,
    currentMatcher: Matcher | null,
  ) => {
    if (currentMatcher) {
      const index = currentMatchers.findIndex(
        (m) => m.key === currentMatcher.key,
      )
      currentMatchers.splice(index, 0, newMatcher)
      setCurrentMatchers([...currentMatchers])
      if (activeMatcher != null && index <= activeMatcher) {
        setActiveMatcher(activeMatcher + 1)
      }
    } else {
      setCurrentMatchers([...currentMatchers, newMatcher])
    }
  }

  /*
    @param {KeyboardEvent} keyboard event
  */
  const handleKeyPress = (
    event: React.KeyboardEvent
  ) => {
    switch (event.code) {
      case 'ArrowLeft':
        if (event.shiftKey) {
          setActiveMatcher(
            activeMatcher === null
              ? currentMatchers.length - 1
              : activeMatcher > 0
                ? activeMatcher - 1
                : null,
          )
          event.preventDefault()
        } else if (
          event.ctrlKey &&
          activeMatcher !== null &&
          currentMatchers.length > 1
        ) {
          const idx =
            activeMatcher > 0 ? activeMatcher - 1 : currentMatchers.length - 1
          swapMatchers(currentMatchers[activeMatcher], currentMatchers[idx])
          setActiveMatcher(idx)
        }
        break
      case 'ArrowRight':
        if (event.shiftKey) {
          setActiveMatcher(
            activeMatcher === null
              ? 0
              : activeMatcher < currentMatchers.length - 1
                ? activeMatcher + 1
                : null,
          )
          event.preventDefault()
        } else if (
          event.ctrlKey &&
          activeMatcher !== null &&
          currentMatchers.length > 1
        ) {
          const idx =
            activeMatcher < currentMatchers.length - 1 ? activeMatcher + 1 : 0
          swapMatchers(currentMatchers[activeMatcher], currentMatchers[idx])
          setActiveMatcher(idx)
        }
        break
      case 'Backspace':
        if (event.shiftKey) {
          if (currentMatchers.length === 0) {
            setActiveFunction(null)
          }
          deleteLast()
          event.preventDefault()
        } else if (event.ctrlKey) {
          deleteAll()
          event.preventDefault()
        }
        break
      case 'Enter':
        if (onComplete) {
          if (validateFunction()) {
            complete()
          }
        }
        event.preventDefault()
        break
      case 'Home':
        if (currentMatchers.length > 0) {
          setActiveMatcher(0)
          event.preventDefault()
          event.stopPropagation()
        }
        break
      case 'End':
        if (currentMatchers.length > 0) {
          setActiveMatcher(null)
          inputRef.current?.focus()
          event.preventDefault()
          event.stopPropagation()
        }
        break
      case 'Escape':
        inputRef.current?.focus()
        event.preventDefault()
        event.stopPropagation()
        break;
    }
  }

  /*
    @param {ClipboardEvent} event: clipboard event
  */
  const handlePaste = (
    event: React.ClipboardEvent<HTMLDivElement>
  ) => {
    const text = event.clipboardData?.getData('text')
    if (text) {
      parseText(
        text,
        fields,
        activeFunction,
        config,
        pasteFreeTextAction,
        pasteMatchTimeout,
      ).then((m) => updatedMatchers([...currentMatchers, ...m]))
    }
    event.stopPropagation()
    event.preventDefault()
  }

  /*
    @param {ClipboardEvent} event: clipboard event
  */
  const handleCopy = (
    event: React.ClipboardEvent<HTMLDivElement>
  ) => {
    const matcherText = (m: Matcher) =>
      `${m.operator !== 'and' && m.operator !== config.and
        ? `${m.operator} `
        : ''
      }${m.comparison !== '=' ? `${m.comparison} ` : ''}${m.text.includes(' ') ? `"${m.text}"` : m.text
      }`
    const text = activeFunction
      ? `${activeFunction.name} ${currentMatchers.map(matcherText).join(' ')}`
      : currentMatchers.map(matcherText).join(' ')
    event.clipboardData?.setData('text', text)
    event.stopPropagation()
    event.preventDefault()
  }

  const selection: Selection = {
    matchers: currentMatchers,
    activeFunction,
  }

  const setInputFocus = () => {
    if (activeMatcher === null && !hasFocus) {
      inputRef.current?.focus()
    }
  }

  return (
    <hasFocusContext.Provider value={hasFocus}>
      <configContext.Provider value={config}>
        <selectionContext.Provider value={selection}>
          <div
            id="ReactFacetedSearch"
            style={styles?.reactFacetedSearch}
            className="reactFacetedSearchMain"
            ref={editDivRef}
            onKeyDown={handleKeyPress}
            onPaste={handlePaste}
            onCopy={handleCopy}
            onClick={setInputFocus}
          >
            {
              (currentMatchers.length > 0 || activeFunction !== null) && (
                <div className="reactFacetedSearchClearIcon" onClick={() => deleteAll()}>
                  {clearIcon ? clearIcon : <MdClear />}
                </div>
              )
            }
            <div className="reactFacetedSearchFlow">
              {activeFunction && (
                <MatcherView
                  key={'function'}
                  matcher={activeFunction}
                  onDelete={deleteActiveFunction}
                />
              )}
              {currentMatchers?.map((matcher, index) => (
                <MatcherView
                  key={matcher.key}
                  matcher={matcher}
                  onMatcherChanged={updateMatcher}
                  onValidate={(m) =>
                    validateMatcher(
                      currentMatchers,
                      fields,
                      m,
                      activeMatcher,
                      config.operators,
                      config.or,
                    )
                  }
                  onDelete={() => deleteMatcher(matcher, true)}
                  onSelect={() => selectMatcher(index)}
                  onCancel={() => clearActiveMatcher()}
                  onSwapMatcher={swapMatchers}
                  onEditPrevious={editLast}
                  onEditNext={editNext}
                  onChanging={() => matcherChanging(matcher)}
                  onInsertMatcher={(newMatcher) =>
                    insertMatcher(newMatcher, matcher)
                  }
                  selected={index === activeMatcher}
                  first={
                    index === 0 || currentMatchers[index - 1].comparison === '('
                  }
                  showWarning={mismatchedBrackets.includes(index)}
                  hideToolTip={hideToolTip}
                  allowFreeText={
                    allowFreeText ||
                    (activeFunction !== null && activeFunction.allowFreeText)
                  }
                  styles={styles}
                />
              ))}
              <div
                className='defaultMatcherEdit'
                style={{
                  paddingLeft: currentMatchers.length === 0 && activeFunction === null ? 4 : 0
                }}
              >
                <MatcherEdit
                  ref={inputRef}
                  onMatcherChanged={addMatcher}
                  onValidate={(m) =>
                    validateMatcher(
                      currentMatchers,
                      fields,
                      m,
                      activeMatcher,
                      config.operators,
                      config.or,
                    )
                  }
                  onFocus={editFocus}
                  first={currentMatchers.length === 0}
                  allowFunctions={
                    currentMatchers.length === 0 && activeFunction === null
                  }
                  allowFreeText={
                    allowFreeText ||
                    (activeFunction !== null && activeFunction.allowFreeText)
                  }
                  onEditPrevious={editLast}
                  onEditNext={editNext}
                  onInsertMatcher={(newMatcher) =>
                    insertMatcher(newMatcher, null)
                  }
                  onSetActiveFunction={(activeFunction) =>
                    setActiveFunction(activeFunction)
                  }
                  onDeleteActiveFunction={deleteActiveFunction}
                  styles={styles}
                />
              </div>
            </div>
            {
              pasteOptions.length > 0 &&
              <PasteOptionList
                options={pasteOptions}
                selectedOption={selectedOption?.key}
                onSelectOption={selectPasteOption}
                onDeleteOption={deletePasteOption}
                onCompelteOption={compeltePasteOption}
                onClearAll={clearAllPasteOptions}
                styles={styles}
              />
            }
            <IoIosSearch className="reactFacetedSearchSearchIcon" />
          </div>
        </selectionContext.Provider>
      </configContext.Provider>
    </hasFocusContext.Provider>
  )
}

export type {
  Config,
  Field,
  FieldLookup,
  FieldValue,
  Matcher,
  ReactFacetedSearchStyles,
  Option,
  Value,
  OperatorDisplay,
  SourceItem,
  Nemonic,
  FreTextFunc,
}
export { defaultComparison, stringComparisons, numberComparisons, isUnique }
export default ReactFacetedSearch
