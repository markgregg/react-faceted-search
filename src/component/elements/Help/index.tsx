import * as React from 'react'
import { MutliSelectStyles } from '../../types'
import { FaLongArrowAltLeft } from "react-icons/fa";
import { FaLongArrowAltRight } from "react-icons/fa";
import { FaRegWindowClose } from "react-icons/fa";
import './Help.css'


interface HelpProps {
  styles?: MutliSelectStyles
  onClose: () => void
}


const Help: React.FC<HelpProps> = ({
  onClose,
}) => {

  return (
    <div id="help" className="helpMain">
      <FaRegWindowClose
        className='helpClose'
        onClick={() => onClose()}
      />
      <div className='helpColGroup'>
        <div className='helpGroup'>(Shift+<FaLongArrowAltLeft />) <b>Edit Previous</b></div>
        <div className='helpGroup'>(Shift+<FaLongArrowAltRight />) <b>Edit Next</b></div>
      </div>
      <div className='helpColGroup'>
        <div className='helpGroup'>(Ctrl+<FaLongArrowAltLeft />) <b>Move Matcher Left</b></div>
        <div className='helpGroup'>(Ctrl+<FaLongArrowAltRight />) <b>Move Matcher Right</b></div>
      </div>
      <div className='helpColGroup'>
        <div className='helpGroup'>(Shift+Backspace) <b>Delete Previous</b></div>
        <div className='helpGroup'>(Ctrl+Backspace) <b>Delete All</b></div>
      </div>
      <div className='helpColGroup'>
        <div className='helpGroup'>(PageUp) <b>Previous Option Group</b></div>
        <div className='helpGroup'>(PageDown) <b>Next Option Group</b></div>
      </div>
      <div className='helpColGroup'>
        <div className='helpGroup'>(Home) <b>First Option</b></div>
        <div className='helpGroup'>(End) <b>Last Option</b></div>
      </div>
    </div>
  )
}

export default Help
