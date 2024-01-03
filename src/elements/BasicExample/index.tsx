import * as React from 'react'
import {
  Field,
  Matcher,
  Nemonic,
  SourceItem,
  defaultComparison,
  numberComparisons,
  stringComparisons,
} from '@/component/types'
import ReactFacetedSearch from '@/component/ReactFacetedSearch'
import './BasicExample.css'
import { bonds } from '@/data/bonds'
import {
  extractDate,
  getColumn,
  getFilterType,
  getSize,
  isSize,
} from '@/types/AgFilter'
import Interest from '@/types/Interest'
import { AgGridReact } from 'ag-grid-react'
import { ColDef } from 'ag-grid-community'
import { ReactFacetedSearchOptions } from '@/types/ReactFacetedSearchOptions'

interface BasicExampleProps {
  options: ReactFacetedSearchOptions
}

type Operation = (bond: any) => boolean

const textCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => (bond[field] as string) !== matcher.value
    case '*':
      return (bond) => (bond[field] as string).includes(matcher.value as string)
    case '!*':
      return (bond) =>
        !(bond[field] as string).includes(matcher.value as string)
    case '>*':
      return (bond) =>
        (bond[field] as string).startsWith(matcher.value as string)
    case '<*':
      return (bond) => (bond[field] as string).endsWith(matcher.value as string)
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const numberCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => bond[field] === matcher.value
    case '>':
      return (bond) => bond[field] > matcher.value
    case '<':
      return (bond) => bond[field] < matcher.value
    case '>=':
      return (bond) => bond[field] >= matcher.value
    case '<=':
      return (bond) => bond[field] <= matcher.value
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const dateCondition = (matcher: Matcher): Operation => {
  const field = getColumn(matcher.source)
  switch (matcher.comparison) {
    case '!':
      return (bond) => bond[field] === matcher.value
    case '>':
      return (bond) => bond[field] > matcher.value
    case '<':
      return (bond) => bond[field] < matcher.value
    case '>=':
      return (bond) => bond[field] >= matcher.value
    case '<=':
      return (bond) => bond[field] <= matcher.value
    default:
      return (bond) => bond[field] === matcher.value
  }
}

const operator = (
  matcher: Matcher,
  comp1: Operation,
  comp2: Operation,
): Operation => {
  switch (matcher.operator.toLowerCase()) {
    case 'or':
    case '|':
      return (bond) => comp1(bond) || comp2(bond)
  }
  return (bond) => comp1(bond) && comp2(bond)
}

const operation = (matcher: Matcher): Operation => {
  switch (getFilterType(matcher.source)) {
    case 'date':
      return dateCondition(matcher)
    case 'number':
      return numberCondition(matcher)
  }
  return textCondition(matcher)
}

const getPredicate = (matchers: Matcher[]): Operation | null => {
  let op: Operation | null = null
  matchers
    .filter(
      (matcher) =>
        matcher.comparison !== '(' &&
        matcher.comparison !== ')' &&
        !matcher.changing &&
        matcher.source !== 'Channel',
    )
    .forEach((matcher) => {
      const currentOp = operation(matcher)
      op = op !== null ? operator(matcher, op, currentOp) : currentOp
    })
  return op
}

const BasicExample: React.FC<BasicExampleProps> = ({ options }) => {
  const [interests, setInterests] = React.useState<Interest[]>([])
  const [interest, setInterest] = React.useState<Interest | null>(null)
  const [columnDefs] = React.useState<ColDef<Interest>[]>([
    {
      field: 'client',
      filter: false,
      sortable: true,
      resizable: false,
      width: 220,
    },
    {
      field: 'side',
      filter: false,
      sortable: true,
      resizable: false,
      width: 70,
    },
    {
      field: 'sector',
      filter: false,
      sortable: true,
      resizable: false,
      width: 120,
    },
    {
      field: 'isin',
      filter: false,
      sortable: true,
      resizable: true,
      width: 80,
    },
    {
      field: 'maturityDateFrom',
      filter: false,
      sortable: true,
      resizable: true,
      width: 160,
    },
    {
      field: 'maturityDateTo',
      filter: false,
      sortable: true,
      resizable: true,
      width: 160,
    },
    {
      field: 'couponFrom',
      filter: false,
      sortable: true,
      resizable: true,
      width: 120,
    },
    {
      field: 'couponTo',
      filter: false,
      sortable: true,
      resizable: true,
      width: 120,
    },
  ])

  const findItems = React.useCallback(
    (
      text: string,
      field: 'isin' | 'currency' | 'issuer',
      op: 'and' | 'or' | null,
      matchers?: Matcher[],
    ): SourceItem[] => {
      const uniqueItems = new Set<string>()
      const predicate = matchers && op !== 'or' ? getPredicate(matchers) : null
      bonds.forEach((bond) => {
        if (!predicate || predicate(bond)) {
          const value = bond[field]
          if (value && value.toUpperCase().includes(text.toUpperCase())) {
            uniqueItems.add(value)
          }
        }
      })
      let items = [...uniqueItems].sort()
      if (items.length > 10) {
        items = items?.slice(10)
      }
      return items
    },
    [],
  )

  const findItem = React.useCallback(
    (
      text: string,
      field: 'isin' | 'currency' | 'issuer',
    ): SourceItem | null => {
      const found = bonds.find((bond) => bond[field] === text)
      return found ? found[field] : null
    },
    [],
  )

  const functions = React.useMemo<Nemonic[]>(
    () => [
      {
        name: 'Interest',
        pasteFreeTextAction: 'Combined',
        requiredFields: ['Client', 'Side'],
        optionalFields: [
          'Coupon',
          'Size',
          'MaturityDate',
          'Sector',
          'ISIN2',
        ],
        allowFreeText: true,
      },
    ],
    [],
  )

  const field = React.useMemo<Field[]>(
    () => [
      {
        name: 'ISIN',
        title: 'ISIN Code',
        comparisons: defaultComparison,
        precedence: 3,
        selectionLimit: 2,
        definitions: [
          {
            searchStartLength: 1,
            ignoreCase: true,
            source: async (text, op, matchers) =>
              new Promise((resolve) => {
                setTimeout(
                  () => resolve(findItems(text, 'isin', op, matchers)),
                  5,
                )
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'isin'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'ISIN2',
        title: 'ISIN Code',
        comparisons: defaultComparison,
        precedence: 3,
        selectionLimit: 2,
        hideOnShortcut: true,
        definitions: [
          {
            ignoreCase: true,
            searchStartLength: 1,
            source: async (text, op) =>
              new Promise((resolve) => {
                setTimeout(() => resolve(findItems(text, 'isin', op)), 5)
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'isin'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'Currency',
        title: 'Currency Code',
        comparisons: defaultComparison,
        precedence: 2,
        selectionLimit: 2,
        definitions: [
          {
            ignoreCase: true,
            source: async (text, op, matchers) =>
              new Promise((resolve) => {
                setTimeout(
                  () => resolve(findItems(text, 'currency', op, matchers)),
                  5,
                )
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'currency'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'Coupon',
        title: 'Coupon',
        comparisons: numberComparisons,
        precedence: 1,
        selectionLimit: 2,
        definitions: [
          {
            match: (text: string) => !isNaN(Number(text)),
            value: (text: string) => Number.parseFloat(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'HairCut',
        title: 'Hair Cut',
        comparisons: numberComparisons,
        precedence: 1,
        selectionLimit: 2,
        definitions: [
          {
            match: (text: string) => !isNaN(Number(text)),
            value: (text: string) => Number.parseFloat(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Price',
        title: 'Price',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        functional: true,
        definitions: [
          {
            match: (text: string) => !isNaN(Number(text)),
            value: (text: string) => Number.parseFloat(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Size',
        title: 'Size',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        definitions: [
          {
            match: (text: string) => isSize(text),
            value: (text: string) => getSize(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Side',
        title: 'Side',
        comparisons: stringComparisons,
        precedence: 9,
        selectionLimit: 1,
        definitions: [
          {
            ignoreCase: true,
            source: ['BUY', 'SELL'],
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Issuer',
        title: 'Issuer',
        comparisons: stringComparisons,
        precedence: 1,
        selectionLimit: 2,
        definitions: [
          {
            ignoreCase: true,
            match: /^[a-zA-Z ]{2,}$/,
            value: (text: string) => text,
            matchOnPaste: false,
          },
          {
            ignoreCase: false,
            searchStartLength: 3,
            source: async (text, op, matchers) =>
              new Promise((resolve) => {
                setTimeout(
                  () => resolve(findItems(text, 'issuer', op, matchers)),
                  5,
                )
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'issuer'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'MaturityDate',
        title: 'Maturity Date',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        definitions: [
          {
            match: /^[0-9]{0,2}[yYmM]$/,
            value: (text: string) => extractDate(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'IssueDate',
        title: 'Issue Date',
        comparisons: numberComparisons,
        precedence: 3,
        selectionLimit: 2,
        definitions: [
          {
            match: /^[0-9]{0,2}[yYmM]$/,
            value: (text: string) => extractDate(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'TradeDate',
        title: 'Trade Date',
        comparisons: numberComparisons,
        precedence: 4,
        selectionLimit: 2,
        functional: true,
        definitions: [
          {
            match: /^[0-9]{0,2}[yYmM]$/,
            value: (text: string) => extractDate(text),
            matchOnPaste: true,
          },
        ],
      },
      {
        name: 'Client',
        title: 'Client',
        comparisons: defaultComparison,
        precedence: 5,
        ignoreCase: false,
        searchStartLength: 2,
        selectionLimit: 1,
        functional: true,
        definitions: [
          {
            source: async (text, op) =>
              new Promise((resolve) => {
                setTimeout(() => resolve(findItems(text, 'issuer', op)), 5)
              }),
            matchOnPaste: async (text) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve(findItem(text, 'issuer'))
                }, 5)
              }),
          },
        ],
      },
      {
        name: 'Sector',
        title: 'Sector',
        comparisons: stringComparisons,
        precedence: 8,
        functional: true,
        definitions: [
          {
            searchStartLength: 2,
            ignoreCase: true,
            source: [
              'Energy',
              'Materials',
              'Industrials',
              'Consumer',
              'Health',
              'Financials',
              'Technology',
              'Communications',
              'Utilities',
            ],
            matchOnPaste: true,
          },
        ],
      },
    ],
    [findItems, findItem],
  )

  const handleAction = (matchers: Matcher[], func?: string) => {
    if (func) {
      const client = matchers.find(
        (matcher) => matcher.source.toLowerCase() === 'client',
      )?.text
      const side = matchers.find(
        (matcher) => matcher.source.toLowerCase() === 'side',
      )?.text as 'BUY' | 'SELL'
      const size = matchers.find(
        (matcher) => matcher.source.toLowerCase() === 'size',
      )?.value as number
      const sector = matchers.find(
        (matcher) => matcher.source.toLowerCase() === 'sector',
      )?.text
      const isin = matchers.find(
        (matcher) => matcher.source.toLowerCase() === 'isin2',
      )?.text
      const maturityDateFrom = matchers.find(
        (matcher) =>
          matcher.source.toLowerCase() === 'maturitydate' &&
          matcher.comparison === '>',
      )?.text
      const maturityDateTo = matchers.find(
        (matcher) =>
          matcher.source.toLowerCase() === 'maturitydate' &&
          matcher.comparison === '<',
      )?.text
      const couponFrom = matchers.find(
        (matcher) =>
          matcher.source.toLowerCase() === 'coupon' &&
          matcher.comparison === '>',
      )?.value as number
      const couponTo = matchers.find(
        (matcher) =>
          matcher.source.toLowerCase() === 'coupon' &&
          matcher.comparison === '<',
      )?.value as number

      if (client && side) {
        setInterest({
          client,
          side,
          size,
          sector,
          isin,
          maturityDateFrom,
          maturityDateTo,
          couponFrom,
          couponTo,
        })
      }
    }
  }

  const onEnter = () => {
    if (interest) {
      setInterests([...interests, interest])
    }
    setInterest(null)
  }

  const refAvailable = (ref: HTMLInputElement | null) => {
    ref?.focus()
  }

  return (
    <div>
      <div className="mainMultiselectContainer">
        <div className="mainMultiselect">
          <ReactFacetedSearch
            fields={field}
            functions={functions}
            onComplete={handleAction}
            onCompleteError={(func, missing) =>
              alert(`${func}: ${missing.toString()}`)
            }
            {...options}
            comparisonDescriptons={[
              { symbol: '=', description: 'Equals' },
              { symbol: '!', description: 'Not equals' },
              { symbol: '>', description: 'Greater' },
              { symbol: '<', description: 'Less' },
              { symbol: '>=', description: 'Greater equals' },
              { symbol: '<=', description: 'Less equals' },
              { symbol: '*', description: 'Like' },
              { symbol: '!*', description: 'Not Like' },
              { symbol: '>*', description: 'Starts With' },
              { symbol: '<*', description: 'Ends With' },
            ]}
          />
        </div>
        {interest && (
          <div className="interestFormContainer">
            <form className="interestForm" onSubmit={onEnter}>
              <h3 className="interetTitle">Enter Interest</h3>
              <div className="interestGroup">
                <label className="interestLabel">Buy/Sell:</label>
                <input
                  type="text"
                  id="buysell"
                  value={interest.side}
                  onChange={(e) =>
                    setInterest({
                      ...interest,
                      side: e.currentTarget.value as 'BUY' | 'SELL',
                    })
                  }
                  style={{ width: 45 }}
                />
              </div>
              <div className="interestGroup">
                <label className="interestLabel">ISIN:</label>
                <input
                  type="text"
                  style={{ width: 100 }}
                  id="isin"
                  value={interest.isin}
                  onChange={(e) =>
                    setInterest({ ...interest, isin: e.currentTarget.value })
                  }
                />
              </div>
              <div className="interestGroup">
                <label className="interestLabel">Sector:</label>
                <input
                  type="text"
                  id="indsutry"
                  style={{ width: 120 }}
                  value={interest.sector}
                  onChange={(e) =>
                    setInterest({ ...interest, sector: e.currentTarget.value })
                  }
                />
              </div>
              <div className="interestGroup">
                <label className="interestLabel">Maturity from:</label>
                <input
                  type="text"
                  style={{ width: 120 }}
                  id="maturityFrom"
                  value={interest.maturityDateFrom}
                  onChange={(e) =>
                    setInterest({
                      ...interest,
                      maturityDateFrom: e.currentTarget.value,
                    })
                  }
                />
                <label className="interestLabelShort">To:</label>
                <input
                  type="text"
                  style={{ width: 120 }}
                  id="maturityTo"
                  value={interest.maturityDateTo}
                  onChange={(e) =>
                    setInterest({
                      ...interest,
                      maturityDateTo: e.currentTarget.value,
                    })
                  }
                />
              </div>
              <div className="interestGroup">
                <label className="interestLabel">Coupon From:</label>
                <input
                  type="number"
                  id="couponFrom"
                  value={interest.couponFrom}
                  style={{ width: 60 }}
                  onChange={(e) =>
                    setInterest({
                      ...interest,
                      couponFrom: Number.parseFloat(e.currentTarget.value),
                    })
                  }
                />
                <label className="interestLabelShort">To:</label>
                <input
                  type="number"
                  id="couponTo"
                  value={interest.couponTo}
                  style={{ width: 60 }}
                  onChange={(e) =>
                    setInterest({
                      ...interest,
                      couponTo: Number.parseFloat(e.currentTarget.value),
                    })
                  }
                />
              </div>
              <div className="interestGroup">
                <label className="interestLabel">Size:</label>
                <input
                  style={{ width: 100 }}
                  type="number"
                  id="size"
                  value={interest.size}
                  onChange={(e) =>
                    setInterest({
                      ...interest,
                      size: Number.parseInt(e.currentTarget.value),
                    })
                  }
                />
              </div>
              <input
                ref={refAvailable}
                type="submit"
                value="Submit"
                style={{
                  alignSelf: 'flex-end',
                  width: 60,
                  backgroundColor: 'green',
                  color: 'white',
                  marginTop: '10px',
                }}
              />
            </form>
          </div>
        )}
        <div className="mainMultiselectGrid">
          <div>
            <h2>Client Interests</h2>
          </div>
          <div className="ag-theme-alpine agGrid">
            <AgGridReact
              rowData={interests}
              columnDefs={columnDefs}
              enableAdvancedFilter={true}
            ></AgGridReact>
          </div>
        </div>
      </div>

    </div>
  )
}

export default BasicExample
