---
id: catch-directive
title: '@catch Directive'
slug: /guides/catch-directive/
description: Relay guide to @catch
keywords:
  - catch
  - directive
  - optional
---

import DocsRating from '@site/src/core/DocsRating';

The `@catch` directive can be added to fields, fragment/operation definitions or
aliased inline fragment spreads declare how exceptions and unexpected values
should be handled at runtime. Using `@catch` allows Relay to surface these error
states as part of your fragment/query/mutation data instead of a null value
(which has been the default behavior), or a runtime exception if
[`@throwOnFieldError`](./throw-on-field-error-directive.md) is being used.

## `to` Argument

The `@catch` directive accepts an optional `to` argument which has two options:

- `RESULT` (default): The value is returned as `{ ok: true, value: T } | { ok: false, errors: [error] }`. This allows you implement explicit field-granular error handling in your application.
- `NULL`: If an error is encountered within the `@catch`, the value will be replaced with `null`.

## Examples

If a `@catch` error is caught directly on the field that the error originated
from - the error is provided on that field. Here's an example:

```graphql
query MyQuery {
  viewer {
    name @catch
    age
  }
}
```

If `name` contains an error - it would be provided in the response data on the
`name` field - like so:

```js
{
  viewer: {
    name: {
      ok: false,
      errors: [{path: ['viewer', 'name']}]
    }
    age: 39
  }
}
```

However, if `@catch` exists on one of the ancestors of a field, that error will
bubble up to there, like so:

```graphql
query MyQuery {
  viewer @catch {
    name
    age
  }
}
```

```js
{
  viewer: {
    ok: false,
    errors: [{ path: ['viewer', 'name'] } ]
  }
}
```

## Implications for nullability

Fields whose errors are explicitly handled by `@catch`, either by being
annotated with `@catch` or by being nested with a `@catch` ancestor will be
typed using their [Semantic Nullability](./semantic-nullability.md). In other
words, if a field has been marked as `@semanticNonNull` in the server schema to
indicate that it will only be null in the case of error, Relay will type that
field as non-nullable in its generated Flow/TypeScript types.

## What can be caught with `@catch`?

### Payload Field Errors

Payload [field
errors](https://spec.graphql.org/October2021/#sec-Errors.Field-errors) are
errors that occur as the result of a server-side exception while executing a
given field's resolver. In this case, the GraphQL specifies that the sever must
provide a null value where a value should be, and a separate errors object.

When you `@catch` on a field, Relay takes those errors and provides them to you
in-line instead, making them easier to handle, and no longer invisible.

### @required(action: THROW) within an @catch

If you have an `@required(action: THROW)` with an ancestor that contains a
`@catch` - instead of throwing an exception, the `@required` error would bubble
up and be provided in the same way normal errors would. Here's an example:

```graphql
query MyQuery {
  viewer @catch {
    name @required(action: THROW)
    age
  }
}
```

```js
{
  viewer: {
    ok: false,
    errors: [{ path: ["viewer", "name"] }]
  }
}
```

### Missing Data in response

[Here is an example of where missing data may occur in Relay](https://relay.dev/docs/next/debugging/why-null/#graph-relationship-change)

If a field is expected to have a value, and that field is undefined - the field
is considered to be "missing data". This is also an unexpected state - and when
it happens with an `@catch` as an ancestor, it will also be caught like so:

```js
{
  viewer: {
    ok: false,
    errors: [{ path: ["viewer", "name"] }]
  }
}
```

## How does `@catch` interact with `@throwOnFieldError`?

Using `@throwOnFieldError` enables fields to throw a JavaScript exception when a
field error occurs. By using `@catch` - you tell Relay that you don't want a
JavaScript exception in this case. Instead, you are requesting that the error be
provided in the data object, with the same behaviors and rules as are listed
above (including bubbling to a parent field).

It is important to note that you can still use @catch without
@throwOnFieldError. It will still provide you the error in the data object. But
other fields that are not under a `@catch` will still not throw - because
`@throwOnFieldError` would be missing.

Read more about `@throwOnFieldError`
[here](https://relay.dev/docs/next/api-reference/graphql-and-directives/#throwonfielderror-experimental).

## GraphQL Conf Talk

The Relay team gave a talk at GraphQL Conf 2024 about `@catch` and explicit error handling in Relay. You can watch it here:

<iframe src="https://www.youtube-nocookie.com/embed/_TSYKAtaK5A" width={640} height={360} allowFullScreen={true} frameBorder="0" />
