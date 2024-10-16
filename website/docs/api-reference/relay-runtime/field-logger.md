---
id: field-logger
title: relayFieldLogger
slug: /api-reference/field-logger/
description: API reference for the `relayFieldLogger` Environment config option
keywords:
  - environment
  - logging
  - error
---

Relay includes a number of features that allow for granular handling of field errors:

- [`@required`](../../guides/required-directive.md) provides declarative handling of field nullability
- [`@catch`](../../guides/catch-directive.md) allows you to explicitly handle field errors
- [`@throwOnFieldError`](../../guides/throw-on-field-error-directive.md) lets you treat field errors as exceptions
- [Relay Resolvers](../../guides/relay-resolvers/introduction.md) coerce thrown exceptions to null, matching the GraphQL spec

In each of these cases, field errors are handled by Relay. However, it can still be important to track that these errors are occurring in your app, and monitor or resolve them. To enable this, the Relay Environment can be configured with a `relayFieldLogger`. This logger is a function which is called with events each time Relay handles a field-level error.

Providing a field logger looks something like this:
```ts
import {Environment} from "relay-runtime";

const environment = new Environment({
    relayFieldLogger: (event) => {
        switch(event.kind) {
            case "missing_expected_data.log":
                // ...
                break;
            // ... handle other events
        }
    },
    network: // ...
    store: // ...
});
```

## Event Types

The Field Logger currently can receive the following events:

## Missing Expected Data Log

Data which Relay expected to be in the store (because it was requested by the parent query/mutation/subscription) was missing. This can happen due to graph relationship changes observed by other queries/mutations, or imperative updates that don't provide all needed data.

See [Graph Relationship Changes](../../debugging/why-null/#graph-relationship-change).

In this case Relay will render with the referenced field as `undefined`.

:::note
This may break with the type contract of Relay's generated types.
:::

To turn this into a hard error for a given fragment/query, you can use [`@throwOnFieldError`](../../guides/throw-on-field-error-directive/)

```ts
export type MissingExpectedDataLogEvent = {
  +kind: 'missing_expected_data.log',
  +owner: string,
  +fieldPath: string,
};
```

## Missing Expected Data Throw

Data which Relay expected to be in the store (because it was requested by the parent query/mutation/subscription) was missing. This can happen due to graph relationship changes observed by other queries/mutations, or imperative updates that don't provide all needed data.

See [Graph Relationship Changes](../../debugging/why-null/#graph-relationship-change).


This event is called `.throw` because the missing data was encountered in a
 query/fragment/mutation with [`@throwOnFieldError`](../../guides/throw-on-field-error-directive/)

Relay will throw immediately after logging this event. If you wish to
customize the error being thrown, you may throw your own error.

:::note
Only throw on this event if `handled` is false. Errors that have been handled by a `@catch` directive or by making a resolver null will have `handled: true` and should not trigger a throw.
:::

```ts
export type MissingExpectedDataThrowEvent = {
  +kind: 'missing_expected_data.throw',
  +owner: string,
  +fieldPath: string,
  +handled: boolean,
};
```

## Missing Required Field Log

A field was marked as [@required(action: LOG)](../../guides/required-directive.md#action) but was null or missing in the store.

```ts
export type MissingRequiredFieldLogEvent = {
  +kind: 'missing_required_field.log',
  +owner: string,
  +fieldPath: string,
};
```

## Missing Required Field Throw

A field was marked as [@required(action: THROW)](../../guides/required-directive.md#action) but was null or missing in the* store.

Relay will throw immediately after logging this event. If you wish to customize the error being thrown, you may throw your own error.

:::note
Only throw on this event if `handled` is false. Errors that have been
handled by a `@catch` directive or by making a resolver null will have
`handled: true` and should not trigger a throw.
:::

```ts
export type MissingRequiredFieldThrowEvent = {
  +kind: 'missing_required_field.throw',
  +owner: string,
  +fieldPath: string,
  +handled: boolean,
};
```

## Relay Resolver Error


A [Relay Resolver](../../guides/relay-resolvers/introduction.md) that is currently being read threw a JavaScript error when it was last evaluated. By default, the value has been coerced to null and passed to the product code.

If [`@throwOnFieldError`](../../guides/throw-on-field-error-directive.md) was used on the parent query/fragment/mutation, you will also receive a runtime exception when the field is read.

:::note
Only throw on this event if `handled` is false. Errors that have been handled by a `@catch` directive or by making a resolver null will have `handled: true` and should not trigger a throw.

```ts
export type RelayResolverErrorEvent = {
  +kind: 'relay_resolver.error',
  +owner: string,
  +fieldPath: string,
  +error: Error,
  +shouldThrow: boolean,
  +handled: boolean,
};
```

## GraphQL Payload Field Error


A field being read by Relay was marked as being in an error state by the [GraphQL response](https://spec.graphql.org/October2021/#sec-Errors.Field-errors)

If the field's parent query/fragment/mutation was annotated with [`@throwOnFieldError`](../../guides/throw-on-field-error-directive.md) and no [`@catch`](../../guides/catch-directive.md) directive was used to catch the error, Relay will throw an error immediately after logging this event.

:::note
Only throw on this event if `handled` is false. Errors that have been handled by a `@catch` directive or by making a resolver null will have `handled: true` and should not trigger a throw.
:::

```ts
export type RelayFieldPayloadErrorEvent = {
  +kind: 'relay_field_payload.error',
  +owner: string,
  +fieldPath: string,
  +error: TRelayFieldError,
  +shouldThrow: boolean,
  +handled: boolean,
};
```
