import {
  closeBracket,
  matcherAnd,
  openBracket,
  testConfig,
} from '../../testData'
import MatcherView from '../../../component/elements/MatcherView'
import Matcher from '../../../component/types/Matcher'
import {
  hasFocusContext,
  configContext,
} from '../../../component/state/context'
import { fireEvent, render } from '@testing-library/react'
import { TestHarness, createTestHarness } from '@/__tests__/TestHarness'

describe('MatcherView', () => {
  it('basic render', () => {
    const result = createMatcherView(matcherAnd, false)
    result.assertElementText('#test_label', 'and = text')
  })

  it('basic render first', () => {
    const result = createMatcherView(matcherAnd, true)
    result.assertElementText('#test_label', '= text')
  })

  it('basic render selected', () => {
    const result = createMatcherView(matcherAnd, false, { selected: true })
    result.assertElementValue('#test_input', '& =text')
  })

  it('select', () => {
    const result = createMatcherView(matcherAnd, false)
    result.fireClick('#test_view')
    expect(isSelected).toBeTruthy()
  })

  it('delete', async () => {
    const result = createMatcherView(matcherAnd, false)
    result.fireMouseEnter('#test_view')
    result.fireClick('svg')
    await new Promise((r) => setTimeout(r, 1000));
    expect(isDeleted).toBeTruthy()
  })

  it('show tooltip', () => {
    const result = createMatcherView(matcherAnd, false)
    result.fireMouseEnter('#test_label')
    const tooltip = result.getElement('#test_tool_tip')
    expect(tooltip?.textContent).toBe('test: text(value)')
  })

  it('cancel edit', () => {
    const result = createMatcherView(matcherAnd, false, {
      selected: true
    })
    result.fireKeyDown('#test_input', { code: 'Enter' })
    expect(isCancelled).toBeTruthy()
  })

  it('update matcher', () => {
    const result = createMatcherView(matcherAnd, false, {
      selected: true
    })
    result.fireChange('#test_input', { target: { value: 'a' } })
    expect(isChanging).toBeTruthy()
    result.fireKeyDown('#test_input', { code: 'Enter' })
    expect(isChanged).toBeTruthy()
  })

  it('matcher deleted', () => {
    const result = createMatcherView(matcherAnd, false)
    result.fireChange('#test_input', { target: { value: '' } })
    result.fireKeyDown('#test_input', { code: 'Enter' })
    expect(isDeleted).toBeTruthy()
  })

  it('test simple operations', async () => {
    const result = createMatcherView(matcherAnd, false, {
      hideOperators: true,
    })
    result.assertElementText('#test_label', 'and = text')
  })

  it('test simple first operations', async () => {
    const result = createMatcherView(matcherAnd, true, {
      hideOperators: true,
    })
    result.assertElementText('#test_label', '= text')
  })

  it('test open breacket', async () => {
    const result = createMatcherView(openBracket, false)
    result.assertElementText('#test_label', 'and ( ')
  })

  it('test open breacket first', async () => {
    const result = createMatcherView(openBracket, true)
    result.assertElementText('#test_label', '( ')
  })

  it('test close bracket', async () => {
    const result = createMatcherView(closeBracket, false)
    result.assertElementText('#test_label', ') ')
  })

  it('edit next', () => {
    const result = createMatcherView(matcherAnd, false, {
      selected: true
    })
    result.fireChange('#test_input', { target: { value: '' } })
    result.fireKeyDown('#test_input', { code: 'ArrowRight' })
    expect(isEditNext).toBeTruthy()
  })

  it('edit previous', () => {
    const result = createMatcherView(matcherAnd, false, {
      selected: true
    })
    result.fireChange('#test_input', { target: { value: '' } })
    result.fireKeyDown('#test_input', { code: 'ArrowLeft' })
    expect(isEditPrevious).toBeTruthy()
  })

  it('insert', () => {
    const result = createMatcherView(matcherAnd, false, {
      selected: true
    })
    result.fireChange('#test_input', { target: { value: 'lo' } })
    result.fireKeyDown('#test_input', { code: 'Enter', shiftKey: true })
    expect(isInserted).toBeTruthy()
  })

  it('drag view', () => {
    const result = createMatcherView(matcherAnd, false, {
      selected: true
    })
    const element = result.getElement('#test_input')
    expect(element).toBeDefined()
    const ret = element && fireDragStart(element)
    expect(ret?.[0]).toBe('multi-select/matcher/test')
    expect(ret?.[1]).toBe('{"key":"test","operator":"&","comparison":"=","source":"test","value":"value","text":"text"}')
    expect(ret?.[2]).toBe('move')
  })

  it('drag Over', () => {
    const result = createMatcherView(matcherAnd, false, {
      selected: true
    })
    const element = result.getElement('#test_input')
    expect(element).toBeDefined()
    const ret = element && fireDragOver(element, 'multi-select/matcher/xxx', openBracket)
    expect(ret).toBe('move')
  })

  it('drop', () => {
    const result = createMatcherView(matcherAnd, false, {
      selected: true
    })
    const element = result.getElement('#test_input')
    expect(element).toBeDefined()
    element && fireDrop(element, 'multi-select/matcher/xxx', openBracket)
    expect(isSwapped).toBeTruthy()
  })

})

let isChanged = false
let isCancelled = false
let isSelected = false
let isDeleted = false
let isSwapped = false
let isEditNext = false
let isEditPrevious = false
let isInserted = false
let isChanging = false
let validateReturn: string | null = null


const createMatcherView = (
  matcher: Matcher,
  first: boolean,
  options?: {
    selected?: boolean
    hideOperators?: boolean
  },
): TestHarness => {
  return createTestHarness(render(
    <hasFocusContext.Provider value={true}>
      <configContext.Provider value={testConfig}>
        <MatcherView
          matcher={matcher}
          first={first}
          selected={options?.selected}
          onMatcherChanged={() => isChanged = true}
          onValidate={() => validateReturn}
          onDelete={() => isDeleted = true}
          onSelect={() => isSelected = true}
          onCancel={() => isCancelled = true}
          onEditPrevious={() => isEditPrevious = true}
          onEditNext={() => isEditNext = true}
          onInsertMatcher={() => isInserted = true}
          onSwapMatcher={() => isSwapped = true}
          onChanging={() => isChanging = true} />
      </configContext.Provider>
    </hasFocusContext.Provider>,
  ))
}


const fireDragStart = (element: Element): [string, string, string] => {
  let dataTransfer = {
    effectAllowed: '',
    setData: (format: string, data: string) => { console.log(`${format},${data}`) },
    types: [''],
    data: ''
  }
  dataTransfer.setData = (format: string, data: string) => {
    dataTransfer.types = [format]
    dataTransfer.data = data
  }
  fireEvent.dragStart(element, {
    dataTransfer
  })
  return [dataTransfer.types[0], dataTransfer.data, dataTransfer.effectAllowed]
}

const fireDragOver = (element: Element, key: string, matcher: Matcher): string => {
  let dataTransfer = {
    dropEffect: '',
    data: JSON.stringify(matcher),
    types: [key],
  }
  fireEvent.dragOver(element, {
    dataTransfer
  })
  return dataTransfer.dropEffect
}

const fireDrop = (element: Element, key: string, matcher: Matcher) => {
  let dataTransfer = {
    dropEffect: '',
    data: JSON.stringify(matcher),
    types: [key],
    getData: () => JSON.stringify(matcher)
  }
  fireEvent.drop(element, {
    dataTransfer
  })
}