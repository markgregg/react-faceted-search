import { Option } from '@/component/types'
import Field, {
  FieldLookup,
  SourceItem,
} from '@/component/types/Field'
import { getText, getValue } from '@/component/utils'

export interface CategoryOptions {
  category: string
  options: Option[]
  delayedPromise?: boolean
}

export interface FlattenedOption extends Option {
  actualIndex: number
  groupIndex: number
}

export const FUNCTIONS_TEXT = 'Functions'

export interface FunctionState {
  allOptions: CategoryOptions[]
  op: 'or' | 'and' | null
  comparison: string | null
}

const limitOptions = (
  dsl: FieldLookup,
  options: Option[],
  defaultItemLimit: number,
): Option[] => {
  if (options.length > (dsl.itemLimit ?? defaultItemLimit)) {
    return options.slice(0, dsl.itemLimit ?? defaultItemLimit)
  }
  return options
}

const getInsertIndex = (
  allOptions: CategoryOptions[],
  ds: Field,
  fields: Field[],
): number => {
  if (ds.precedence) {
    const dsp = ds.precedence
    return allOptions.findIndex((item) => {
      if (item.category === FUNCTIONS_TEXT) return false
      const ds2 = fields.find((dsc) => dsc.title === item.category)
      return dsp > (ds2?.precedence ?? 0)
    })
  }
  return -1
}

export const mapOptions = (
  items: SourceItem[],
  name: string,
  dsl: FieldLookup,
): Option[] => {
  return items.map((item) => {
    return {
      source: name,
      value: getValue(item, dsl),
      text: getText(item, dsl)
    }
  })
}

export const addOptionsPlaceholder = (
  ds: Field,
  dsl: FieldLookup,
  allOptions: CategoryOptions[],
  defaultItemLimit: number,
  fields: Field[]
) => {
  if (!allOptions.find(opt => opt.category === ds.title && opt.options.length > 0)) {
    addOptions(allOptions, ds, dsl, [], defaultItemLimit, fields)
  }
}

export const removeOptionsPlaceholder = (
  ds: Field,
  allOptions: CategoryOptions[]
) => {
  const index = allOptions.findIndex(opt => opt.category === ds.title && opt.options.length === 0)
  if (index !== -1) {
    allOptions.splice(index, 1)
    return true
  }
  return false
}


export const updateOptions = (
  items: SourceItem[],
  ds: Field,
  dsl: FieldLookup,
  allOptions: CategoryOptions[],
  defaultItemLimit: number,
  fields: Field[],
  delayedPromise?: boolean
): number => {
  let options: Option[] = mapOptions(items, ds.name, dsl)
  if (options.length > 0) {
    options = limitOptions(dsl, options, defaultItemLimit)
    addOptions(allOptions, ds, dsl, options, defaultItemLimit, fields, delayedPromise)
  }
  return options.length
}

const combineOptions = (
  ds: FieldLookup,
  list1: Option[],
  list2: Option[],
  defaultItemLimit: number,
): Option[] => {
  return limitOptions(
    ds,
    list1
      .concat(list2)
      .filter(
        (opt, index, array) =>
          array.findIndex((o) => o.value === opt.value) === index,
      ),
    defaultItemLimit,
  )
}

export const addOptions = (
  allOptions: CategoryOptions[],
  ds: Field,
  dsl: FieldLookup,
  options: Option[],
  defaultItemLimit: number,
  fields: Field[],
  delayedPromise?: boolean
) => {
  const currentEntry = allOptions.find((entry) => entry.category === ds.title)
  if (currentEntry) {
    currentEntry.delayedPromise = delayedPromise
    currentEntry.options = combineOptions(
      dsl,
      currentEntry.options,
      options,
      defaultItemLimit,
    )
    return
  }
  insertOptions(allOptions, ds, options, fields, delayedPromise)
}

export const insertOptions = (
  allOptions: CategoryOptions[],
  ds: Field,
  options: Option[],
  fields: Field[],
  delayedPromise?: boolean
) => {
  const index = getInsertIndex(allOptions, ds, fields)
  if (index !== -1) {
    allOptions.splice(index, 0, { category: ds.title, options, delayedPromise })
  } else {
    allOptions.push({ category: ds.title, options, delayedPromise })
  }
}

export const matchItems = (
  item: SourceItem,
  ds: FieldLookup,
  searchText: string,
) => {
  const actualIem =
    ds.textGetter && typeof item === 'object'
      ? ds.textGetter(item)
      : item.toString()
  return ds.ignoreCase
    ? actualIem.toUpperCase().includes(searchText.toUpperCase())
    : actualIem.includes(searchText)
}

const getPosition = (index: number, options: CategoryOptions[]) => {
  return index === 0
    ? 0
    : options
      .slice(0, index)
      .map((entry) => entry.options.length)
      .reduce((prev, curr) => prev + curr)
}

