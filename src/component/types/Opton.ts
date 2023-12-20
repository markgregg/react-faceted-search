import { Value } from './Matcher'

export const FUNC_ID = '~~func~~'
export default interface Option {
  source: string
  value: Value
  text: string
}
