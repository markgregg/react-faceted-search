import Config, { OperatorDisplay } from './Config'
import Field, {
  FieldLookup,
  FieldValue,
  SourceItem,
  defaultComparison,
  stringComparisons,
  numberComparisons,
} from './Field'
import Matcher, { Value } from './Matcher'
import ReactFacetedSearchStyles from './ReactFacetedSearchStyles'
import Option, { FUNC_ID } from './Opton'
import Nemonic, { FreTextFunc } from './Nemonic'
import Selection from './Selection'

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
  Selection,
  FreTextFunc,
}

export { defaultComparison, stringComparisons, numberComparisons, FUNC_ID }
