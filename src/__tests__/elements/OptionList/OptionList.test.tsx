import OptionList from '../../../component/elements/OptionList'
import Option from '../../../component/types/Opton'
import { fireEvent, render } from '@testing-library/react'

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
    const result = createOptionList()
    const list = result.container.querySelectorAll('li')
    expect(list.length).toBe(3)
    checkClassText(list, 0, 'test', 'c')
    checkClassText(list, 1, 'text')
    checkClassText(list, 2, 'text2')
  })

  it('basic render, with active option', () => {
    const result = createOptionList(0)
    const list = result.container.querySelectorAll('li')
    expect(list.length).toBe(3)
    checkClassText(list, 0, 'test', 'c')
    checkClassText(list, 1, 'text', 'a')
    checkClassText(list, 2, 'text2')
  })

  it('select active option', () => {
    let selectedOpt: Option | null = null
    const result = createOptionList(0, (o) => (selectedOpt = o))
    const opt = result.getByText('text2')
    fireEvent.click(opt)
    expect(selectedOpt).toBe(options[0][1][1])
  })

  it('Hover over active option', () => {
    let activeOpt: number | null = null
    const result = createOptionList(0, undefined, (o) => (activeOpt = o))
    const opt = result.getByText('text2')
    fireEvent.mouseEnter(opt)
    expect(activeOpt).toBe(1)
  })
})

const createOptionList = (
  activeOption: number | null = null,
  onSelectOption?: (option: Option) => void,
  onActiveOption?: (index: number) => void,
) => {
  return render(
    <OptionList
      options={options}
      activeOption={activeOption}
      onSelectOption={onSelectOption ? onSelectOption : (o) => console.log(o)}
      onSelectActiveOption={
        onActiveOption ? onActiveOption : (i) => console.log(i)
      }
      onSelectFunction={() => console.log('comp')}
      onSelectComparison={() => console.log('comp')}
      onSelectOperator={() => console.log('op')}
      onSelectText={() => console.log('text')}
    />,
  )
}

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
