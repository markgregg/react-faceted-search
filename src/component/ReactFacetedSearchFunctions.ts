import {
  Config,
  Field,
  FreTextFunc,
  Matcher,
  Nemonic,
  Option,
  SourceItem,
} from './types'
import { FieldLookup, FieldValue } from './types/Field'
import { guid } from './utils'

export const checkBracket = (
  brackets: string[],
  missingBracketIndexes: number[],
  open: boolean,
) => {
  const first = open ? '(' : ')'
  const last = open ? ')' : '('
  const matchEnds: number[] = []
  for (
    let index = !open ? 0 : brackets.length - 1;
    (!open && index < brackets.length) || (open && index >= 0);
    !open ? index++ : index--
  ) {
    if (brackets[index] === first) {
      let foundTerm = false
      for (
        let index2 = open ? index + 1 : index - 1;
        (open && index2 < brackets.length) || (!open && index2 >= 0);
        open ? index2++ : index2--
      ) {
        if (brackets[index2] === last && !matchEnds.includes(index2)) {
          matchEnds.push(index2)
          foundTerm = true
          break
        }
      }
      if (!foundTerm) {
        missingBracketIndexes.push(index)
      }
    }
  }
}

export const validateMatcher = (
  matchers: Matcher[],
  fields: Field[],
  matcher: Matcher,
  activeMatcher: number | null,
  operators: 'Simple' | 'AgGrid' | 'Complex',
  orSymnbol: string,
): string | null => {
  if (matcher.comparison === '(' || matcher.comparison === ')') {
    return null
  }
  if (
    operators === 'AgGrid' &&
    (matcher.operator === 'or' || matcher.operator === orSymnbol)
  ) {
    const previousOp = activeMatcher
      ? activeMatcher > 0
        ? matchers[activeMatcher - 1]
        : null
      : matchers.length > 0
        ? matchers[matchers.length - 1]
        : null
    if (previousOp && previousOp.source !== matcher.source) {
      return `When using AgGrid style operators, or can only be used for the same field`
    }
  }
  const field = fields.find((ds) => ds.name === matcher.source)
  if (field?.selectionLimit) {
    const currentCount = matchers.filter(
      (m) => matcher.key !== m.key && matcher.source === m.source,
    ).length
    if (currentCount >= field.selectionLimit) {
      return `Datasource (${field.name}) is limited to ${field.selectionLimit} items.`
    }
  }
  return null
}

export const parseText = (
  text: string,
  fields: Field[],
  func: Nemonic | null,
  config: Config,
  pasteFreeTextAction: FreTextFunc = 'Individual',
  pasteMatchTimeout = 500,
): Promise<Matcher[]> => {
  return new Promise((resolve) => {
    const freeTextFunc = func?.pasteFreeTextAction ?? pasteFreeTextAction
    const parts = text.includes('"')
      ? protectSpacesAndSplit(text)
      : text.split(' ')
    const elements: (Matcher | string)[] = parts
    const promises: Promise<boolean>[] = []
    let op = 'and'
    let comp = '='
    parts.forEach((part, index) => {
      /* if part not op or comp reset to defaults */
      const trimmedPart = part.trim()
      if (trimmedPart === config.and || trimmedPart === 'and') {
        op = 'and'
      } else if (trimmedPart === config.or || trimmedPart === 'or') {
        op = 'or'
      } else if (config.comparisons.includes(trimmedPart)) {
        comp = trimmedPart
      } else if (trimmedPart !== '') {
        fields.forEach((ds) => {
          if (
            (func &&
              (func.optionalFields?.includes(ds.name) ||
                func.requiredFields?.includes(ds.name))) ||
            (!func && !ds.functional)
          ) {
            ds.definitions.forEach((d) => {
              if ('source' in d) {
                if (
                  !d.searchStartLength ||
                  trimmedPart.length >= d.searchStartLength
                ) {
                  if (typeof d.source === 'function') {
                    if (typeof d.matchOnPaste === 'function') {
                      matchPromises(
                        ds,
                        d,
                        d.matchOnPaste,
                        trimmedPart,
                        index,
                        promises,
                        elements,
                        op,
                        comp,
                      )
                    }
                  } else {
                    matchLists(
                      ds,
                      d,
                      d.source,
                      trimmedPart,
                      index,
                      elements,
                      op,
                      comp,
                    )
                  }
                }
              } else {
                matchExpressions(ds, d, trimmedPart, index, elements, op, comp)
              }
            })
          }
        })
      }
    })

    const resolution = () => {
      resolve(
        freeTextFunc === 'Original'
          ? [
            {
              key: guid(),
              operator: '',
              comparison: '',
              source: 'Free Text',
              value: text,
              text: text,
            },
            ...(elements.filter((e) => typeof e !== 'string') as Matcher[]),
          ]
          : freeTextFunc === 'Combined'
            ? [
              joinText(elements, config),
              ...(elements.filter((e) => typeof e !== 'string') as Matcher[]),
            ]
            : freeTextFunc === 'Individual'
              ? elements
                .filter((e) => typeof e !== 'string' || notCompAndOp(e, config))
                .map((element) => {
                  return typeof element === 'string'
                    ? {
                      key: guid(),
                      operator: '',
                      comparison: '',
                      source: 'Free Text',
                      value: element,
                      text: element,
                    }
                    : element
                })
              : [],
      )
    }

    let state: 'running' | 'done' | 'cancel' = 'running'
    Promise.all(promises).then(() => {
      if (state !== 'cancel') {
        state = 'done'
        resolution()
      }
    })
    setTimeout(() => {
      if (state !== 'done') {
        state = 'cancel'
        resolution()
      }
    }, pasteMatchTimeout)
  })
}

const matchExpressions = (
  ds: Field,
  d: FieldValue,
  trimmedPart: string,
  index: number,
  elements: (Matcher | string)[],
  operator: string,
  comparison: string,
) => {
  if (
    d.matchOnPaste &&
    ((d.match instanceof RegExp && trimmedPart.match(d.match)) ||
      (typeof d.match === 'function' && d.match(trimmedPart)))
  ) {
    const value = d.value(trimmedPart)
    if (value) {
      elements[index] = elements[index] = {
        key: guid(),
        operator,
        comparison,
        source: ds.name,
        value,
        text: typeof value === 'string' ? value : value.toString(),
      }
    }
  }
}

const matchLists = (
  ds: Field,
  d: FieldLookup,
  list: SourceItem[],
  trimmedPart: string,
  index: number,
  elements: (Matcher | string)[],
  operator: string,
  comparison: string,
) => {
  if (d.matchOnPaste) {
    const found = list.find((item) => {
      const actualIem =
        d.textGetter && typeof item === 'object'
          ? d.textGetter(item)
          : item.toString()
      return d.ignoreCase
        ? actualIem.toUpperCase() === trimmedPart.toUpperCase()
        : actualIem === trimmedPart
    })
    if (found) {
      const option: Option | undefined = getOption(found, d, ds)
      if (option) {
        elements[index] = {
          key: guid(),
          operator,
          comparison,
          ...option,
        }
      }
    }
  }
}

const matchPromises = (
  ds: Field,
  d: FieldLookup,
  matchOnPaste: (text: string) => Promise<SourceItem | null>,
  trimmedPart: string,
  index: number,
  promises: Promise<boolean>[],
  elements: (Matcher | string)[],
  operator: string,
  comparison: string,
) => {
  promises.push(
    matchOnPaste(trimmedPart).then((v) => {
      if (v) {
        const option: Option | undefined = getOption(v, d, ds)
        if (option) {
          elements[index] = {
            key: guid(),
            operator,
            comparison,
            ...option,
          }
        }
      }
      return true
    }),
  )
}

const notCompAndOp = (e: string, config: Config): boolean =>
  e !== 'and' &&
  e !== 'or' &&
  e !== config.and &&
  e !== config.or &&
  !config.comparisons.includes(e)

const joinText = (elements: (Matcher | string)[], config: Config): Matcher => {
  const text = elements
    .filter((e) => typeof e === 'string' && notCompAndOp(e, config))
    .join(' ')
  return {
    key: guid(),
    operator: '',
    comparison: '',
    source: 'Free Text',
    value: text,
    text: text,
  }
}

const getOption = (
  v: SourceItem,
  d: FieldLookup,
  ds: Field,
): Option | undefined => {
  return typeof v === 'object'
    ? d.valueGetter && d.textGetter
      ? {
        source: ds.name,
        value: d.valueGetter(v),
        text: d.textGetter(v),
      }
      : undefined
    : {
      source: ds.name,
      value: v,
      text: v,
    }
}

const protectSpacesAndSplit = (text: string) => {
  return text
    .split('"')
    .map((t, i) => {
      return i % 2 === 1 ? t.replaceAll(' ', '^¬|') : t
    })
    .join('"')
    .split(' ')
    .map((t) => t.replaceAll('^¬|', ' ').replaceAll('"', ''))
}
