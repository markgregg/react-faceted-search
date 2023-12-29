import DataSource from './DataSource'
import Nemonic from './Nemonic'

export type OperatorDisplay = 'Names' | 'Symbols'
export interface ComparisonItem {
  symbol: string
  description: string
}

export default interface Config {
  dataSources: DataSource[]
  functions?: Nemonic[]
  defaultComparison: string
  and: string
  or: string
  comparisons: string[]
  comparisonDescriptions: ComparisonItem[]
  defaultItemLimit: number
  operators: 'Simple' | 'AgGrid' | 'Complex'
  operatorDisplay?: OperatorDisplay
  maxDropDownHeight?: number
  minStaticListHeight?: number
  maxStaticListHeight?: number
  searchStartLength?: number
  promiseDelay?: number
  showWhenSearching?: boolean
}
