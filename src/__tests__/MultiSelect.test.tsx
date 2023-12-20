import ReactFacetedSearch from '../component/ReactFacetedSearch'
import DataSource, { defaultComparison } from '../component/types/DataSource'
import Matcher from '../component/types/Matcher'
import { fireEvent, prettyDOM, render, waitFor } from '@testing-library/react'
import {
  dualMatchers,
  multipleListMatchers,
  multipleMatchers,
  singleMatcher,
} from './testData'

const simpleDataSource: DataSource[] = [
  {
    name: 'list',
    title: 'list of strings',
    comparisons: defaultComparison,
    precedence: 1,
    selectionLimit: 2,
    definitions: [
      {
        source: ['asdas', 'assda', 'loadsp'],
      }
    ]
  },
]

describe('ReactFacetedSearch', () => {
  it('basic render shows an input box', () => {
    const result = render(<ReactFacetedSearch dataSources={simpleDataSource} />)
    const element = result.container.querySelector('#edit_input')
    expect(element).toHaveValue('')
  })

  it('basic render with matchers, displays matchers and input', () => {
    const result = createReactFacetedSearch(singleMatcher)
    const input = result.container.querySelector('#edit_input')
    expect(input).toHaveValue('')
    const label = result.container.querySelector('#test_label')
    expect(label?.textContent).toBe(' text')
  })

  it('basic render with matchers, displays matchers and input', () => {
    const result = createReactFacetedSearch(singleMatcher)
    const input = result.container.querySelector('#edit_input')
    expect(input).toHaveValue('')
    const label = result.container.querySelector('#test_label')
    expect(label?.textContent).toBe(' text')
  })

  it('basic render with matchers, displays multiple matchers', () => {
    const result = createReactFacetedSearch(multipleMatchers)
    const input = result.container.querySelector('#edit_input')
    expect(input).toHaveValue('')
    const label = result.container.querySelector('#test_label')
    expect(label?.textContent).toBe(' text')
    const label2 = result.container.querySelector('#test2_label')
    expect(label2?.textContent).toBe('or  text2')
    const label3 = result.container.querySelector('#test3_label')
    expect(label3?.textContent).toBe('and  text3')
  })

  it.each<[string, string]>([
    ['=', 'and  text'],
    ['!', 'and ! text'],
    ['>', 'and > text'],
    ['<', 'and < text'],
    ['>=', 'and >= text'],
    ['<=', 'and <= text'],
    ['*', 'and * text'],
    ['!*', 'and !* text'],
  ])('For symbol %p text is "%p"', (comp, text) => {
    const result = createReactFacetedSearch(dualMatchers(comp))
    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    const label = result.container.querySelector('#test2_label')
    expect(label?.textContent).toBe(text)
  })

  it('left arrow, moves to previous', async () => {
    const result = createReactFacetedSearch(multipleMatchers)
    const element = result.container.querySelector('#ReactFacetedSearch')
    expect(element).toBeDefined()
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowLeft',
        shiftKey: true,
      })
    const input3 = result.container.querySelector('#test3_input')
    expect(input3).toHaveValue('& =text3')
    input3 && fireEvent.change(input3, { target: { value: '' } })
    input3 &&
      fireEvent.keyDown(input3, {
        code: 'ArrowLeft',
      })
    const input2 = result.container.querySelector('#test2_input')
    expect(input2).toHaveValue('| =text2')
  })

  it('shift left arrow, moves to previous', async () => {
    const result = createReactFacetedSearch(multipleMatchers)
    const element = result.container.querySelector('#ReactFacetedSearch')
    expect(element).toBeDefined()
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowLeft',
        shiftKey: true,
      })
    const input3 = result.container.querySelector('#test3_input')
    expect(input3).toHaveValue('& =text3')
  })

  it('right arrow, moves to next', async () => {
    const result = createReactFacetedSearch(multipleMatchers)
    const element = result.container.querySelector('#ReactFacetedSearch')
    expect(element).toBeDefined()
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowRight',
        shiftKey: true,
      })
    const input = result.container.querySelector('#test_input')
    expect(input).toHaveValue('=text')
    input &&
      fireEvent.keyDown(input, {
        code: 'ArrowRight',
      })
    const input2 = result.container.querySelector('#test2_input')
    expect(input2).toHaveValue('| =text2')
  })

  it('shift right arrow, moves to next', async () => {
    const result = createReactFacetedSearch(multipleMatchers)
    const element = result.container.querySelector('#ReactFacetedSearch')
    expect(element).toBeDefined()
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowRight',
        shiftKey: true,
      })
    const input3 = result.container.querySelector('#test_input')
    expect(input3).toHaveValue('=text')
  })

  it('ctrl left arrow, moves element left', async () => {
    let updatedMatchers: Matcher[] = []
    const result = createReactFacetedSearch(
      multipleMatchers,
      (m) => (updatedMatchers = m),
    )
    const matchers = multipleMatchers
    const element = result.container.querySelector('#ReactFacetedSearch')
    expect(element).toBeDefined()
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowLeft',
        shiftKey: true,
      })
    expect(
      getRelativeElemntPosition(result.container, '#test3_view', '#test_view'),
    ).toBe(2)
    expect(
      getRelativeElemntPosition(result.container, '#test3_view', '#test2_view'),
    ).toBe(2)

    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowLeft',
        ctrlKey: true,
      })
    expect(
      getRelativeElemntPosition(result.container, '#test3_view', '#test_view'),
    ).toBe(2)
    expect(
      getRelativeElemntPosition(result.container, '#test3_view', '#test2_view'),
    ).toBe(4)
    expect(updatedMatchers).toStrictEqual([
      matchers[0],
      matchers[2],
      matchers[1],
    ])
  })

  it('ctrl right arrow moves element right', async () => {
    let updatedMatchers: Matcher[] = []
    const result = createReactFacetedSearch(
      multipleMatchers,
      (m) => (updatedMatchers = m),
    )
    const matchers = multipleMatchers
    const element = result.container.querySelector('#ReactFacetedSearch')
    expect(element).toBeDefined()
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowRight',
        shiftKey: true,
      })
    expect(
      getRelativeElemntPosition(result.container, '#test_view', '#test2_view'),
    ).toBe(4)
    expect(
      getRelativeElemntPosition(result.container, '#test_view', '#test3_view'),
    ).toBe(4)
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowRight',
        ctrlKey: true,
      })
    expect(
      getRelativeElemntPosition(result.container, '#test_view', '#test2_view'),
    ).toBe(2)
    expect(
      getRelativeElemntPosition(result.container, '#test_view', '#test3_view'),
    ).toBe(4)

    expect(updatedMatchers).toStrictEqual([
      matchers[1],
      matchers[0],
      matchers[2],
    ])
  })

  it('update matcher', async () => {
    const result = createReactFacetedSearch(singleMatcher)
    const element = result.container.querySelector('#ReactFacetedSearch')
    expect(element).toBeDefined()
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowLeft',
        shiftKey: true,
      })
    const input = result.container.querySelector('#test_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: 'a ' } })
    const option = result.getByText('asdas')
    fireEvent.click(option)
    await waitFor(
      () => expect(result.container.querySelector('#test_label')).toBeDefined(),
      { timeout: 250 },
    )
    const label = result.container.querySelector('#test_label')
    expect(label).toHaveTextContent('asdas')
  })

  it('delete matcher', async () => {
    let updatedMatchers: Matcher[] = []
    const result = createReactFacetedSearch(
      singleMatcher,
      (m) => (updatedMatchers = m),
    )

    const view = result.container.querySelector('#test_view')
    expect(view).toBeDefined()
    view && fireEvent.mouseEnter(view)
    const del = result.container.querySelector('svg')
    expect(del).toBeDefined()
    del && fireEvent.click(del)
    expect(updatedMatchers).toStrictEqual([])
  })

  it('select matcher', async () => {
    const result = createReactFacetedSearch(singleMatcher)

    const view = result.container.querySelector('#test_view')
    expect(view).toBeDefined()
    view && fireEvent.click(view)
    const input = result.container.querySelector('#test_input')
    expect(input).toHaveValue('=text')
  })

  it('cancel select of matcher', async () => {
    const result = createReactFacetedSearch(singleMatcher)

    const view = result.container.querySelector('#test_view')
    expect(view).toBeDefined()
    view && fireEvent.click(view)
    const input = result.container.querySelector('#test_input')
    expect(input).toBeDefined()
    input && fireEvent.keyDown(input, { code: 'Enter' })
    const label = result.container.querySelector('#test_label')
    expect(label).toHaveTextContent('text')
  })

  it('add matcher', async () => {
    let updatedMatchers: Matcher[] = []
    const result = createReactFacetedSearch(
      singleMatcher,
      (m) => (updatedMatchers = m),
    )

    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: 'a ' } })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    expect(updatedMatchers.length).toBe(2)
  })

  it('delete last matcher', async () => {
    let updatedMatchers: Matcher[] = []
    const result = createReactFacetedSearch(
      multipleMatchers,
      (m) => (updatedMatchers = m),
    )

    const div = result.container.querySelector('#ReactFacetedSearch')
    expect(div).toBeDefined()
    div && fireEvent.keyDown(div, { code: 'Backspace', shiftKey: true })
    expect(updatedMatchers.length).toBe(2)
  })

  it('delete all matcher', async () => {
    let updatedMatchers: Matcher[] = []
    const result = createReactFacetedSearch(
      multipleMatchers,
      (m) => (updatedMatchers = m),
    )

    const div = result.container.querySelector('#ReactFacetedSearch')
    expect(div).toBeDefined()
    div && fireEvent.keyDown(div, { code: 'Backspace', ctrlKey: true })
    expect(updatedMatchers.length).toBe(0)
  })

  it('edit matcher', async () => {
    const result = createReactFacetedSearch(singleMatcher)

    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && fireEvent.keyDown(input, { code: 'Backspace' })
    const input2 = result.container.querySelector('#test_input')
    expect(input2).toHaveValue('=text')
  })

  it('start drag', async () => {
    const result = createReactFacetedSearch(multipleMatchers)
    const div = result.container.querySelector('#test3_view')
    let dragFormat = ''
    let dragData = ''
    const dataTransfer = {
      setData: (format: string, data: string) => {
        dragFormat = format
        dragData = data
      },
      effectAllowed: '',
    }
    expect(div).toBeDefined()
    div &&
      fireEvent.dragStart(div, {
        dataTransfer,
      })
    expect(dragFormat).toBe('multi-select/matcher/test3')
    expect(dragData).toBe(
      '{"key":"test3","operator":"&","comparison":"=","source":"test","value":"value3","text":"text3"}',
    )
    expect(dataTransfer.effectAllowed).toBe('move')
  })

  it('drag over good', async () => {
    const result = createReactFacetedSearch(multipleMatchers)
    const div = result.container.querySelector('#test2_view')
    const dataTransfer = {
      types: ['multi-select/matcher/test3'],
      dropEffect: '',
    }
    expect(div).toBeDefined()
    div &&
      fireEvent.dragOver(div, {
        dataTransfer,
      })
    expect(dataTransfer.dropEffect).toBe('move')
  })

  it('drag over bad', async () => {
    const result = createReactFacetedSearch(multipleMatchers)
    const div = result.container.querySelector('#test3_view')
    const dataTransfer = {
      types: ['multi-select/matcher/test3'],
      dropEffect: '',
    }
    expect(div).toBeDefined()
    div &&
      fireEvent.dragOver(div, {
        dataTransfer,
      })
    expect(dataTransfer.dropEffect).toBe('')
  })

  it('drop data', async () => {
    let matchers: Matcher[] = []
    const result = createReactFacetedSearch(multipleMatchers, (m) => (matchers = m))
    const div = result.container.querySelector('#test2_view')
    const dataTransfer = {
      types: ['multi-select/matcher/test3'],
      getData: () =>
        '{"key":"test3","operator":"&","comparison":"=","source":"test","value":"value3","text":"text3"}',
    }
    expect(div).toBeDefined()
    div &&
      fireEvent.drop(div, {
        dataTransfer,
      })
    expect(matchers).toStrictEqual([
      multipleMatchers[0],
      multipleMatchers[2],
      multipleMatchers[1],
    ])
  })

  it('test validate add', async () => {
    let matchers: Matcher[] = []
    const result = createReactFacetedSearch(
      multipleListMatchers,
      (m) => (matchers = m),
    )

    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: 'asdas' } })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    const error = result.container.querySelector('#editError')
    expect(error?.textContent).toBe('Datasource (list) is limited to 2 items.')
    expect(matchers).toStrictEqual([])
  })

  it('test validate open bracket', async () => {
    const result = createReactFacetedSearch(multipleListMatchers)

    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: '(' } })
    const error = result.container.querySelector('#editError')
    expect(error).toBe(null)
  })

  it('test validate close bracket', async () => {
    const result = createReactFacetedSearch(multipleListMatchers)

    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: ')' } })
    const error = result.container.querySelector('#editError')
    expect(error).toBe(null)
  })

  it('test highlight mismatched open brackets', async () => {
    const result = createReactFacetedSearch(multipleListMatchers)

    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: '(' } })
    const bracket = result.getByText('and (')
    expect(bracket.className).toBe('matcherViewWarning')
    console.log(prettyDOM(result.container))
  })

  it('test highlight mismatched close brackets', async () => {
    const result = createReactFacetedSearch(multipleListMatchers)

    const input = result.container.querySelector('#edit_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: ')' } })
    const bracket = result.getByText(')')
    expect(bracket.className).toBe('matcherViewWarning')
    console.log(prettyDOM(result.container))
  })

  it('test validate edit', async () => {
    let matchers: Matcher[] = []
    const result = createReactFacetedSearch(
      multipleListMatchers,
      (m) => (matchers = m),
    )
    const element = result.container.querySelector('#ReactFacetedSearch')
    expect(element).toBeDefined()
    element &&
      fireEvent.keyDown(element, {
        code: 'ArrowLeft',
        shiftKey: true,
      })
    const input = result.container.querySelector('#test3_input')
    expect(input).toBeDefined()
    input && fireEvent.change(input, { target: { value: 'asdas' } })
    input && fireEvent.keyDown(input, { code: 'Enter' })
    const error = result.container.querySelector('#editError')
    expect(error?.textContent).toBe('Datasource (list) is limited to 2 items.')
    expect(matchers).toStrictEqual(
      multipleListMatchers.filter((m) => m.key !== 'test3'),
    )
  })
})

const getRelativeElemntPosition = (
  element: Element,
  id1: string,
  id2: string,
): number | undefined => {
  const view1 = element.querySelector(id1)
  const view2 = element.querySelector(id2)
  return view2 && view1 ? view1.compareDocumentPosition(view2) : undefined
}

const createReactFacetedSearch = (
  matchers: Matcher[],
  onChange?: (matchers: Matcher[]) => void,
) => {
  return render(
    <ReactFacetedSearch
      dataSources={simpleDataSource}
      matchers={matchers}
      onMatchersChanged={onChange}
    />,
  )
}
