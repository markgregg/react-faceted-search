import { Matcher } from '.'

export type FreTextFunc = 'Original' | 'Individual' | 'Combined' | 'Discard'

export default interface Nemonic {
  name: string //function name
  requiredFields?: string[] //fields required
  optionalFields?: string[] //optional fields
  noAndOr?: boolean //does not allow and/or
  noBrackets?: boolean //does not allow brackets
  allowFreeText?: boolean //allows free text
  pasteFreeTextAction?: FreTextFunc //what to do with free text when pasted
  validate?: (matchers: Matcher[]) => string | null //validation function
}
