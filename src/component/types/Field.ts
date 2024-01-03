import Matcher, { Value } from './Matcher'

export type SourceItem = string | object

export const defaultComparison: string[] = ['=', '!']
export const stringComparisons: string[] = ['=', '!', '*', '!*', '<*', '>*']
export const numberComparisons: string[] = ['=', '>', '<', '>=', '<=', '!']
export type PromiseLookup = ((
  text: string,
  op: 'or' | 'and' | null,
  matchers: Matcher[],
) => Promise<SourceItem[]>)

export interface FieldLookup {
  source:
  | SourceItem[]
  | PromiseLookup
  matchOnPaste?: boolean | ((text: string) => Promise<SourceItem | null>)
  textGetter?: (item: object) => string
  valueGetter?: (item: object) => Value
  ignoreCase?: boolean
  itemLimit?: number
  searchStartLength?: number
}

export interface FieldValue {
  match: RegExp | ((text: string) => boolean)
  value: (text: string) => Value
  matchOnPaste?: boolean
}

type FieldMatch = FieldLookup | FieldValue

export interface Field {
  name: string //field name
  title: string //title
  comparisons: string[] //comparions avilable for field
  precedence?: number //precendence (higher is higher in the list)
  selectionLimit?: number //max items that can be selected
  functional?: boolean //is field use with functions
  hideOnShortcut?: boolean //hide on shortcut bar
  definitions: FieldMatch[] //match definitions (promises,lists,regxe,functions`)
  defaultOperator?: string //default operator
}

export default Field
