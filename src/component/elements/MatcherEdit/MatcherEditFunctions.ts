import { Option } from '@/component/types'
import DataSource, {
  DataSourceLookup,
  SourceItem,
} from '@/component/types/DataSource'
import { getText, getValue } from '@/component/utils'

export const FUNCTIONS_TEXT = 'Functions'

const limitOptions = (
  dsl: DataSourceLookup,
  options: Option[],
  defaultItemLimit: number,
): Option[] => {
  if (options.length > (dsl.itemLimit ?? defaultItemLimit)) {
    return options.slice(0, dsl.itemLimit ?? defaultItemLimit)
  }
  return options
}

const getInsertIndex = (
  allOptions: [string, Option[]][],
  ds: DataSource,
  dataSources: DataSource[],
): number => {
  if (ds.precedence) {
    const dsp = ds.precedence
    return allOptions.findIndex((item) => {
      if (item[0] === FUNCTIONS_TEXT) return false
      const ds2 = dataSources.find((dsc) => dsc.title === item[0])
      return dsp > (ds2?.precedence ?? 0)
    })
  }
  return -1
}

export const mapOptions = (
  items: SourceItem[],
  name: string,
  dsl: DataSourceLookup,
): Option[] => {
  return items.map((item) => {
    return {
      source: name,
      value: getValue(item, dsl),
      text: getText(item, dsl)
    }
  })
}

export const updateOptions = (
  items: SourceItem[],
  ds: DataSource,
  dsl: DataSourceLookup,
  allOptions: [string, Option[]][],
  defaultItemLimit: number,
  dataSources: DataSource[],
): number => {
  let options: Option[] = mapOptions(items, ds.name, dsl)
  if (options.length > 0) {
    options = limitOptions(dsl, options, defaultItemLimit)
    addOptions(allOptions, ds, dsl, options, defaultItemLimit, dataSources)
  }
  return options.length
}

const combineOptions = (
  ds: DataSourceLookup,
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
  allOptions: [string, Option[]][],
  ds: DataSource,
  dsl: DataSourceLookup,
  options: Option[],
  defaultItemLimit: number,
  dataSources: DataSource[],
) => {
  const currentEntry = allOptions.find((entry) => entry[0] === ds.title)
  if (currentEntry) {
    currentEntry[1] = combineOptions(
      dsl,
      currentEntry[1],
      options,
      defaultItemLimit,
    )
    return
  }
  insertOptions(allOptions, ds, options, dataSources)
}

export const insertOptions = (
  allOptions: [string, Option[]][],
  ds: DataSource,
  options: Option[],
  dataSources: DataSource[],
) => {
  const index = getInsertIndex(allOptions, ds, dataSources)
  if (index !== -1) {
    allOptions.splice(index, 0, [ds.title, options])
  } else {
    allOptions.push([ds.title, options])
  }
}

export const matchItems = (
  item: SourceItem,
  ds: DataSourceLookup,
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

const getPosition = (index: number, options: [string, Option[]][]) => {
  return index === 0
    ? 0
    : options
      .slice(0, index)
      .map((entry) => entry[1].length)
      .reduce((prev, curr) => prev + curr)
}

export const getCategoryIndex = (
  currentIndex: number,
  options: [string, Option[]][],
  forward = true,
) => {
  let count = 0
  const index = options.findIndex((entry) => {
    const [, opts] = entry
    const outcome = currentIndex >= count && currentIndex < count + opts.length
    count += opts.length
    return outcome
  })
  return getPosition(
    forward
      ? index < options.length - 1
        ? index + 1
        : 0
      : index > 0
        ? index - 1
        : options.length - 1,
    options,
  )
}
