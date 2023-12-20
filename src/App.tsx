import * as React from 'react'
import './App.css'
import Select from './elements/Select'
import BasicExample from './elements/BasicExample'
import AgGridExample from './elements/AgGridExample'
import SelectOptions from './elements/SelectOptions'
import { ReactFacetedSearchOptions } from './types/ReactFacetedSearchOptions'
import PromiseExample from './elements/PromiseExample'

type Example = 'command' | 'ag-grid' | 'promise'
const examples: Example[] = ['command', 'ag-grid', 'promise']

const App = () => {
  const [example, setExample] = React.useState<Example>(examples[0])
  const [showOptions, setShowOptions] = React.useState<boolean>(false)
  const [options, setOptions] = React.useState<ReactFacetedSearchOptions>({ showCategories: true, hideToolTip: true, categoryPosition: 'top', promiseDelay: 1 })
  return (
    <div className="mainBody">
      <h2>MutliSelect</h2>
      <div className='mainOptions'>
        <div className="mainSelection">
          <b>Exaples</b>
          <Select
            options={examples}
            selection={example}
            onSelectOption={setExample}
          />
        </div>
        <div className="mainSelection">
          <b>Options</b>
          <button onClick={() => setShowOptions(!showOptions)}>{showOptions ? 'Hide' : 'Show'}</button>
        </div>
      </div>
      {
        showOptions && <div className='mainOptionsDisplay'>
          <SelectOptions options={options} onValueChanged={setOptions} />
        </div>
      }
      {
        example === 'command' ? (
          <BasicExample options={options} />
        ) : example === 'ag-grid'
          ? (
            <AgGridExample options={options} />
          )
          : (
            <PromiseExample options={options} />
          )
      }
    </div>
  )
}

export default App
