import Config, { OperatorDisplay } from './Config'
import DataSource, {
  SourceItem,
  defaultComparison,
  stringComparisons,
  numberComparisons,
} from './DataSource'
import Matcher, { Value } from './Matcher'
import MutliSelectStyles from './ReactFacetedSearchStyles'
import Option, { FUNC_ID } from './Opton'
import Nemonic, { FreTextFunc } from './Nemonic'
import Selection from './Selection'

export type {
  Config,
  DataSource,
  Matcher,
  MutliSelectStyles,
  Option,
  Value,
  OperatorDisplay,
  SourceItem,
  Nemonic,
  Selection,
  FreTextFunc,
}

export { defaultComparison, stringComparisons, numberComparisons, FUNC_ID }
