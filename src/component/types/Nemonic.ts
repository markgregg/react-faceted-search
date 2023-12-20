import { Matcher } from '.'

export type FreTextFunc = 'Original' | 'Individual' | 'Combined' | 'Discard'

export default interface Nemonic {
  name: string
  requiredDataSources?: string[]
  optionalDataSources?: string[]
  noAndOr?: boolean
  noBrackets?: boolean
  allowFreeText?: boolean
  pasteFreeTextAction?: FreTextFunc
  validate?: (matchers: Matcher[]) => string | null
}
