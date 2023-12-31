import { ReactFacetedSearchOptions } from "@/types/ReactFacetedSearchOptions"
import React from "react"
import './SelectOptions.css'

export type PropertyType = 'maxDropDownHeight' |
  'showCategories' | 'categoryPosition' | 'hideToolTip' | 'promiseDelay' | 'mockPromiseTime'
export interface SelectOptionsProps {
  options: ReactFacetedSearchOptions
  onValueChanged: (options: ReactFacetedSearchOptions) => void
}

const SelectOptions: React.FC<SelectOptionsProps> = ({
  options,
  onValueChanged,
}) => {
  return (
    <div className="optionsMain">
      <div className="optionGroup">
        <label>maxDropDownHeight</label>
        <input type='number' value={options.maxDropDownHeight} onChange={e => onValueChanged({ ...options, maxDropDownHeight: Number.parseFloat(e.target.value) })} />
      </div>
      <div className="optionGroup">
        <label>showCategories</label>
        <input type='checkbox' checked={options.showCategories} onChange={e => onValueChanged({ ...options, showCategories: e.target.checked })} />
      </div>
      <div className="optionGroup">
        <label>categoryPosition</label>
        <div className="optionCategoryPos" onClick={() => onValueChanged({ ...options, categoryPosition: options.categoryPosition === 'top' ? 'left' : 'top' })}>{options.categoryPosition}</div>
      </div>
      <div className="optionGroup">
        <label>hideToolTip</label>
        <input type='checkbox' checked={options.hideToolTip} onChange={e => onValueChanged({ ...options, hideToolTip: e.target.checked })} />
      </div>
      <div className="optionGroup">
        <label>promiseDelay</label>
        <input type='number' value={options.promiseDelay} onChange={e => onValueChanged({ ...options, promiseDelay: Number.parseInt(e.target.value) })} />
      </div>
      <div className="optionGroup">
        <label>mockPromiseTime</label>
        <input type='number' value={options.mockPromiseTime} onChange={e => onValueChanged({ ...options, mockPromiseTime: Number.parseInt(e.target.value) })} />
      </div>
      <div className="optionGroup">
        <label>defaultItemLimit</label>
        <input type='number' value={options.defaultItemLimit} onChange={e => onValueChanged({ ...options, defaultItemLimit: Number.parseInt(e.target.value) })} />
      </div>
      <div className="optionGroup">
        <label>showWhenSearching</label>
        <input type='checkbox' checked={options.showWhenSearching} onChange={e => onValueChanged({ ...options, showWhenSearching: e.target.checked })} />
      </div>
      <div className="optionGroup">
        <label>hideHelp</label>
        <input type='checkbox' checked={options.hideHelp} onChange={e => onValueChanged({ ...options, hideHelp: e.target.checked })} />
      </div>
    </div>
  )
}

export default SelectOptions

