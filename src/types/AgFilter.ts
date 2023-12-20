import { Matcher } from '@/component/types'

export type AgFilterType = 'date' | 'text' | 'number'
export type AgOperator = 'AND' | 'OR'

export interface AgDateFilter {
  filterType: 'date'
  dateFrom: Date | string | null
  dateTo: Date | string | null
  type:
    | 'equals'
    | 'notEqual'
    | 'greaterThan'
    | 'lessThan'
    | 'greaterThanOrEqual'
    | 'lessThanOrEqual'
}

export interface AgNumberFilter {
  filterType: 'number'
  filter: number
  type:
    | 'equals'
    | 'notEqual'
    | 'greaterThan'
    | 'lessThan'
    | 'greaterThanOrEqual'
    | 'lessThanOrEqual'
}

export interface AgTextFilter {
  filterType: 'text'
  filter: string
  type:
    | 'equals'
    | 'notEqual'
    | 'contains'
    | 'notContains'
    | 'startsWith'
    | 'endsWith'
}

type AgSingleFilter = AgDateFilter | AgNumberFilter | AgTextFilter

export interface AgDualFilter {
  condition1: AgSingleFilter
  condition2: AgSingleFilter
  filterType: 'date' | 'number' | 'text'
  operator: AgOperator
}

type AgFilter = AgSingleFilter | AgDualFilter

export const getColumn = (source: string): string => {
  switch (source) {
    case 'MaturityDate':
      return 'maturityDate'
    case 'IssueDate':
      return 'issueDate'
    case 'HairCut':
      return 'hairCut'
    case 'Issuer2':
      return 'issuer'
  }
  return source.toLowerCase()
}

export const getFilterType = (source: string): AgFilterType => {
  switch (source) {
    case 'ISIN':
    case 'Currency':
    case 'Issuer':
    case 'Issuer2':
    case 'Side':
      return 'text'
    case 'MaturityDate':
    case 'IssueDate':
      return 'date'
    default:
      return 'number'
  }
}

const getTextComparisonType = (
  comparison: string,
):
  | 'equals'
  | 'notEqual'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith' => {
  switch (comparison) {
    case '!':
      return 'notEqual'
    case '*':
      return 'contains'
    case '!*':
      return 'notContains'
    case '>*':
      return 'startsWith'
    case '<*':
      return 'endsWith'
    default:
      return 'equals'
  }
}

const getDateNumberComparisonType = (
  comparison: string,
):
  | 'equals'
  | 'notEqual'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual' => {
  switch (comparison) {
    case '!':
      return 'notEqual'
    case '>':
      return 'greaterThan'
    case '<':
      return 'lessThan'
    case '>=':
      return 'greaterThanOrEqual'
    case '<=':
      return 'lessThanOrEqual'
    default:
      return 'equals'
  }
}

const getOperator = (operator: string): AgOperator => {
  return operator === '&' || operator === 'and' ? 'AND' : 'OR'
}

const createCondition = (matcher: Matcher): AgSingleFilter => {
  const dateParts =
    typeof matcher.value === 'string' ? matcher.value.split('/') : []
  switch (getFilterType(matcher.source)) {
    case 'date':
      return {
        filterType: 'date',
        dateFrom:
          typeof matcher.value === 'string'
            ? `${dateParts[2]}-${
                dateParts[1].length === 1 ? '0' + dateParts[1] : dateParts[1]
              }-${
                dateParts[0].length === 1 ? '0' + dateParts[0] : dateParts[0]
              }`
            : matcher.value instanceof Date
            ? matcher.value
            : new Date(matcher.value),
        dateTo: null,
        type: getDateNumberComparisonType(matcher.comparison),
      }
    case 'number':
      return {
        filterType: 'number',
        filter:
          typeof matcher.value === 'number'
            ? matcher.value
            : Number(matcher.value.toString()),
        type: getDateNumberComparisonType(matcher.comparison),
      }
    case 'text':
      return {
        filterType: 'text',
        filter:
          typeof matcher.value === 'string'
            ? matcher.value
            : matcher.value.toString(),
        type: getTextComparisonType(matcher.comparison),
      }
  }
}

export const createFilter = (matchers: Matcher[]): AgFilter => {
  if (matchers.length === 1) {
    return createCondition(matchers[0])
  } else {
    const condition1 = createCondition(matchers[0])
    const condition2 = createCondition(matchers[1])
    return {
      condition1,
      condition2,
      filterType: condition1.filterType,
      operator: getOperator(matchers[1].operator),
    }
  }
}

export const formatDate = (date: Date): string =>
  date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()

export const extractDate = (text: string) => {
  const dt = new Date()
  const value =
    parseInt(text.substring(text[0] === '-' ? 1 : 0, text.length - 1)) *
    (text[0] === '-' ? -1 : 1)
  const postFix = text.substring(text.length - 1)
  if (postFix === 'y' || postFix === 'Y') {
    dt.setFullYear(dt.getFullYear() + value)
    return formatDate(dt)
  } else {
    const addYears = (value + dt.getMonth()) / 12
    const months = (value + dt.getMonth()) % 12
    dt.setFullYear(dt.getFullYear() + addYears)
    dt.setMonth(months)
    return formatDate(dt)
  }
}

export const isSize = (text: string): boolean => {
  if (text.length > 1 && !text.includes('.')) {
    const postfix = text.toLowerCase()[text.length - 1]
    if (postfix === 'm' || postfix === 'k') {
      const number = Number(text.substring(0, text.length - 1))
      return !isNaN(Number(number))
    }
    return !isNaN(Number(text))
  }
  return false
}

export const getSize = (text: string): number => {
  const postfix = text.toLowerCase()[text.length - 1]
  if (postfix === 'm' || postfix === 'k') {
    const number = Number(text.substring(0, text.length - 1))
    return Number(number) * (postfix === 'm' ? 1000000 : 1000)
  }
  return Number(text)
}

export default AgFilter
