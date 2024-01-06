import { Matcher } from '@/component/types'

export const matcherToolTip = (matcher: Matcher): string => {
  return `${matcher.source}: ${matcher.text}${matcher.value !== matcher.text ? '(' + matcher.value + ')' : ''
    }`
}
