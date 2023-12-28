import { TestHarness, createTestHarness } from '@/__tests__/TestHarness'
import OptionList from '../../../component/elements/OptionList'
import Option from '../../../component/types/Opton'
import {
  configContext,
} from '../../../component/state/context'
import { render } from '@testing-library/react'
import { testConfig2 } from '@/__tests__/testData'

const options: [string, Option[]][] = [
  [
    'test',
    [
      {
        source: 'test',
        value: 'value',
        text: 'text',
      },
      {
        source: 'test',
        value: 'value2',
        text: 'text2',
      },
    ],
  ],
]

describe('OptionList', () => {


  it('basic render, no active option', () => {
    const result = createOptionList(options)
    const list = result.getElements<HTMLLIElement>('li')
    expect(list.length).toBe(3)
    checkClassText(list, 0, 'test', 'c')
    checkClassText(list, 1, 'text')
    checkClassText(list, 2, 'text2')
  })

  it('basic render, with active option', () => {
    const result = createOptionList(options, 0)
    const list = result.getElements<HTMLLIElement>('li')
    expect(list.length).toBe(3)
    checkClassText(list, 0, 'test', 'c')
    checkClassText(list, 1, 'text', 'a')
    checkClassText(list, 2, 'text2')
  })

  it('select active option', () => {
    const result = createOptionList(options, 0)
    result.fireClick('text2', true)
    expect(selectedOpt).toBe(options[0][1][1])
  })

  it('Hover over active option', () => {
    const result = createOptionList(options, 0)
    result.fireMouseEnter('text2', true)
    expect(activeOpt).toBe(1)
  })

  it('select function', () => {
    const result = createOptionList([])
    result.fireClick('testfunc', true)
    expect(selectFunction).toBe('testfunc')
  })

  it('select operator', () => {
    const result = createOptionList([])
    result.fireClick('And', true)
    expect(selectOperator).toBe('and')
  })

  it('select comp', () => {
    const result = createOptionList([])
    result.fireClick('equals', true)
    expect(selectComparison).toBe('=')
  })

  it('select static option', () => {
    const result = createOptionList([])
    result.fireClick('loadsp', true)
    expect(selectText).toStrictEqual({ "source": "list", "text": "loadsp", "value": "loadsp" })
  })
})

const checkClassText = (
  list: NodeListOf<HTMLLIElement>,
  index: number,
  text: string,
  type: 'o' | 'c' | 'a' = 'o',
) => {
  expect(list.item(index)).toHaveTextContent(text)
  expect(list.item(index)).toHaveClass(
    type === 'c'
      ? 'optionListCategory'
      : type === 'o'
        ? 'optionListOption'
        : 'optionListOption optionListActiveOption',
  )
}

let selectedOpt: Option | null = null
let activeOpt: number | null = null
let selectFunction: string | null = null
let selectComparison: string | null = null
let selectOperator: string | null = null
let selectText: Option | null = null
let showHelp = false

const createOptionList = (
  options: [string, Option[]][],
  activeOption: number | null = null
): TestHarness => {
  return createTestHarness(render(
    <configContext.Provider value={testConfig2}>
      <OptionList
        options={options}
        activeOption={activeOption}
        onSelectOption={(o) => (selectedOpt = o)}
        onSelectActiveOption={(o) => (activeOpt = o)}
        onSelectFunction={f => selectFunction = f}
        onSelectComparison={c => selectComparison = c}
        onSelectOperator={o => selectOperator = o}
        onSelectText={t => selectText = t}
      />
    </configContext.Provider>,
  ))
}

