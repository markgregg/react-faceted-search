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

export interface DataSourceLookup {
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

export interface DataSourceValue {
  match: RegExp | ((text: string) => boolean)
  value: (text: string) => Value
  matchOnPaste?: boolean
}

type DataSourceMatch = DataSourceLookup | DataSourceValue

export interface DataSource {
  name: string
  title: string
  comparisons: string[]
  precedence?: number
  selectionLimit?: number
  functional?: boolean
  hideOnShortcut?: boolean
  definitions: DataSourceMatch[]
  defaultOperator?: string
}

export default DataSource
