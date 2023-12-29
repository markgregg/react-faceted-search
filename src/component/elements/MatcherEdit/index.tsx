import * as React from 'react'
import { Matcher, Option, Config, Selection, DataSource } from '../../types'
import {
  hasFocusContext,
  configContext,
  selectionContext,
} from '../../state/context'
import { guid } from '../../utils'
import OptionList from '../OptionList'
import ReactFacetedSearchStyles from '../../types/ReactFacetedSearchStyles'
import ErrorMessage from '../ErrorMessage'
import Nemonic from '@/component/types/Nemonic'
import { FUNC_ID } from '@/component/types/Opton'
import {
  FUNCTIONS_TEXT,
  FunctionState,
  addOptionsPlaceholder,
  getCategoryIndex,
  insertOptions,
  matchItems,
  removeOptionsPlaceholder,
  updateOptions,
} from './MatcherEditFunctions'
import './MatcherEdit.css'
import { DataSourceLookup, DataSourceValue, PromiseLookup } from '@/component/types/DataSource'

interface MatcherEditProps {
  matcher?: Matcher
  onMatcherChanged: (matcher: Matcher | null) => void
  onValidate?: (matcher: Matcher) => string | null
  onFocus?: () => void
  onCancel?: () => void
  onEditPrevious: (deleting: boolean) => void
  onEditNext?: () => void
  onChanging?: () => void
  onInsertMatcher?: (matcher: Matcher) => void
  onSetActiveFunction?: (activeFunction: Nemonic) => void
  onDeleteActiveFunction?: () => void
  first: boolean
  allowFunctions?: boolean
  allowFreeText?: boolean
  styles?: ReactFacetedSearchStyles
}


const MatcherEdit = React.forwardRef<HTMLInputElement, MatcherEditProps>(
  (props, ref) => {
    const {
      matcher,
      onMatcherChanged,
      onValidate,
      onFocus,
      onCancel,
      onEditPrevious,
      onEditNext,
      onInsertMatcher,
      first,
      allowFunctions,
      allowFreeText,
      styles,
      onChanging,
      onSetActiveFunction,
      onDeleteActiveFunction
    } = props
    const config = React.useContext<Config>(configContext)
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    const [text, setText] = React.useState<string>(
      matcher
        ? `${!first && config.operators !== 'Simple'
          ? matcher.operator + ' '
          : ''
        }${matcher.comparison}${matcher.text}`
        : '',
    )
    const [comparison, setComparison] = React.useState<string | null>(
      matcher?.comparison ?? null,
    )
    const [operator, setOperator] = React.useState<string | null>(
      matcher?.operator ?? null,
    )
    const [matchText, setMatchText] = React.useState<string | null>(null)
    const key = React.useRef('')
    const [options, setOptions] = React.useState<[string, Option[]][]>([])
    const [totalOptions, setTotalOptions] = React.useState<number>(0)
    const [activeOption, setActiveOption] = React.useState<number | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [notifiedChanging, setNotifiedChaning] =
      React.useState<boolean>(false)
    const controlHasFocus = React.useContext<boolean>(hasFocusContext)
    const selection = React.useContext<Selection>(selectionContext)

    const setTextLine = (op: string | null = null, comp: string | null = null, option: Option | null = null, funcName: string | null = null) => {
      let line = ''
      if (funcName) {
        const func = config.functions?.find(
          (func) => func.name === funcName
        )
        if (func && onSetActiveFunction) {
          onSetActiveFunction(func)
          resetEdit()
        }
        return
      }
      if (op === '(' || op === ')') {
        selectOption(op)
        return
      }
      if (op || operator) {
        line = `${op ?? operator} `
      }
      if (comp || comparison) {
        line = `${line}${comp ?? comparison} `
      }
      if (option) {
        selectOption(option)
      } else {
        line = `${line}${matchText ?? ''}`
        handleTextChange(line)
      }
    }
    React.useEffect(() => {
      if (inputRef.current && controlHasFocus) {
        inputRef.current.focus()
      }
    }, [controlHasFocus])

    React.useEffect(() => {
      setError(null)
    }, [first])

    React.useEffect(() => {
      if (text.length === 0) {
        setActiveOption(null)
      }
    }, [text])

    const resetEdit = () => {
      setText('')
      setOperator(null)
      setComparison(null)
      setMatchText(null)
      setOptions([])
      setTotalOptions(0)
      setActiveOption(null)
    }

    const checkForOperator = (
      searchText: string,
      functionState: FunctionState,
    ): string => {
      if (searchText.length > 2) {
        const symbol = searchText.substring(0, 3)
        if (symbol === 'and') {
          setOperator('and')
          functionState.op = 'and'
          return searchText.substring(3).trim()
        }
      }
      if (searchText.length > 1) {
        const symbol = searchText.substring(0, 2)
        if (symbol === 'or') {
          setOperator('or')
          functionState.op = 'or'
          return searchText.substring(2).trim()
        }
      }
      const symbol = searchText[0]
      if (symbol === config.and || symbol === config.or) {
        setOperator(symbol === config.and ? 'and' : 'or')
        functionState.op = symbol === config.and ? 'and' : 'or'
        return searchText.substring(1).trim()
      }
      return searchText
    }

    const checkForComparison = (searchText: string): string | null => {
      if (searchText.length > 1) {
        const symbolPair = searchText.substring(0, 2)
        if (config.comparisons.includes(symbolPair)) {
          setComparison(symbolPair)
          return searchText.substring(2).trim()
        }
      }
      const symbol = searchText[0]
      if (
        config.operators === 'Complex' &&
        (!selection.activeFunction || !selection.activeFunction.noBrackets) &&
        (symbol === '(' || symbol === ')')
      ) {
        if (matcher && onInsertMatcher && matcher.operator !== symbol) {
          const newMatcher: Matcher = {
            key: guid(),
            operator: symbol,
            comparison: symbol,
            source: '',
            value: '',
            text: '',
          }
          onInsertMatcher(newMatcher)
        } else {
          selectOption(symbol)
        }
        return null
      }
      if (config.comparisons.includes(symbol)) {
        setComparison(symbol)
        return searchText.substring(1).trim()
      }
      return searchText
    }

    const buildOptions = (
      newText: string,
      currentKey: string,
      functionState: FunctionState,
    ) => {
      if (newText.length > 0) {
        let result: string | null = newText.trim()
        if (result.length > 0 && result[0] !== '"') {
          if (
            config.operators !== 'Simple' &&
            (!selection.activeFunction || !selection.activeFunction.noAndOr)
          ) {
            result = checkForOperator(result, functionState)
          }
          result = checkForComparison(result)
          setMatchText(result)
          if (result !== null && result.length > 0) {
            const searchText = result
            if (searchText.length >= (config.searchStartLength ?? 0)) {
              if (allowFunctions && config.functions) {
                buildFunctionOptions(
                  searchText,
                  config.functions,
                  functionState,
                )
              }
              config.dataSources.forEach((ds) => {
                if (
                  (!selection.activeFunction && !ds.functional) ||
                  (selection.activeFunction &&
                    (selection.activeFunction.requiredDataSources?.includes(
                      ds.name,
                    ) ||
                      selection.activeFunction.optionalDataSources?.includes(
                        ds.name,
                      )))
                ) {
                  ds.definitions.forEach((vm) => {
                    if ('source' in vm) {
                      buildListOptions(
                        searchText,
                        ds,
                        vm,
                        currentKey,
                        functionState,
                      )
                    } else {
                      buildExpressionOptions(
                        searchText,
                        ds,
                        vm,
                        currentKey,
                        functionState,
                      )
                    }
                  })
                }
              })
            }
          }
        }
      }
    }

    const buildFunctionOptions = (
      searchText: string,
      numomics: Nemonic[],
      functionState: FunctionState,
    ) => {
      const functions = numomics
        .filter((func) =>
          func.name.toUpperCase().includes(searchText.toUpperCase()),
        )
        .map((func) => {
          return {
            source: FUNC_ID,
            text: func.name,
            value: func.name,
          }
        })
      if (functions.length > 0) {
        functionState.allOptions.push([FUNCTIONS_TEXT, functions])
      }
    }

    const buildListOptions = (
      searchText: string,
      ds: DataSource,
      dsl: DataSourceLookup,
      currentKey: string,
      functionState: FunctionState,
    ) => {
      if (searchText.length >= (dsl.searchStartLength ?? 0)) {
        if (typeof dsl.source === 'function') {
          const promise = dsl.source as PromiseLookup
          setTimeout(() => {
            if (currentKey === key.current) {
              if (config.showWhenSearching) {
                addOptionsPlaceholder(
                  ds,
                  dsl,
                  functionState.allOptions,
                  config.defaultItemLimit,
                  config.dataSources
                )
                updateState(functionState)
              }
              promise(searchText, functionState.op, selection.matchers)
                .then((items) => {
                  if (currentKey === key.current) {
                    if (items.length > 0) {
                      updateOptions(
                        items,
                        ds,
                        dsl,
                        functionState.allOptions,
                        config.defaultItemLimit,
                        config.dataSources,
                      )
                      updateState(functionState)
                    } else if (config.showWhenSearching) {
                      if (removeOptionsPlaceholder(
                        ds,
                        functionState.allOptions
                      )) {
                        updateState(functionState)
                      }
                    }
                  }
                })
            }
          }, config.promiseDelay ?? 1)
        } else {
          if (currentKey === key.current) {
            const items = dsl.source.filter((item) =>
              matchItems(item, dsl, searchText),
            )
            if (items.length > 0) {
              updateOptions(
                items,
                ds,
                dsl,
                functionState.allOptions,
                config.defaultItemLimit,
                config.dataSources,
              )
            }
          }
        }
      }
    }

    const buildExpressionOptions = (
      searchText: string,
      ds: DataSource,
      dsv: DataSourceValue,
      currentKey: string,
      functionState: FunctionState,
    ) => {
      if (
        ((dsv.match instanceof RegExp && searchText.match(dsv.match)) ||
          (typeof dsv.match === 'function' && dsv.match(searchText))) &&
        currentKey === key.current
      ) {
        const value = dsv.value(searchText)
        insertOptions(
          functionState.allOptions,
          ds,
          [{ source: ds.name, value, text: value.toString() }],
          config.dataSources,
        )
      }
    }

    const handleTextChange = (newText: string) => {
      setOperator(null)
      setComparison(null)
      setMatchText(null)

      if (!notifiedChanging && matcher) {
        setNotifiedChaning(true)
        if (onChanging) {
          onChanging()
        }
      }
      const currentKey = guid()
      key.current = currentKey
      const functionState: FunctionState = {
        allOptions: [],
        op: null
      }
      buildOptions(newText, currentKey, functionState)
      setText(newText)
      updateState(functionState)
    }

    const updateState = (functionState: FunctionState) => {
      const { allOptions } = functionState
      setOptions(allOptions)
      let totalCount = 0
      allOptions.forEach(op => totalCount += (op[1].length === 0 ? 1 : op[1].length))
      setTotalOptions(totalCount)
      if (totalCount > 0) {
        if (activeOption === null) {
          setActiveOption(0)
        } else if (activeOption >= totalCount) {
          setActiveOption(totalCount - 1)
        }
      }
    }

    const handleDeleteKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (onEditPrevious && !event.shiftKey && !event.ctrlKey) {
        if (first && onDeleteActiveFunction) {
          onDeleteActiveFunction()
        } else {
          onEditPrevious(true)
        }
        return true
      } else if (onCancel) {
        //not standalone edit
        selectOption()
        return true
      }
      return false
    }

    const handleCancel = () => {
      if (onCancel) {
        onCancel()
      }
      return true
    }

    const handleDeleteOption = () => {
      selectOption()
      return true
    }

    const handleOptionSelection = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      const optionsArray = options.flatMap((pair) => pair[1])
      if (activeOption !== null && optionsArray.length > activeOption) {
        if (optionsArray[activeOption].source === FUNC_ID) {
          const func = config.functions?.find(
            (func) => func.name === optionsArray[activeOption].text,
          )
          if (func && onSetActiveFunction) {
            onSetActiveFunction(func)
            resetEdit()
          }
        } else {
          if (event.shiftKey) {
            insertMatcher(optionsArray[activeOption])
          } else {
            selectOption(optionsArray[activeOption])
          }
        }
        return true
      }
      return false
    }

    const captureFreeText = () => {
      if (allowFreeText) {
        const newMatcher: Matcher = {
          key: guid(),
          operator: '',
          comparison: '"',
          source: 'Free Text',
          value: text.substring(1),
          text: text.substring(1),
        }
        onMatcherChanged(newMatcher)
        resetEdit()
        return true
      }
      return false
    }

    const end = () => {
      if (totalOptions > 0) {
        setActiveOption(totalOptions - 1)
        return true
      }
      return false
    }

    const home = () => {
      if (totalOptions > 0) {
        setActiveOption(0)
        return true
      }
      return false
    }

    const pageDown = () => {
      if (totalOptions > 0) {
        setActiveOption(
          getCategoryIndex(activeOption ?? totalOptions - 1, options),
        )
        return true
      }
      return false
    }

    const pageUp = () => {
      if (totalOptions > 0) {
        setActiveOption(getCategoryIndex(activeOption ?? 0, options, false))
        return true
      }
      return false
    }

    const arrowDown = () => {
      if (activeOption === null) {
        setActiveOption(0)
      } else {
        if (activeOption < totalOptions - 1) {
          setActiveOption(activeOption + 1)
        } else {
          setActiveOption(0)
        }
      }
      return true
    }

    const arrowUp = () => {
      if (activeOption === null) {
        setActiveOption(totalOptions - 1)
      } else {
        if (activeOption > 0) {
          setActiveOption(activeOption - 1)
        } else {
          setActiveOption(totalOptions - 1)
        }
      }
      return true
    }

    const arrowRight = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        inputRef.current &&
        !event.ctrlKey &&
        !event.shiftKey &&
        event.currentTarget.selectionStart ===
        event.currentTarget.value.length &&
        onEditNext
      ) {
        onEditNext()
        return true
      }
      return false
    }

    const arrowLeft = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        inputRef.current &&
        !event.ctrlKey &&
        !event.shiftKey &&
        event.currentTarget.selectionStart === 0
      ) {
        onEditPrevious(false)
        return true
      }
      return false
    }

    const keyPressed = (event: React.KeyboardEvent<HTMLInputElement>) => {
      let stopPropagation = false
      setError(null)
      switch (event.code) {
        case 'ArrowLeft':
          stopPropagation = arrowLeft(event)
          break
        case 'ArrowRight':
          stopPropagation = arrowRight(event)
          break
        case 'ArrowUp':
          stopPropagation = arrowUp()
          break
        case 'ArrowDown':
          stopPropagation = arrowDown()
          break
        case 'PageUp':
          stopPropagation = pageUp()
          break
        case 'PageDown':
          stopPropagation = pageDown()
          break
        case 'Home':
          stopPropagation = home()
          break
        case 'End':
          stopPropagation = end()
          break
        case 'Enter':
        case 'Tab':
          if (text.length > 0 && text[0] === '"') {
            stopPropagation = captureFreeText()
          } else if (options.length > 0 && activeOption !== null) {
            stopPropagation = handleOptionSelection(event)
          } else if (text.length === 0 && matcher) {
            stopPropagation = handleDeleteOption()
          } else if (matcher && onCancel) {
            stopPropagation = handleCancel()
          }
          break
        case 'Backspace':
          if (text.length === 0) {
            stopPropagation = handleDeleteKey(event)
          }
          break
      }
      if (stopPropagation) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const validateOperator = (option: Option): string | null => {
      const ds = config.dataSources.find((d) => d.name === option.source)
      if (ds) {
        if (comparison !== null && !ds.comparisons.includes(comparison)) {
          const idx = text.indexOf(comparison)
          if (idx !== -1 && inputRef.current) {
            inputRef.current.selectionStart = idx
            inputRef.current.selectionEnd = idx + 1
          }
          return `Compairson (${comparison}) isn't valid for ${ds.name}.`
        }
      }
      return null
    }

    const validate = (option?: Option | '(' | ')'): Matcher | null | false => {
      if (option !== '(' && option !== ')' && option) {
        const err = validateOperator(option)
        if (err) {
          setError(err)
          return false
        }
      }
      const newMatcher: Matcher | null = option
        ? {
          key: matcher?.key ?? guid(),
          operator: option === ')' ? '' : operator ?? 'and',
          comparison: option === '(' || option === ')' ? option : comparison ?? config.defaultComparison,
          source: typeof option === 'object' ? option.source : '',
          value: typeof option === 'object' ? option.value : '',
          text: typeof option === 'object' ? option.text : '',
        }
        : null
      if (newMatcher && onValidate) {
        const err = onValidate(newMatcher)
        if (err) {
          setError(err)
          return false
        }
      }
      return newMatcher
    }

    const insertMatcher = (option?: Option | '(' | ')') => {
      const newMatcher = validate(option)
      if (newMatcher !== false && newMatcher !== null && onInsertMatcher) {
        onInsertMatcher(newMatcher)
      }
    }

    const selectOption = (option?: Option | '(' | ')', insert: boolean = false) => {
      const newMatcher = validate(option)
      if (newMatcher !== false) {
        if (insert && onInsertMatcher && newMatcher) {
          onInsertMatcher(newMatcher)
        } else {
          onMatcherChanged(newMatcher)
          resetEdit()
        }
      }
    }

    const gotFocus = () => {
      if (onFocus) {
        onFocus()
      }
    }


    return (
      <div className="matcherEditMain" style={styles?.matcherEdit}>
        {error && (
          <ErrorMessage
            errorMessage={error}
            onErrorAcknowledged={() => setError(null)}
            style={styles?.errorMessage}
          />
        )}
        <input
          id={(matcher?.key ?? 'edit') + '_input'}
          style={styles?.input}
          ref={(node) => {
            inputRef.current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ref.current = node
            }
          }}
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          onFocus={gotFocus}
          onKeyDown={keyPressed}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          type="text"
          placeholder="..."
        />
        {controlHasFocus && (
          <OptionList
            options={options}
            activeOption={activeOption}
            onSelectActiveOption={setActiveOption}
            onSelectOption={selectOption}
            styles={styles}
            onSelectFunction={func => setTextLine(null, null, null, func)}
            onSelectComparison={comp => setTextLine(null, comp)}
            onSelectOperator={op => setTextLine(op)}
            onSelectText={option => setTextLine(null, null, option)}
          />
        )}
      </div>
    )
  },
)

MatcherEdit.displayName = 'MatcherEdit'

export default MatcherEdit
