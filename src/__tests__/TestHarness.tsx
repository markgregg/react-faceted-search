import {
  RenderResult,
  act,
  fireEvent,
  prettyDOM,
} from '@testing-library/react'

export interface TestHarness {
  getElement: (id: string) => Element | null
  getElements: <E extends Element>(id: string) => NodeListOf<E>
  getByText: (text: string) => Element

  getRelativeElemementPosition: (
    containerId: string | null,
    id1: string,
    id2: string
  ) => number | undefined

  fireClick: (id: string, byText?: boolean) => void
  fireMouseEnter: (id: string, byText?: boolean) => void
  fireChange: (id: string, payload: any, byText?: boolean) => void
  fireKeyDown: (id: string, payload: any, byText?: boolean) => void
  fireFocus: (id: string, byText?: boolean) => void

  assertElementValue: (id: string, value: string) => void
  assertElementText: (id: string, text: string) => void

  logDom: () => void
}

export const createTestHarness = (
  renderResult: RenderResult
): TestHarness => {

  return {
    getElement: (id: string) => renderResult.container.querySelector(id),
    getElements: (id: string) => renderResult.container.querySelectorAll(id),
    getByText: (text: string) => renderResult.getByText(text),

    getRelativeElemementPosition: (
      containerId: string | null,
      id1: string,
      id2: string
    ): number | undefined => {
      const container = containerId === null
        ? renderResult.container
        : renderResult.container.querySelector(containerId)
      const element1 = container && container.querySelector(id1)
      const element2 = container && container.querySelector(id2)
      return element1 && element2 ? element1.compareDocumentPosition(element2) : undefined
    },

    fireClick: (id: string, byText: boolean = false) => {
      const element = byText ? renderResult.getByText(id) : renderResult.container.querySelector(id)
      if (!element) {
        console.log(`${id} not found`)
      }
      expect(element).toBeDefined()
      element && act(() => fireEvent.click(element))
    },

    fireMouseEnter: (id: string, byText?: boolean) => {
      const element = byText ? renderResult.getByText(id) : renderResult.container.querySelector(id)
      if (!element) {
        console.log(`${id} not found`)
      }
      expect(element).toBeDefined()
      element && act(() => fireEvent.mouseEnter(element))
    },

    fireChange: (id: string, payload: any, byText?: boolean) => {
      const element = byText ? renderResult.getByText(id) : renderResult.container.querySelector(id)
      if (!element) {
        console.log(`${id} not found`)
      }
      expect(element).toBeDefined()
      element && act(() => fireEvent.change(element, payload))
    },

    fireKeyDown: (id: string, payload: any, byText?: boolean) => {
      const element = byText ? renderResult.getByText(id) : renderResult.container.querySelector(id)
      if (!element) {
        console.log(`${id} not found`)
      }
      expect(element).toBeDefined()
      element && act(() => fireEvent.keyDown(element, payload))
    },

    fireFocus: (id: string, byText?: boolean) => {
      const element = byText ? renderResult.getByText(id) : renderResult.container.querySelector(id)
      if (!element) {
        console.log(`${id} not found`)
      }
      expect(element).toBeDefined()
      element && act(() => fireEvent.focus(element))
    },

    assertElementValue: (id: string, value: string) => {
      const element = renderResult.container.querySelector(id)
      if (!element) {
        console.log(`${id} not found`)
      }
      expect(element).toHaveValue(value)
    },

    assertElementText: (id: string, text: string) => {
      const element = renderResult.container.querySelector(id)
      if (!element) {
        console.log(`${id} not found`)
      }
      expect(element?.textContent).toBe(text)
    },

    logDom: () => {
      console.log(prettyDOM(renderResult.container))
    }
  }
}

export const waitForElement = async (harness: TestHarness, id: string, byText: boolean = false, timeout?: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    let findElement: () => void
    findElement = () => {
      act(() => setTimeout(() => {
        try {
          const element = byText
            ? harness.getByText(id)
            : harness.getElement(id)
          if (!element) {
            throw 'not set'
          }
          resolve()
        } catch (e) {
          if (Date.now() - start > (timeout ?? 5000)) {
            harness.logDom()
            reject()
          } else {
            findElement()
          }
        }
      }, 10))
    }
    findElement()
  })

}
