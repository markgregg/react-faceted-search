# FieldValue

The FieldValue interface is a field definition used to lookup in RegEx or Functions

```js
interface FieldValue {
  match: RegExp | ((text: string) => boolean)
  value: (text: string) => Value
  matchOnPaste?: boolean
}
```

### match
RegEx or function used to detect a match

### value
Function used to fetch value

### matchOnPaste
Should the RegEx/Function be check if user pastes
