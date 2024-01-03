import MatcherEdit from '../../../component/elements/MatcherEdit'
import {
  hasFocusContext,
  configContext,
} from '../../../component/state/context'
import {
  render,
} from '@testing-library/react'
import Matcher from '../../../component/types/Matcher'
import {
  closeBracket,
  openBracket,
  singleMatcher,
  testConfig,
  testFields,
} from '../../testData'
import { Config } from '@/component/types'
import { TestHarness, createTestHarness, waitForElement } from '@/__tests__/TestHarness'

describe('MatcherEdit', () => {
  it('basic render with no matcher', () => {
    const result = createMatcherEdit(true)
    result.assertElementValue('#edit_input', '')
  })

  it('basic render with first matcher', () => {
    const result = createMatcherEdit(true, singleMatcher[0])
    result.assertElementValue('#test_input', '=text')
  })

  it('basic render with not first matcher', () => {
    const result = createMatcherEdit(false, singleMatcher[0])
    result.assertElementValue('#test_input', '& =text')
  })

  it.each<[string, string, string]>([
    ['= a', 'and', '='],
    ['! a', 'and', '!'],
    ['> 1', 'and', '>'],
    ['< 1', 'and', '<'],
    ['>= 1', 'and', '>='],
    ['<= 1', 'and', '<='],
    ['* as', 'and', '*'],
    ['!* as', 'and', '!*'],
    ['& = a', 'and', '='],
    ['& ! a', 'and', '!'],
    ['& > 1', 'and', '>'],
    ['& < 1', 'and', '<'],
    ['& >= 1', 'and', '>='],
    ['& <= 1', 'and', '<='],
    ['& * as', 'and', '*'],
    ['& !* as', 'and', '!*'],
    ['| = a', 'or', '='],
    ['| ! a', 'or', '!'],
    ['| > 1', 'or', '>'],
    ['| < 1', 'or', '<'],
    ['| >= 1', 'or', '>='],
    ['| <= 1', 'or', '<='],
    ['| * as', 'or', '*'],
    ['| !* as', 'or', '!*'],
  ])('For symbol %p and operator %p', (val, operator, comparison) => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: val } })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(managedMatcher?.comparison).toBe(comparison)
    expect(managedMatcher?.operator).toBe(operator)
  })

  it('test insert', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: 'loa' } })
    result.fireKeyDown('#edit_input', { code: 'PageDown' })
    result.fireKeyDown('#edit_input', { code: 'Enter', shiftKey: true })
    expect(isInsertMatcher).toBe(true)
  })

  it('test pg up', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: 'loa' } })
    await waitForElement(result, 'loadxx', true)
    result.fireKeyDown('#edit_input', { code: 'PageUp' })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(managedMatcher?.text).toBe('loadxx')
  })

  it('test pg down', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: 'loa' } })
    result.fireKeyDown('#edit_input', { code: 'PageDown' })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(managedMatcher?.text).toBe('loadsp')
  })

  it('test end', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: 'loa' } })
    await waitForElement(result, 'loadxx', true)
    result.fireKeyDown('#edit_input', { code: 'End' })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(managedMatcher?.text).toBe('loadxx')
  })

  it('test home', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: 'loa' } })
    await waitForElement(result, 'loa', true)
    result.fireKeyDown('#edit_input', { code: 'Home' })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(managedMatcher?.text).toBe('loa')
  })

  it('test arrow up', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: 'loa' } })
    await waitForElement(result, 'loadxx', true)
    result.fireKeyDown('#edit_input', { code: 'ArrowUp' })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(managedMatcher?.text).toBe('loadxx')
  })

  it('test arrow down', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: 'loa' } })
    await waitForElement(result, 'loadsp', true)
    result.fireKeyDown('#edit_input', { code: 'ArrowDown' })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(managedMatcher?.text).toBe('loadsp')
  })

  it('Cancel Edit', async () => {
    const result = createMatcherEdit(false, singleMatcher[0], {
      isActive: true
    })
    result.fireKeyDown('#test_input', { code: 'Enter' })
    expect(isCancelled).toBeTruthy()
  })

  it('Edit Previous', async () => {
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true
    })
    result.fireChange('#test_input', { target: { value: '' } })
    result.fireKeyDown('#test_input', { code: 'Backspace' })
    expect(isEditPrevious).toBeTruthy()
  })

  it('Arrow Edit Previous', async () => {
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true
    })
    result.fireChange('#test_input', { target: { value: '' } })
    result.fireKeyDown('#test_input', { code: 'ArrowLeft' })
    expect(isEditPrevious).toBeTruthy()
  })

  it('Arrow Edit Next', async () => {
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true
    })
    result.fireChange('#test_input', { target: { value: '' } })
    result.fireKeyDown('#test_input', { code: 'ArrowRight' })
    expect(isEditNext).toBeTruthy()
  })

  it('onFocus', () => {
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true
    })
    result.fireFocus('#test_input')
    expect(isFocused).toBeTruthy()
  })

  it('test old promises ignored ', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: 'lo' } })
    result.fireChange('#edit_input', { target: { value: 'loa' } })
    await waitForElement(result, 'loadxx', true)
    expect(() => result.getByText('aploked')).toThrowError()
    result.fireKeyDown('#edit_input', { code: 'ArrowUp' })
    result.fireKeyDown('#edit_input', { code: 'Enter' })
    expect(managedMatcher?.text).toBe('loadxx')
  })

  it('test simple operations', async () => {
    const result = createMatcherEdit(false, singleMatcher[0], {
      config: {
        fields: testFields,
        defaultComparison: '=',
        and: '&',
        or: '|',
        comparisons: [
          '=',
          '!',
          '*',
          '!*',
          '<*',
          '>*',
          '>',
          '<',
          '>=',
          '<=',
          '!',
        ],
        comparisonDescriptions: [],
        operators: 'Simple',
        defaultItemLimit: 10,
      },
    })
    const input = result.getElement('#test_input')
    expect(input).toHaveValue('=text')
  })

  it('test open bracket', async () => {
    const result = createMatcherEdit(false, openBracket, {
      config: {
        fields: testFields,
        defaultComparison: '=',
        and: '&',
        or: '|',
        comparisons: [
          '=',
          '!',
          '*',
          '!*',
          '<*',
          '>*',
          '>',
          '<',
          '>=',
          '<=',
          '!',
        ],
        comparisonDescriptions: [],
        operators: 'Simple',
        defaultItemLimit: 10,
      },
    })
    const input = result.getElement('#test_input')
    expect(input).toHaveValue('(')
  })

  it('test close bracket', async () => {
    const result = createMatcherEdit(false, closeBracket, {
      config: {
        fields: testFields,
        defaultComparison: '=',
        and: '&',
        or: '|',
        comparisons: [
          '=',
          '!',
          '*',
          '!*',
          '<*',
          '>*',
          '>',
          '<',
          '>=',
          '<=',
          '!',
        ],
        comparisonDescriptions: [],
        operators: 'Simple',
        defaultItemLimit: 10,
      },
    })
    const input = result.getElement('#test_input')
    expect(input).toHaveValue(')')
  })

  it('enter test open bracket', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: '(' } })
    expect(managedMatcher?.comparison).toBe('(')
  })

  it('enter test close bracket', async () => {
    const result = createMatcherEdit(false, undefined)
    result.fireChange('#edit_input', { target: { value: ')' } })
    expect(managedMatcher?.comparison).toBe(')')
  })
})

let managedMatcher: Matcher | null | undefined
let isCancelled = false
let isFocused = false
let isEditPrevious = false
let isEditNext = false
let isInsertMatcher = false
let validateReturn: string | null = null

const createMatcherEdit = (
  first = false,
  matcher?: Matcher,
  options?: {
    isActive?: boolean
    config?: Config
  },
): TestHarness => {
  return createTestHarness(
    render(
      <hasFocusContext.Provider value={true}>
        <configContext.Provider value={options?.config ?? testConfig}>
          <MatcherEdit
            matcher={matcher}
            onMatcherChanged={m => {
              managedMatcher = m
              return true
            }}
            onValidate={() => validateReturn
            }
            onFocus={() =>
              isFocused = true
            }
            onCancel={() =>
              isCancelled = true
            }
            onEditPrevious={() =>
              isEditPrevious = true
            }
            onEditNext={() => {
              isEditNext = true
            }}
            onInsertMatcher={() =>
              isInsertMatcher = true
            }
            first={first}
          />
        </configContext.Provider>
      </hasFocusContext.Provider>,
    )
  )
}
