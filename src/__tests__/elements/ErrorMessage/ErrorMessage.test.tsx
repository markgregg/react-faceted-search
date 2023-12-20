import ErrorMessage from '../../../component/elements/ErrorMessage'
import { fireEvent, render } from '@testing-library/react'

describe('ErrorMessage', () => {
  it('basic render ', () => {
    const result = createErrorMessage('test error')
    const element = result.container.querySelector('#editError')
    expect(element).toHaveTextContent('test error')
  })

  it('acknowledge erroir', () => {
    let errorAcked = false
    const result = createErrorMessage('test error', () => (errorAcked = true))
    const element = result.container.querySelector('svg')
    expect(element).toBeDefined()
    element && fireEvent.click(element)
    expect(errorAcked).toBeTruthy()
  })
})

const createErrorMessage = (
  error: string,
  onErrorAcknowledged?: () => void,
) => {
  return render(
    <ErrorMessage
      errorMessage={error}
      onErrorAcknowledged={onErrorAcknowledged ?? (() => console.log('acked'))}
    />,
  )
}
