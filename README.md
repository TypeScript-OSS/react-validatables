# react-validatables

[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]

Validation tools for React built on `react-waitables`

This package provides tools for building efficiently executed validators that depend on bindings and/or waitables.  This is useful:

- for live field-level validation
- for live form-level validation
- with validations that depend on dynamically loaded / computed values

## Basic Example

The following example demonstrates attaching a validator to a `string` binding, which is updated by a `TextInput` component (code for `TextInput` is included in [CodeSandbox](https://codesandbox.io/s/react-validatables-single-string-input-feq8vl)).

The validator's state automatically changes as a user interacts with the field.  In this case the validator is very simple, checking that the text field isn't empty.  Below the input, the page dynamically reflects:

- what the user entered
- if the input is valid
- if the input isn't valid: the associated error

[Try it Out – CodeSandbox](https://codesandbox.io/s/react-validatables-single-string-input-feq8vl)

```typescript
import React, { useCallback } from 'react';
import { BindingsConsumer, resolveTypeOrDeferredType, useBinding } from 'react-bindings';
import { checkStringNotEmpty, useValidator } from 'react-validatables';
import { WaitablesConsumer } from 'react-waitables';

import { TextInput } from './TextInput';

export const App = () => {
  const value = useBinding(() => '', { id: 'value', detectChanges: true });
  const valueValidator = useValidator(value, () => checkStringNotEmpty("Shouldn't be empty"), { id: 'valueValidator' });

  const onClear1Click = useCallback(() => value.set(''), [value]);

  return (
    <>
      <div>
        <TextInput value={value} />
        &nbsp;
        <button onClick={onClear1Click}>Clear</button>
      </div>
      <div>
        You entered:&nbsp;
        <BindingsConsumer bindings={{ value }}>{({ value }) => value}</BindingsConsumer>
      </div>
      <WaitablesConsumer dependencies={valueValidator}>
        {(validator) => (
          <>
            <div>{`Valid: ${String(validator.isValid)}`}</div>
            {!validator.isValid ? <div>{resolveTypeOrDeferredType(validator.validationError)}</div> : null}
          </>
        )}
      </WaitablesConsumer>
    </>
  );
};
```

## Multiple Inputs and Checks Example

In the example above, the validator only depends on a single input value and only performs a single check.  However, multiple inputs and multiple operations are supported in a single validator and validators can depend on other validators.

In the following example, we demonstrated stored values and validators (see [CodeSandbox](https://codesandbox.io/s/react-validatables-multiple-inputs-7hjgwl) for more-complete example with UI) where:

- either first name or last name (or both) must be entered
- age must be entered
- age must be an integer between 0 and 199, inclusive

[Try it Out – CodeSandbox](https://codesandbox.io/s/react-validatables-multiple-inputs-7hjgwl)

```typescript
const makeNamePartValidator = () => changeStringTrim(checkStringNotEmpty());

const firstName = useBinding(() => '', { id: 'firstName', detectChanges: true });
const firstNameValidator = useValidator(firstName, makeNamePartValidator);

const lastName = useBinding(() => '', { id: 'lastName', detectChanges: true });
const lastNameValidator = useValidator(lastName, makeNamePartValidator);

const nameValidator = useValidator([firstNameValidator, lastNameValidator], (validators) =>
  checkAnyOf(validators, 'First name, last name, or both must be specified')
);

const age = useBinding<number | undefined>(() => undefined, { id: 'age', detectChanges: true });
const ageValidator = useValidator(age, () =>
  preventUndefined(
    [
      checkNumberIsInteger("Fractional values aren't allowed"),
      checkNumberGTE(0, 'Must be >= 0'),
      checkNumberLT(200, 'Must be < 200')
    ],
    'Age is required'
  )
);

const formValidator = useValidator([nameValidator, ageValidator], (validators) => validators);
```

As your use cases become more complex, you'll start to build reusable, composable validators.

## Conditional Validation

There are many cases where validation logic needs to be dynamic.  With `react-validatables`, there are two main ways to introduce dynamism:

- validator creation
- validator disabling bindings

The validator creation function is called every time validation is performed, so the rules you setup can be changed anytime.

Validators can be disabled using one or more of `disabledUntil`, `disabledWhile`, and/or `disabledWhileUnmodifiedBindings`.  When a validator is disabled, it it always considered to be valid.  All of these options takes one or more bindings, so validators can be disabled/enabled very dynamically.

`disabledWhileUnmodifiedBindings` helps create more friendly forms by, for example, not providing feedback on inputs that the user hasn't modified yet.  Otherwise, in the common case, all fields would initially be in an error state, which isn't necessarily useful.  Consider using `disabledWhileUnmodifiedBindings` on all or most validators directly associated with inputs (see Final Validation section below as well).

### Example

In the following example, we use `disabledWhileUnmodifiedBindings` so that `firstNameValidator` is disabled until `firstName` is modified.  `firstName` is usually modified by calling `set`.

```typescript
const firstName = useBinding(() => '', { id: 'firstName', detectChanges: true });
const firstNameValidator = useValidator(firstName, makeRequiredStringChecker, { disabledWhileUnmodified: firstName });
```

## Final Validation

In addition to interactive validation, we often need "final" validation before, for example, submitting data to a server.

During interactive validation, we often have `disabledWhileUnmodifiedBindings` associated with inputs.  However, if a user tries to submit a form with incomplete data, where they've accidentally skipped a field, for example, we then want to make sure we give clear feedback at that point.  The `finalizeValidation` utility is used for these cases and to generally wait for validation to finish.

```typescript
const onDoneClick = () =>
  finalizeValidation(formValidator, {
    bindings: { firstName, lastName },
    onValid: ({ firstName, lastName }) => { … }
  });
```

`finalizeValidation` generally:

- marks the specified bindings as modified if they're not already
- for bindings newly marked as modified, calls `triggerChangeListeners`, which in turn resets the associated validators
- locks the specified bindings
- waits for the validator to finish
- extracts the specified binding's values
- unlocks the specified bindings
- calls either `onValid` or `onInvalid`

## Extension

This package provides basic functionality for string and number validation and, more importantly, provides tools for building your own performant validators.

For extending these capabilities, be sure to checkout our [API Docs](https://passfolio.github.io/react-validatables/) to get a more-complete picture of the building blocks.

Examples of anticipated extensions are support for:

- BigNumber
- DateTime (Luxon)
- Formal schemas and/or other validation tools (ex. Yaschema, Joi)

## Naming

The API using the following prefixes for naming conventions:

- check - a validation checking step
- change - a value transformation step
- allow - allow a set of values and pass the value through, for further checking, without the allowed types, since they were already checked
- prevent - disallow a set of values and pass the value through if not disallowed, for further checking, without the disallowed types, since they were already checked
- select - continue validation with a different value

### Naming Convention Examples

```typescript
checkStringNotEmpty()
```

```typescript
changeStringTrim(checkStringNotEmpty())
```

```typescript
allowNull(checkStringNotEmpty())
```

```typescript
preventNull(checkStringNotEmpty())
```

```typescript
selectValue(Math.random(), checkNumberGT(0.5))
```

[API Docs](https://passfolio.github.io/react-validatables/)

## Thanks

Thanks for checking it out.  Feel free to create issues or otherwise provide feedback.

react-validatables is maintained by the team at [Passfolio](https://www.passfolio.com).

<!-- Definitions -->

[downloads-badge]: https://img.shields.io/npm/dm/react-validatables.svg

[downloads]: https://www.npmjs.com/package/react-validatables

[size-badge]: https://img.shields.io/bundlephobia/minzip/react-validatables.svg

[size]: https://bundlephobia.com/result?p=react-validatables
