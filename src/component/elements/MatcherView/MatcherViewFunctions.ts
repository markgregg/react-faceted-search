import { Matcher } from '@/component/types'

export const matcherDisplay = (
  matcher: Matcher,
  first: boolean,
  hideOperators: boolean,
  showCategory?: boolean,
  columnPosition?: 'top' | 'left',
): string => {
  return `${first ||
    hideOperators ||
    matcher.operator === '' ||
    matcher.comparison === ')'
    ? ''
    : (matcher.operator === '&' || matcher.operator === 'and'
      ? 'and'
      : 'or') + ' '
    }${columnPosition === 'left' && showCategory
      ? matcher.source + ' '
      : ''
    }${matcher.comparison !== '"'
      ? matcher.comparison + ' '
      : ''
    }${matcher.text}`
}

export const matcherToolTip = (matcher: Matcher): string => {
  return `${matcher.source}: ${matcher.text}${matcher.value !== matcher.text ? '(' + matcher.value + ')' : ''
    }`
}
