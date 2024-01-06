import Field from './Field'
import Nemonic from './Nemonic'

export type OperatorDisplay = 'Names' | 'Symbols'
export interface ComparisonItem {
  symbol: string
  description: string
}

export default interface Config {
  fields: Field[] //active fields
  functions?: Nemonic[] //active nemonics
  defaultComparison: string //default comparison, usually =
  and: string //and symbol
  or: string //or symbol
  comparisons: string[] //available comparisons (used across all fields)
  comparisonDescriptions: ComparisonItem[] //descriptions of comparions
  defaultItemLimit: number //default limit for items
  operators: 'Simple' | 'AgGrid' | 'Complex' //opertor complexity (and, and/or, and/or/bracket)
  operatorDisplay?: OperatorDisplay // show opertor names or symbols
  maxMatcherWidth?: number
  maxDropDownHeight?: number //maximium heigt of dropdown
  searchStartLength?: number //min characters before search starts
  promiseDelay?: number //delay before issuing promises to server
  hideHelp?: boolean //hide help
  showWhenSearching?: boolean //show placeholders when searching
  showCategory?: boolean
  categoryPosition?: 'top' | 'left'
}

