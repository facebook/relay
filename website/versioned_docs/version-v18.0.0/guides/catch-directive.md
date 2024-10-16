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

The `@catch` directive can be added to fields in your Relay
queries/fragments/mutations to declare how exceptions and unexpected values
should be handled at runtime. Using `@catch` allows Relay to give you the
exceptions in the response data instead of a null value (which has been the
default behavior).

When a GraphQL response contains
[field errors](https://spec.graphql.org/October2021/#sec-Errors.Field-errors) -
Relay will look for the errors and - if a `@catch` directive is present on that
field, or a parent field - will respond with either
`{ok: true, value: "your value"}` or `{ok: false, errors: [...]}`.

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
            errors: [
                {
                    message: "Couldn't get name",
                    path: ['viewer', 'name']
                }
            ]
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
        errors: [
            {
                message: "Couldn't get name",
                path: ['viewer', 'name']
            }
        ]
    }
}
```

## What can be caught with `@catch`?

### Payload Errors

Payload errors are errors that occur as the result of a server-side exception
while executing a given field's response. In this case, GraphQL servers provide
a null value where a value should be, and a separate errors object.

When you `@catch` on a field, Relay takes those errors and provides them to you
in-line instead, making them easier to handle, and no longer invisible.

Another great side-effect is that if a field is nullable, you will now know if
the null was the result of an exception or a true null - because the shape would
either contain `{ok: true}` with the value `null`, or `{ok: false}` with the
actual error.

### @required(action: THROW) below an @catch

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
        errors: [
            {
                message: "Relay: Missing @required value at path 'viewer.name' in 'MyQuery'.",
            }
        ]
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
        errors: [
            {
                message: "Relay: Missing data for one or more fields in MyQuery",
            }
        ]
    }
}
```

## How does `@catch` interact with `@throwOnFieldError`?

Using `@throwOnFieldError` enables fields to throw a JavaScript exception when a
field error occurs. By using `@catch` - you tell Relay that you don't want a
JavaScript exception in this case. Instead, you are requesting that the error be
proviced in the data object, with the same behaviors and rules as are listed
above (including bubbling to a parent field).

It is important to note that you can still use @catch without
@throwOnFieldError. It will still provide you the error in the data object. But
other fields that are not under a `@catch` will still not throw - because
`@throwOnFieldError` would be missing.

Read more about `@throwOnFieldError`
[here](https://relay.dev/docs/next/api-reference/graphql-and-directives/#throwonfielderror).

## `@catch` arguments

### to: RESULT (default)

`@catch(to: RESULT)` enables the behavior described above - with providing
errors in-line for same or child fields that contain an error. This is the
default argument - which means you can write either `@catch` or
`@catch(to: RESULT)` and the behavior will be identical.

### to: NULL

`@catch(to: NULL)` will provide you with the exact same behavior as existed
before `@catch` was possible. The field will be null if it contains an error.
