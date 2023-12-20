import MatcherEdit from '../../../component/elements/MatcherEdit'
import {
  hasFocusContext,
  configContext,
} from '../../../component/state/context'
import {
  RenderResult,
  act,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'
import Matcher from '../../../component/types/Matcher'
import {
  closeBracket,
  openBracket,
  singleMatcher,
  testConfig,
  testDataSources,
} from '../../testData'
import { Config } from '@/component/types'

describe('MatcherEdit', () => {
  it('basic render with no matcher', () => {
    const result = createMatcherEdit(true)
    const element = result.container.querySelector('#edit_input')
    expect(element).toHaveValue('')
  })

  it('basic render with first matcher', () => {
    const result = createMatcherEdit(true, singleMatcher[0])
    const element = result.container.querySelector('#test_input')
    expect(element).toHaveValue('=text')
  })

  it('basic render with not first matcher', () => {
    const result = createMatcherEdit(false, singleMatcher[0])
    const element = result.container.querySelector('#test_input')
    expect(element).toHaveValue('& =text')
  })

  it.each<[string, string, string]>([
    ['= a', '&', '='],
    ['! a', '&', '!'],
    ['> 1', '&', '>'],
    ['< 1', '&', '<'],
    ['>= 1', '&', '>='],
    ['<= 1', '&', '<='],
    ['* as', '&', '*'], // will use reg ex - dependent on precedence
    ['!* as', '&', '!*'],
    ['& = a', '&', '='],
    ['& ! a', '&', '!'],
    ['& > 1', '&', '>'],
    ['& < 1', '&', '<'],
    ['& >= 1', '&', '>='],
    ['& <= 1', '&', '<='],
    ['& * as', '&', '*'],
    ['& !* as', '&', '!*'],
    ['| = a', '|', '='],
    ['| ! a', '|', '!'],
    ['| > 1', '|', '>'],
    ['| < 1', '|', '<'],
    ['| >= 1', '|', '>='],
    ['| <= 1', '|', '<='],
    ['| * as', '|', '*'],
    ['| !* as', '|', '!*'],
  ])('For symbol %p and operator %p', (val, operator, comparison) => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {
      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: val } }))
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.comparison).toBe(comparison)
    expect(matcher?.operator).toBe(operator)
  })

  it('test pg up', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await waitForOption(result, 'loadxx')
    input && fireEvent.keyDown(input, { code: 'PageUp' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadxx')
  })

  it('test pg down', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await waitForOption(result, 'loadxx')
    input && fireEvent.keyDown(input, { code: 'PageDown' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadsp')
  })

  it('test end', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await waitForOption(result, 'loadxx')
    input && fireEvent.keyDown(input, { code: 'End' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadxx')
  })

  it('test home', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await waitForOption(result, 'loadxx')
    input && fireEvent.keyDown(input, { code: 'Home' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loa')
  })

  it('test arrow up', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await waitForOption(result, 'loadxx')
    input && fireEvent.keyDown(input, { code: 'ArrowUp' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadxx')
  })

  it('test arrow down', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await waitForOption(result, 'loadxx')
    input && fireEvent.keyDown(input, { code: 'ArrowDown' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadsp')
  })

  it('Cancel Edit', async () => {
    let cancelled = false
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true,
      onCancel: () => (cancelled = true),
    })
    const element = result.container.querySelector('#test_input')
    expect(element).toBeDefined()
    element && fireEvent.keyDown(element, { code: 'Enter' })
    expect(cancelled).toBeTruthy()
  })

  it('Edit Previous', async () => {
    let editPrevious = false
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true,
      onEditPrevious: () => (editPrevious = true),
    })
    const element = result.container.querySelector('#test_input')
    expect(element).toBeDefined()
    element && fireEvent.change(element, { target: { value: '' } })
    element && fireEvent.keyDown(element, { code: 'Backspace' })
    expect(editPrevious).toBeTruthy()
  })

  it('Arrow Edit Previous', async () => {
    let editPrevious = false
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true,
      onEditPrevious: () => (editPrevious = true),
    })
    const element = result.container.querySelector('#test_input')
    expect(element).toBeDefined()
    element && fireEvent.change(element, { target: { value: '' } })
    element && fireEvent.keyDown(element, { code: 'ArrowLeft' })
    expect(editPrevious).toBeTruthy()
  })

  it('Arrow Edit Next', async () => {
    let editNext = false
    const result = createMatcherEdit(true, singleMatcher[0], {
      isActive: true,
      onEditNext: () => (editNext = true),
    })
    const element = result.container.querySelector('#test_input')
    expect(element).toBeDefined()
    element && fireEvent.keyDown(element, { code: 'ArrowRight' })
    expect(editNext).toBeTruthy()
  })

  it('onFocus', () => {
    let hasFocus = false
    const result = createMatcherEdit(true, undefined, {
      onFocus: () => (hasFocus = true),
    })
    const element = result.container.querySelector('#edit_input')
    expect(element).toBeDefined()
    element && fireEvent.focus(element)
    expect(hasFocus).toBeTruthy()
  })

  it('test old promises ignored ', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: 'lo' } }))
    input && act(() => fireEvent.change(input, { target: { value: 'loa' } }))
    await waitForOption(result, 'loadxx')
    expect(() => result.getByText('aploked')).toThrowError()
    input && fireEvent.keyDown(input, { code: 'ArrowUp' })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(matcher?.text).toBe('loadxx')
  })

  it('test old promises ignored ', async () => {
    const result = createMatcherEdit(false, undefined, {

    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: '>asdas' } }))
    input && fireEvent.keyDown(input, { code: 'Enter' })
    const txt = result.getByText(`Compairson (>) isn't valid for regex.`)
    expect(txt).toHaveTextContent(`Compairson (>) isn't valid for regex.`)
  })

  it('test simple operations', async () => {
    const result = createMatcherEdit(false, singleMatcher[0], {

      config: {
        dataSources: testDataSources,
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
    const input = result.container.querySelector('#test_input')
    expect(input).toHaveValue('=text')
  })

  it('test open bracket', async () => {
    const result = createMatcherEdit(false, openBracket, {

      config: {
        dataSources: testDataSources,
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
    const input = result.container.querySelector('#test_input')
    expect(input).toHaveValue('(')
  })

  it('test close bracket', async () => {
    const result = createMatcherEdit(false, closeBracket, {

      config: {
        dataSources: testDataSources,
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
    const input = result.container.querySelector('#test_input')
    expect(input).toHaveValue(')')
  })

  it('enter test open bracket', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: '(' } }))
    expect(matcher?.comparison).toBe('(')
  })

  it('enter test close bracket', async () => {
    let matcher: Matcher | null | undefined
    const result = createMatcherEdit(false, undefined, {

      onMatcherChanged: (m) => {
        matcher = m
        return true
      },
    })
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && act(() => fireEvent.change(input, { target: { value: ')' } }))
    expect(matcher?.comparison).toBe(')')
  })
})

const createMatcherEdit = (
  first = false,
  matcher?: Matcher,
  options?: {
    isActive?: boolean
    onMatcherChanged?: (matcher: Matcher | null) => boolean
    onValidate?: (matcer: Matcher) => string | null
    onFocus?: () => void
    onCancel?: () => void
    onEditPrevious?: () => void
    onEditNext?: () => void
    config?: Config
  },
) => {
  return render(
    <hasFocusContext.Provider value={true}>
      <configContext.Provider value={options?.config ?? testConfig}>
        <MatcherEdit
          matcher={matcher}
          onMatcherChanged={
            options?.onMatcherChanged ??
            ((m) => {
              console.log(m)
              return true
            })
          }
          onValidate={options?.onValidate ?? (() => null)}
          onFocus={options?.onFocus}
          onCancel={options?.onCancel}
          onEditPrevious={
            options?.onEditPrevious ?? (() => console.log('prev'))
          }
          onEditNext={options?.onEditNext ?? (() => console.log('prev'))}
          onInsertMatcher={() => console.log('prev')}
          first={first}
        />
      </configContext.Provider>
    </hasFocusContext.Provider>,
  )
}

const waitForOption = async (result: RenderResult, optText: string) => {
  await waitFor(() => expect(result.getByText(optText)).toBeDefined(), {
    timeout: 1000,
  })
  const opt = result.getByText(optText)
  expect(opt.textContent).toBe(optText)
}
