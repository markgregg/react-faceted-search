export type Value = string | number | Date

export default interface Matcher {
  key: string //unique identifer
  operator: string //operator
  comparison: string //comparison
  source: string //field
  value: Value //value
  text: string //text displsay
  changing?: boolean //is changing
}
