import { SourceItem, Value } from "./types"
import { DataSourceLookup } from "./types/DataSource"

export const guid = (): string => {
  const gen = (n?: number): string => {
    const rando = (): string => {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    let r = ''
    let i = 0
    n = n ? n : 1
    while (i < n) {
      r += rando()
      i++
    }
    return r
  }
  return `${gen(2)}-${gen()}-${gen()}-${gen()}-${gen(3)}`
}

export const isUnique = (
  value: string,
  index: number,
  array: string[],
): boolean => {
  return array.indexOf(value) === index
}

export const getValue = (
  item: SourceItem,
  dsl: DataSourceLookup
): Value => {
  return dsl.valueGetter && typeof item === 'object'
    ? dsl.valueGetter(item)
    : item.toString()
}

export const getText = (
  item: SourceItem,
  dsl: DataSourceLookup
): string => {
  return dsl.textGetter && typeof item === 'object'
    ? dsl.textGetter(item)
    : item.toString()
}
