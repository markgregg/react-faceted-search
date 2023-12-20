import { checkBracket } from '@/component/ReactFacetedSearchFunctions'

describe('ReactFacetedSearchFunctions', () => {
  it('check simple mismatched open brackets are returned', () => {
    const brackets: string[] = ['(']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, true)
    expect(missingIndexes).toStrictEqual([0])
  })

  it('check simple mismatched open brackets 2 are returned', () => {
    const brackets: string[] = ['(', ')', '(']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, true)
    expect(missingIndexes).toStrictEqual([2])
  })

  it('check simple mismatched open brackets 3 are returned', () => {
    const brackets: string[] = ['(', '(', '(', ')', ')', ')', '(']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, true)
    expect(missingIndexes).toStrictEqual([6])
  })

  it('check simple mismatched open brackets 4 are returned', () => {
    const brackets: string[] = ['(', '(', '(', ')', ')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, true)
    expect(missingIndexes).toStrictEqual([0])
  })

  it('check simple mismatched close brackets are returned', () => {
    const brackets: string[] = [')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, false)
    expect(missingIndexes).toStrictEqual([0])
  })

  it('check simple mismatched close brackets 2 are returned', () => {
    const brackets: string[] = ['(', ')', ')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, false)
    expect(missingIndexes).toStrictEqual([2])
  })

  it('check simple mismatched close brackets 3 are returned', () => {
    const brackets: string[] = ['(', '(', '(', ')', ')', ')', ')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, false)
    expect(missingIndexes).toStrictEqual([6])
  })

  it('check simple mismatched close brackets 4 are returned', () => {
    const brackets: string[] = ['(', '(', ')', ')', ')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, false)
    expect(missingIndexes).toStrictEqual([4])
  })

  it('check matching brackets are not returned', () => {
    const brackets: string[] = ['(', '(', '(', ')', ')', ')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, true)
    expect(missingIndexes).toStrictEqual([])
  })

  it('check matching brackets 2 are not returned', () => {
    const brackets: string[] = ['(', '(', '(', ')', ')', ')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, false)
    expect(missingIndexes).toStrictEqual([])
  })

  it('check multiple mismatched brackets are returned', () => {
    const brackets: string[] = ['(', '(', '(', ')', ')', '(', '(', ')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, true)
    expect(missingIndexes).toStrictEqual([5, 0])
  })

  it('check multiple mismatched brackets 2 are returned', () => {
    const brackets: string[] = ['(', '(', ')', ')', ')', '(', ')', ')']
    const missingIndexes: number[] = []
    checkBracket(brackets, missingIndexes, false)
    expect(missingIndexes).toStrictEqual([4, 7])
  })
})
