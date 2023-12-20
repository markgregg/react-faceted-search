import { Matcher } from '.'
import Nemonic from './Nemonic'

export default interface Selection {
  matchers: Matcher[]
  activeFunction: Nemonic | null
}
