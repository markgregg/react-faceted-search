import { Selection } from '../types'
import Config from '../types/Config'
import * as React from 'react'

const ITEM_LIMIT = 10

const hasFocusContext = React.createContext<boolean>(false)
const configContext = React.createContext<Config>({
  dataSources: [],
  defaultComparison: '=',
  and: '&',
  or: '|',
  comparisons: [],
  comparisonDescriptions: [],
  operators: 'Complex',
  defaultItemLimit: ITEM_LIMIT,
})
const selectionContext = React.createContext<Selection>({
  matchers: [],
  activeFunction: null,
})

export { hasFocusContext, configContext, selectionContext, ITEM_LIMIT }
