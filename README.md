# React Faceted Search

ReactFacetedSearch is a select component that can lookup or match text as a user types. ReactFacetedSearch will search across multiple sources and show matches in a dropdown list. It is intended to be an alternative to having multiple select components, and supports and/or opertions and multiple comparison types.

Visit the [Demo page](https://markgregg.github.io/react-faceted-search-example/)

## To install

```js
yarn add react-faceted-search
```

or

```js
npm i react-faceted-search
```

## Quick start

```js
const dataSource: DataSource[] = [
  {
    name: 'list',
    title: 'list of strings',
    comparisons: defaultComparison,
    precedence: 1,
    source: ['asdas', 'assda', 'loadsp'],
  },
  {
    name: 'promise',
    title: 'Promise list',
    comparisons: defaultComparison,
    precedence: 3,
    source: async (text) => {
      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve(
              ['delayed', 'aploked', 'loadsp'].filter((item) =>
                item.includes(text),
              ),
            ),
          250,
        )
      })
    },
  },
  {
    name: 'function',
    title: 'Functions',
    comparisons: numberComparisons,
    match: (text: string) => !isNaN(Number(text)),
    value: (text: string) => Number.parseInt(text),
  },
  {
    name: 'regex',
    title: 'Regular Expression',
    comparisons: stringComparisons,
    precedence: 2,
    match: /^[a-zA-Z]{2,}$/,
    value: (text: string) => text,
  },
]

const App = () => {
  const [matchers, setMatchers] = React.useState<Matcher[]>()

  return (
    <>
      <h2>ReactFacetedSearch</h2>
      <ReactFacetedSearch
        matchers={matchers}
        dataSources={dataSource}
        onMatchersChanged={setMatchers}
      />
  )
}
```

## Properties

- matchers - matchers to show in the control
- dataSources - datasources available to the control
- defaultComparison - default comparison symbol, defaults to =
- and - the and symbol, defaults to &
- or - the or symbol, defaults to -
- defaultItemLimit - default number of items to show for each datasource in the dropdown
- simpleOperation - only allow users to selct comparisons, no brackets or and or
- onMatchersChanged - event for when the matchers change
- clearIcon - alternative icon to the X
- maxDropDownHeight - the maximium hieght of the options dropdown
- minDropDownWidth - the minimum width of the option dropdown
- searchStartLength - the length of text at which to look for matches
- styles - allows styles to be set for the different components

## DataSources

There are two types of dataSource a lookup source that can be either a list or a promise, and a match datasource that can be either a function or a regex.

### Lookup

```js
source: SourceItem[] | ((text: string) => Promise<SourceItem[]>)
textGetter?: (item: object) => string
valueGetter?: (item: object) => Value
ignoreCase?: boolean
itemLimit?: number
searchStartLength?: number
```

- Source - either a list of strings/objects, or a promise that returns a list of strings/objects
- textGetter - if the source is an object, then this is a function to extract the display texst
- valueGetter - if the source is an object, then this is a function to extract the value
- ignoreCase - a boolean value to indicate if case is ignored when matching items
- itemLimit - the maximium number of matches to shouw ina dropdown
- searchStartLength - the text length required before datas source is searched

### Match

```js
match: RegExp | ((text: string) => boolean) | RegExp[] | ((text: string) => boolean)[]
value: (text: string) => Value
```

- match - either a regex or a function, or an array to determine if the text entered is a match
- value - a function that can extract a value from the text

## Operators and Comparisons

```js
and the compairsons on both sides must be true
or the comparisons on either side can be true

Comparisons can be configured as can the symbol for and/or

(   open bracket
)   close bracket
```

## Keyboard shortcuts

- Shift + ArrowLeft - navigate through the matchers
- Shift + ArrowRight - navigate through the matchers
- Ctrl + ArrowLeft - move selected matcher left
- Ctrl + ArrowRight - move selected matcher right
- Shift + Backspace - delete previous matcher
- Ctrl + Backspace - delete all matchers
- ArrowUp - move to next option in the list
- ArrowDown - move to previuos option in the list
- PageUp - move to next data source group in the option list
- PageDown - move to previous data source group in the option list
- Home - move to first data source group in the option list
- End - move to last data source group in the option list
- Enter - select current option / enter selection
- Tab - select current option

## Styling

The following components can be styled

- optionsList
- option
- optionCategory
- matcherView
- matcherViewSelected
- atcherToolTip
- matcherEdit
- input
- mutliSelect
- errorMessage

### Style structure

```js
{
  optionsList?: React.CSSProperties
  option?: React.CSSProperties
  optionCategory?: React.CSSProperties
  matcherView?: React.CSSProperties
  matcherViewSelected?: React.CSSProperties
  matcherToolTip?: React.CSSProperties
  matcherEdit?: React.CSSProperties
  input?: React.CSSProperties
  mutliSelect?: React.CSSProperties
  errorMessage?: React.CSSProperties
}
```

### Global Variables

#### ReactFacetedSearch Main

- border - --reactFacetedSearchMainBorder, default=1px solid rgb(204, 204, 204)
- background color - --reactFacetedSearchMainBackgroundColor, default=rgb(255, 255, 255)
- clear icon color - --reactFacetedSearchClearIcon
- clear icon hover color - --reactFacetedSearchClearIconHoverColor, default=gray

#### Matcher View

- background-color - --matcherViewMainBackgroundColor
- delete icon color - --matcherViewMainDeleteIconColor
- delete icon hover - --matcherViewMainDeleteIconHowverColor - default=gray
- warning background color - --matcherViewWarningBackgroundColor, default=orange

#### ToolTip

- background-color - --matcherViewTooltipBackgroundColor, default=rgb(255, 255, 255)
- border - --matcherEditOptionsBorder, default=1px solid rgb(204, 204, 204)

#### Error Message

- background-color - --errorMessageMainBackgroundColor, default=rgb(255, 255, 255)
- border - --matcherEditOptionsBorder, default=1px solid rgb(204, 204, 204)
- color --errorMessageMainErrorColor, default=red
- icon hover color - --errorMessageMainErrorHoverColor, default=rgb(255, 124, 124)

#### Option List

- color - --matcherEditOptionsColor, default=black
- border - --matcherEditOptionsBorder, default=1px solid rgb(204, 204, 204)
- background-color - --matcherEditOptionsBackgroundColor, default=rgb(255, 255, 255)
- active opton background - --optionListActiveOption, default=lightgray
- option category background - --matcherEditMainCategoryBackground, defalt=darkgrey
