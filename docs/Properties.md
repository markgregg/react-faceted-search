# Properties

```js
interface ReactFacetedSearchProps {
  matchers?: Matcher[]
  fields: Field[]
  functions?: Nemonic[]
  defaultComparison?: string
  comparisonDescriptons?: ComparisonItem[]
  and?: string
  or?: string
  defaultItemLimit?: number
  operators?: 'Simple' | 'AgGrid' | 'Complex'
  onMatchersChanged?: (matchers: Matcher[]) => void
  onComplete?: (matchers: Matcher[], func?: string) => void
  onCompleteError?: (
    func: string,
    errorMessage: string,
    missingFields?: string[],
  ) => void
  clearIcon?: React.ReactElement
  maxDropDownHeight?: number
  searchStartLength?: number
  showCategories?: boolean
  categoryPosition?: 'top' | 'left'
  hideToolTip?: boolean
  allowFreeText?: boolean
  pasteMatchTimeout?: number
  pasteFreeTextAction?: FreTextFunc
  promiseDelay?: number
  showWhenSearching?: boolean
  hideHelp?: boolean
  styles?: ReactFacetedSearchStyles
}
```

### matchers
An optional array of Matchers, required if state is managed outside of the control

### fields
An array of Feilds, fields control the options that appear and how they appear

### functions
An array of functions - functions enable fields to be combined into function calls

###  defaultComparison
The default comparison if one is not entered, usually =

### comparisonDescriptons
An array of descriptions for available comparisons, they will be shown in the comparison dropdown list

### and
symbol to use for and defualts to &

### or
symbol to use for or, defualts to |

### defaultItemLimit
default item limit for all feilds

### operators
'Simple' = and
'AgGrid' = and/or
'Complex' = and/or/BRACKETS

### onMatchersChanged
Matcher changed callback, required if state is managed outside of the control

### onComplete
If not use a managed control, on compelte is called when the user hits return

### onCompleteError
Called if there is an error when trying to compelte

### clearIcon
Icon to use for clear

### maxDropDownHeight
Maximium height of the dropdown list

### searchStartLength
Nubmer of characters required for searching

### showCategories
Show the matcher catagory

### categoryPosition
The position at which the category is shown

### hideToolTip
Hide tooltips

### allowFreeText
Allow free text to be entered. Free text is text surrounded by "

### pasteMatchTimeout
Time after which the attempt to match items following a paste stops

### pasteFreeTextAction
How to handle free text when pasting

### promiseDelay
Delay before sending promises to fetch items. The longer this is set to the few requests sent. The contorl only ever sents the most recent promise.

### showWhenSearching
If true, shows the user the control is searching for items

### hideHelp
Hide help

### styles
See styles