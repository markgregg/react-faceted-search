import * as React from 'react'
import { Config, Matcher, ReactFacetedSearchStyles } from '../../types'
import Nemonic from '@/component/types/Nemonic'
import { matcherDisplay } from './MatcherDisplayFunctions'
import { configContext } from '@/component/state/context'
import './MatcherDisplay.css'

interface MatcherDisplayProps {
  matcher: Matcher | Nemonic
  first?: boolean
  deleted?: boolean
  showWarning?: boolean
  onLabelHeight?: (hieight: number) => void
  onShowToolTip?: (show: boolean) => void
  bold?: boolean
  styles?: ReactFacetedSearchStyles
}

const MatcherDisplay: React.FC<MatcherDisplayProps> = ({
  matcher,
  first,
  deleted,
  showWarning,
  onLabelHeight,
  onShowToolTip,
  bold
}) => {

  const config = React.useContext<Config>(configContext)

  const notifyHeight = (div: HTMLDivElement | null) => {
    if (div && onLabelHeight) {
      onLabelHeight(div.clientHeight)
    }
  }

  const showToolTip = (show: boolean) => {
    if (onShowToolTip) {
      onShowToolTip(show)
    }
  }

  return (
    <div
      onMouseEnter={() => showToolTip(true)}
      onMouseLeave={() => showToolTip(false)}
      className={deleted ? 'matcherViewContainerHidden' : 'matcherViewContainer'}
      style={
        'key' in matcher && matcher.source !== ''
          ? {
          }
          : {
            alignSelf: 'end',
          }
      }
    >
      {config.showCategory && 'key' in matcher && config.categoryPosition !== 'left' && (
        <div className="matchViewCategory">{matcher.source}</div>
      )}
      <div
        ref={notifyHeight}
        id={'key' in matcher ? matcher.key + '_label' : 'function_label'}
        className={showWarning ? 'MatcherDisplayWarning' : ''}
        style={{
          ...(bold && { fontWeight: 'bold' })
        }}
      >
        {'key' in matcher
          ? matcherDisplay(
            matcher,
            first ?? false,
            config.operators === 'Simple',
            config.showCategory,
            config.categoryPosition
          )
          : matcher.name}
      </div>
    </div>
  )
}

export default MatcherDisplay
