import Matcher from '../component/types/Matcher'
import Config from '../component/types/Config'
import DataSource, {
  defaultComparison,
  numberComparisons,
  stringComparisons,
} from '../component/types/DataSource'

const matcherAnd: Matcher = {
  key: 'test',
  operator: '&',
  comparison: '=',
  source: 'test',
  value: 'value',
  text: 'text',
}

const openBracket: Matcher = {
  key: 'test',
  operator: '&',
  comparison: '(',
  source: '',
  value: '',
  text: '',
}

const closeBracket: Matcher = {
  key: 'test',
  operator: '&',
  comparison: ')',
  source: '',
  value: '',
  text: '',
}

const testDataSources: DataSource[] = [
  {
    name: 'list',
    title: 'list of strings',
    comparisons: defaultComparison,
    precedence: 2,
    selectionLimit: 2,
    definitions: [
      {
        source: ['asdas', 'assda', 'loadsp'],
      }
    ]
  },
  {
    name: 'promise',
    title: 'Promise list',
    comparisons: defaultComparison,
    precedence: 1,
    definitions: [
      {
        source: async (text) => {
          return new Promise((resolve) => {
            setTimeout(
              () =>
                resolve(
                  ['delayed', 'aploked', 'loadxx'].filter((item) =>
                    item.includes(text),
                  ),
                ),
              250,
            )
          })
        },
      }
    ]
  },
  {
    name: 'function',
    title: 'Functions',
    comparisons: numberComparisons,
    definitions: [
      {
        match: (text: string) => !isNaN(Number(text)),
        value: (text: string) => Number.parseInt(text),
      }
    ]
  },
  {
    name: 'regex',
    title: 'Regular Expression',
    comparisons: stringComparisons,
    precedence: 3,
    definitions: [
      {
        match: /^[a-zA-Z]{2,}$/,
        value: (text: string) => text,
      }
    ]
  },
]

const testConfig: Config = {
  dataSources: testDataSources,
  defaultComparison: '=',
  and: '&',
  or: '|',
  comparisons: ['=', '!', '*', '!*', '<*', '>*', '>', '<', '>=', '<=', '!'],
  comparisonDescriptions: [],
  operators: 'Complex',
  defaultItemLimit: 10,
}

const singleMatcher: Matcher[] = [
  {
    key: 'test',
    operator: '&',
    comparison: '=',
    source: 'test',
    value: 'value',
    text: 'text',
  },
]

const dualMatchers = (comp: string): Matcher[] => {
  return [
    {
      key: 'test',
      operator: '&',
      comparison: comp,
      source: 'test',
      value: 'value',
      text: 'text',
    },
    {
      key: 'test2',
      operator: '&',
      comparison: comp,
      source: 'test',
      value: 'value',
      text: 'text',
    },
  ]
}

const multipleMatchers: Matcher[] = [
  {
    key: 'test',
    operator: '&',
    comparison: '=',
    source: 'test',
    value: 'value',
    text: 'text',
  },
  {
    key: 'test2',
    operator: '|',
    comparison: '=',
    source: 'test',
    value: 'value2',
    text: 'text2',
  },
  {
    key: 'test3',
    operator: '&',
    comparison: '=',
    source: 'test',
    value: 'value3',
    text: 'text3',
  },
]

const multipleListMatchers: Matcher[] = [
  {
    key: 'test',
    operator: '&',
    comparison: '=',
    source: 'list',
    value: 'value',
    text: 'text',
  },
  {
    key: 'test2',
    operator: '|',
    comparison: '=',
    source: 'list',
    value: 'value2',
    text: 'text2',
  },
  {
    key: 'test3',
    operator: '&',
    comparison: '=',
    source: 'test',
    value: 'value3',
    text: 'text3',
  },
]

export {
  singleMatcher,
  dualMatchers,
  multipleMatchers,
  multipleListMatchers,
  matcherAnd,
  testConfig,
  testDataSources,
  openBracket,
  closeBracket,
}
