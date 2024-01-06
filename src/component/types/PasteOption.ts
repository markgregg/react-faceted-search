import { Matcher, Nemonic } from "."

export default interface PasteOption {
  key: string
  function: Nemonic
  matchers: Matcher[]
}
