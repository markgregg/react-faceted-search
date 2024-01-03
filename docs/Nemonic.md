# Nemonic

Nemonics are functions using field combinations.

```js
interface Nemonic {
  name: string //function name
  requiredFields?: string[] //fields required
  optionalFields?: string[] //optional fields
  noAndOr?: boolean //does not allow and/or
  noBrackets?: boolean //does not allow brackets
  allowFreeText?: boolean //allows free text
  pasteFreeTextAction?: FreTextFunc //what to do with free text when pasted
  validate?: (matchers: Matcher[]) => string | null //validation function
}
```

### name
Name of the function

### requiredFields
Fields required by the function

### noAndOr
Does the function support and/or

### noBrackets
Does the function support brackets

### allowFreeText
Does the function support free text

### pasteFreeTextAction
Action to take when free text is pasted

### validate
Validation function
