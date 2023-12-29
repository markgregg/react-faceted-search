import Config, { OperatorDisplay } from './Config'
import DataSource, {
  DataSourceLookup,
  DataSourceValue,
  SourceItem,
  defaultComparison,
  stringComparisons,
  numberComparisons,
} from './DataSource'
import Matcher, { Value } from './Matcher'
import ReactFacetedSearchStyles from './ReactFacetedSearchStyles'
import Option, { FUNC_ID } from './Opton'
import Nemonic, { FreTextFunc } from './Nemonic'
import Selection from './Selection'

export type {
  Config,
  DataSource,
  DataSourceLookup,
  DataSourceValue,
  Matcher,
  ReactFacetedSearchStyles,
  Option,
  Value,
  OperatorDisplay,
  SourceItem,
  Nemonic,
  Selection,
  FreTextFunc,
}

export { defaultComparison, stringComparisons, numberComparisons, FUNC_ID }
