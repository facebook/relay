---
id: disallowed-id-types-error
title: Disallowed Types for `id` Fields
slug: /debugging/disallowed-id-types-error
description: Disallowed types for `id` fields
keywords:
- debugging
- troubleshooting
- disallowed
- id
- Object Identification
---

import DocsRating from '@site/src/core/DocsRating';

If you see an error from the compiler that reads something like:

```
Disallowed type `String` of field `id` on parent type `Foo` cannot be used by Relay to identify entities
```

This means that your GraphQL schema defines an object with a field named `id` that doesn't have a valid type. Valid types for this field are `ID` or `ID!` unless configured otherwise. While there may be a valid reason in your application to have that field defined that way, the Relay compiler and runtime will mishandle that field and cause refresh or data updating issues.

## Disallowing `id` fields without type `ID`

Recall that Relay uses [Object Identification](../../guides/graphql-server-specification/#object-identification) to know which GraphQL objects to refetch. In the usual case, those GraphQL objects implement the [`Node` interface](https://graphql.org/learn/global-object-identification/#node-interface) and thus come with an `id` field with type `ID`. However, there are types in your GraphQL model that may not require unique identification. For that reason, Relay (by default) does not restrict object definitions, allowing `id` fields with non-`ID` types (e.g. `String`) to be defined.

This poses a bit of difficulty to both Relay's compiler and runtime. In short, the runtime and compiler only properly handle `id` fields as defined by the `Node` interface. Any selections made with non-`Node` `id` fields will likely exhibit undesirable and unintended Relay behavior on your components (e.g. components not re-rendering on re-fetched data).

### The significance of the `ID` type

[Global Object Identification in GraphQL](https://graphql.org/learn/global-object-identification/)) is what underlies Relay's Object Identification. The `id` field supplied by the `Node` interface is specified to be a unique identifier that can be used for storage or caching.

## Fix: Define your `id` fields as `ID`

To ensure Relay correctly manages objects fetched to your application, here are two recommended courses of action:

* Ensure all fields named `id` are typed with `ID`
* Rename any fields named `id` (with a type that isn't `ID`) to a different name (e.g. `special_purpose_id`)

If your application truly requires that `id` field's definition to remain as-is and you are aware of the problems that may arise, you can add your GraphQL type and the type of its `id` field to the allowlist in `nonNodeIdFields` of the [Relay Compiler's Configuration](https://github.com/facebook/relay/tree/main/packages/relay-compiler). Note that this will only bypass the error for that combination of object type and `id` field type.

<DocsRating />
