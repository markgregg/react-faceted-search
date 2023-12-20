export type Value = string | number | Date

export default interface Matcher {
  key: string
  operator: string
  comparison: string
  source: string
  value: Value
  text: string
  changing?: boolean
}
