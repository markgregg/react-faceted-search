import * as React from 'react'
import { Matcher, Option, Config, Selection, Field } from '../../types'
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
  CategoryOptions,
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
import { FieldLookup, FieldValue, PromiseLookup } from '@/component/types/Field'

interface MatcherEditProps {
  matcher?: Matcher  //matcher to edit if contained in a view
  onMatcherChanged: (matcher: Matcher | null) => void //notify that the matcher has changed
  onValidate?: (matcher: Matcher) => string | null //request for parent to validate
  onFocus?: () => void //has focus
  onCancel?: () => void //cancel editing
  onEditPrevious: (deleting: boolean) => void  //command to parent
  onEditNext?: () => void //command to parent
  onChanging?: () => void //notify parent the matcher is changing
  onInsertMatcher?: (matcher: Matcher) => void //insert a matcher
  onSetActiveFunction?: (activeFunction: Nemonic) => void //set a function as the active function
  onDeleteActiveFunction?: () => void //delete active function
  first: boolean //is the match the first
  allowFunctions?: boolean //allow functions 
  allowFreeText?: boolean //allow free text
  styles?: ReactFacetedSearchStyles //styles
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
    const [options, setOptions] = React.useState<CategoryOptions[]>([])
    const [totalOptions, setTotalOptions] = React.useState<number>(0)
    const [activeOption, setActiveOption] = React.useState<number | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [notifiedChanging, setNotifiedChaning] =
      React.useState<boolean>(false)
    const controlHasFocus = React.useContext<boolean>(hasFocusContext)
    const selection = React.useContext<Selection>(selectionContext)

    /*
          @param {string} op: operator to set input
          @param {string} comp: comparison to set input
          @param {Option} option: text option to set input
          @param {string} funcName: function to set input
        */
    const setTextLine = (
      op: string | null = null,
      comp: string | null = null,
      option: Option | null = null,
      funcName: string | null = null
    ) => {
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

    //if we have an input ref and control has focus, set input focus
    React.useEffect(() => {
      if (inputRef.current && controlHasFocus) {
        inputRef.current.focus()
      }
    }, [controlHasFocus])

    React.useEffect(() => {
      setError(null)
    }, [first])

    //if text is blank, then remove active option
    React.useEffect(() => {
      if (text.length === 0) {
        setActiveOption(null)
      }
    }, [text])

    //reset state
    const resetEdit = () => {
      setText('')
      setOperator(null)
      setComparison(null)
      setMatchText(null)
      setOptions([])
      setTotalOptions(0)
      setActiveOption(null)
    }

    /*
      @param {newText} searchText: text from the input minus comparion and operator
      @param {FunctionState} functionState: current function state
    */
    const checkForOperator = (
      searchText: string,
      functionState: FunctionState,
    ): string => {
      //cehcks for and/or
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

    /*
      @param {newText} searchText: text from the input minus comparion and operator
      @param {FunctionState} functionState: current function state
    */
    const checkForComparison = (
      searchText: string,
      funtionState: FunctionState
    ): string | null => {
      if (searchText.length > 1) {
        //if serach text greater than 1 character, check for 2 charater comparisons
        const symbolPair = searchText.substring(0, 2)
        if (config.comparisons.includes(symbolPair)) {
          setComparison(symbolPair)
          funtionState.comparison = symbolPair
          return searchText.substring(2).trim()
        }
      }
      //if no 2 character matches, assume it is a 1 character comparison
      const symbol = searchText[0]
      if (
        config.operators === 'Complex' &&
        (!selection.activeFunction || !selection.activeFunction.noBrackets) &&
        (symbol === '(' || symbol === ')')
      ) {
        //if the type is complex and barackets supported check for brackets
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
      //check for 1 character comparisons
      if (config.comparisons.includes(symbol)) {
        setComparison(symbol)
        funtionState.comparison = symbol
        return searchText.substring(1).trim()
      }
      return searchText
    }

    /*
      @param {newText} searchText: text from the input minus comparion and operator
      @param {string} currentKey: key of the current render loop
      @param {FunctionState} functionState: current function state
    */
    const buildFieldOptions = (
      searchText: string,
      currentKey: string,
      functionState: FunctionState,
    ) => {
      //check that the text length is greater than the defualt mininum seearch length
      if (searchText.length >= (config.searchStartLength ?? 0)) {
        //if we support functions check if we have function matches
        if (allowFunctions && config.functions) {
          buildFunctionOptions(
            searchText,
            config.functions,
            functionState,
          )
        }
        //loop the field definitions
        config.fields.forEach((ds) => {
          //if a function is active, only allow fields for functions
          //check that field supports current comparison
          if (
            ((!selection.activeFunction && !ds.functional) ||
              (selection.activeFunction &&
                (selection.activeFunction.requiredFields?.includes(
                  ds.name,
                ) ||
                  selection.activeFunction.optionalFields?.includes(
                    ds.name,
                  )))) &&
            (!functionState.comparison || ds.comparisons.includes(functionState.comparison))
          ) {
            ds.definitions.forEach((vm) => {
              if ('source' in vm) {
                //is field a source type (promise/list)
                buildListOptions(
                  searchText,
                  ds,
                  vm,
                  currentKey,
                  functionState,
                )
              } else {
                //or a value type (regex/function)
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

    /*
      @param {newText} searchText: text from the input minus comparion and operator
      @param {string} currentKey: key of the current render loop
      @param {FunctionState} functionState: current function state
    */
    const buildOptions = (
      newText: string,
      currentKey: string,
      functionState: FunctionState,
    ): string => {
      if (newText.length > 0) {
        let result: string | null = newText.trim()
        if (result.length > 0 && result[0] !== '"') {
          if (
            config.operators !== 'Simple' &&
            (!selection.activeFunction || !selection.activeFunction.noAndOr)
          ) {
            result = checkForOperator(result, functionState)
          }
          result = checkForComparison(result, functionState)
          setMatchText(result)
          //if result is null or 0 then stop - if a bracket has been inserted
          if (result !== null && result.length > 0) {
            buildFieldOptions(result, currentKey, functionState)
            return newText
          }
        }
      }
      return '' //we have no text so update input to match
    }

    /*
      @param {string} searchText: text from the input minus comparion and operator
      @param {numomics} Nemonic: function nemonics
      @param {FunctionState} functionState: current function state
    */
    const buildFunctionOptions = (
      searchText: string,
      numomics: Nemonic[],
      functionState: FunctionState,
    ) => {
      //add options for any functions that match the search text
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
        functionState.allOptions.push({ category: FUNCTIONS_TEXT, options: functions })
      }
    }

    /*
      @param {string} searchText: text from the input minus comparion and operator
      @param {PromiseLookup} promise: promise to call
      @param {Field} ds: field in which to search for options
      @param {FieldLookup} dsl: value definition in which to search for options
      @param {string} currentKey: key of the current render loop
      @param {FunctionState} functionState: current function state
    */
    const buildPromiseOptions = (
      searchText: string,
      promise: PromiseLookup,
      ds: Field,
      dsl: FieldLookup,
      currentKey: string,
      functionState: FunctionState,
    ) => {
      //set a timer, this enables us to buffer calls
      setTimeout(() => {
        //if the current key does not match reference key, ignore. This allows only the last promise to run
        //so if someone types before the promise delay is over, the promise will be ignore.
        //It reduces the promise calls to the server to a mininum
        if (currentKey === key.current) {
          //if the option to show when searching is on, show a place holder in the dropdown list
          if (config.showWhenSearching) {
            addOptionsPlaceholder(
              ds,
              dsl,
              functionState.allOptions,
              config.defaultItemLimit,
              config.fields
            )
            updateState(functionState)
          }
          const pStart = Date.now()
          promise(searchText, functionState.op, selection.matchers.filter(m => m.key !== matcher?.key))
            .then((items) => {
              //check that the key is current else ignore the promise
              if (currentKey === key.current) {
                const elapses = Date.now() - pStart
                if (items.length > 0) {
                  //if we have options then update
                  updateOptions(
                    items,
                    ds,
                    dsl,
                    functionState.allOptions,
                    config.defaultItemLimit,
                    config.fields,
                    elapses > 500 && true //if the promise took longer than 500ms animate the appearance
                  )
                  updateState(functionState)
                  //if we have animatged the appearance, remove animation after it has completed.
                  elapses > 500 && setTimeout(() => {
                    //check that the user has typed text since the timer
                    if (currentKey === key.current) {
                      functionState.allOptions.forEach(fs => {
                        if (fs.category === ds.title) {
                          fs.delayedPromise = false
                        }
                      })
                      updateState(functionState)
                    }
                  }, 400)
                } else if (config.showWhenSearching) {
                  //if we haven't processed the promise, remove the placeholder
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
    }

    /*
      @param {string} searchText: text from the input minus comparion and operator
      @param {Field} ds: field in which to search for options
      @param {FieldLookup} dsl: value definition in which to search for options
      @param {string} currentKey: key of the current render loop
      @param {FunctionState} functionState: current function state
    */
    const buildListOptions = (
      searchText: string,
      ds: Field,
      dsl: FieldLookup,
      currentKey: string,
      functionState: FunctionState,
    ) => {
      if (searchText.length >= (dsl.searchStartLength ?? 0)) {
        if (typeof dsl.source === 'function') {
          //if source is a function then call the promise
          const promise = dsl.source as PromiseLookup
          buildPromiseOptions(
            searchText,
            promise,
            ds,
            dsl,
            currentKey,
            functionState
          )
        } else {
          //if current key matches the reference key (set in current render loop) then process list options
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
                config.fields,
              )
            }
          }
        }
      }
    }

    /*
      @param {string} searchText: text from the input minus comparion and operator
      @param {Field} ds: field in which to search for options
      @param {Field} dsv: value definition in which to search for options
      @param {string} currentKey: key of the current render loop
      @param {FunctionState} functionState: current function state
    */
    const buildExpressionOptions = (
      searchText: string,
      ds: Field,
      dsv: FieldValue,
      currentKey: string,
      functionState: FunctionState,
    ) => {
      if (
        // expression or value match
        ((dsv.match instanceof RegExp && searchText.match(dsv.match)) ||
          (typeof dsv.match === 'function' && dsv.match(searchText))) &&
        currentKey === key.current
      ) {
        const value = dsv.value(searchText)
        insertOptions(
          functionState.allOptions,
          ds,
          [{ source: ds.name, value, text: value.toString() }],
          config.fields,
        )
      }
    }

    /*
      @param {string} newText: text from the input control
    */
    const handleTextChange = (newText: string) => {
      //set state items to null
      setOperator(null)
      setComparison(null)
      setMatchText(null)

      if (!notifiedChanging && matcher) {
        //notify parent the edit element is being edited
        setNotifiedChaning(true)
        if (onChanging) {
          onChanging()
        }
      }
      const currentKey = guid() // generate a unique key
      key.current = currentKey // set the key into the reference (outside of the render loop)
      const functionState: FunctionState = { //create a function state object used to pass state between functions
        allOptions: [],
        op: null,
        comparison: null
      }
      const updateText = buildOptions(newText, currentKey, functionState) //build options
      setText(updateText) //update the input field
      updateState(functionState) //update the options set via static lists or expressions
    }

    /*
      @param {FunctionState} functionState: current function state
    */
    const updateState = (functionState: FunctionState) => {
      //updates the options from the function state
      const { allOptions } = functionState
      setOptions(allOptions)
      let totalCount = 0
      allOptions.forEach(op => totalCount += (op.options.length === 0 ? 1 : op.options.length))
      setTotalOptions(totalCount)
      if (totalCount > 0) {
        if (activeOption === null) {
          setActiveOption(0)
        } else if (activeOption >= totalCount) {
          setActiveOption(totalCount - 1)
        }
      }
    }

    /*
      @param {React.KeyboardEvent<HTMLInputElement>} event: keybord event
    */
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

    /*
      @param {React.KeyboardEvent<HTMLInputElement>} event: keybord event
    */
    const handleOptionSelection = (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      const optionsArray = options.flatMap((opts) => opts.options)
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

    /*
      @param {React.KeyboardEvent<HTMLInputElement>} event: keybord event
    */
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

    /*
      @param {React.KeyboardEvent<HTMLInputElement>} event: keybord event
    */
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

    /*
      @param {React.KeyboardEvent<HTMLInputElement>} event: keybord event
    */
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

    /*
      @param {Option>} option: option to validate
    */
    const validateComparison = (option: Option): string | null => {
      //validates that the comparison is valid for the option
      const ds = config.fields.find((d) => d.name === option.source)
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

    /*
      @param {Option>} option: option to validate
    */
    const validate = (option?: Option | '(' | ')'): Matcher | null | false => {
      //validate comparison
      if (option !== '(' && option !== ')' && option) {
        const err = validateComparison(option)
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
        //call parent to validate in the context of the other matchers
        const err = onValidate(newMatcher)
        if (err) {
          setError(err)
          return false
        }
      }
      return newMatcher
    }

    /*
      @param {Option>} option: option to insert
    */
    const insertMatcher = (option?: Option | '(' | ')') => {
      const newMatcher = validate(option)
      if (newMatcher !== false && newMatcher !== null && onInsertMatcher) {
        onInsertMatcher(newMatcher)
      }
    }

    /*
      @param {Option>} option: option to select
    */
    const selectOption = (option?: Option | '(' | ')') => {
      const newMatcher = validate(option)
      if (newMatcher !== false) {
        onMatcherChanged(newMatcher)
        resetEdit()
      }
    }

    const gotFocus = () => {
      if (onFocus && !matcher) {
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
            onSelectOption={(option, insert) => insert ? insertMatcher(option) : selectOption(option)}
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
