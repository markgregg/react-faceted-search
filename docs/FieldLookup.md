# FieldLookup

The FieldLookup interface is a field definition used to lookup in lists or promises

```js
interface FieldLookup {
  source: | SourceItem[] | PromiseLookup
  matchOnPaste?: boolean | ((text: string) => Promise<SourceItem | null>)
  textGetter?: (item: object) => string
  valueGetter?: (item: object) => Value
  ignoreCase?: boolean
  itemLimit?: number
  searchStartLength?: number
}
```

### source
List or promise

### matchOnPaste
if list true if list should be check when user pastes. If promise, then this is a promise to find a single value matching the paste tesxt

### textGetter
Getter to extract text from an object

### valueGetter
Getter to extract value from an object

### ignoreCase
Should ignore case

### itemLimit
Maximium selectable items

### searchStartLength
Nubmer of characters before searching