---
id: graphql-object-identification
title: Object Identification
layout: docs
category: GraphQL
permalink: docs/graphql-object-identification.html
indent: true
next: graphql-connections
---

Both `Faction` and `Ship` have identifiers that we can use to refetch them. We
expose this capability to Relay through the `Node` interface and the `node`
field on the root query type.

The `Node` interface contains a single field, `id`, which is a `ID!`. The
`node` root field takes a single argument, a `ID!`, and returns a `Node`.
These two work in concert to allow refetching; if we pass the `id` returned in
that field to the `node` field, we get the object back.

Let's see this in action, and query for the ID of the rebels:

```
query RebelsQuery {
  rebels {
    id
    name
  }
}
```

returns

```json
{
  "rebels": {
    "id": "RmFjdGlvbjox",
    "name": "Alliance to Restore the Republic"
  }
}
```

So now we know the ID of the Rebels in our system. We can now refetch them:

```
query RebelsRefetchQuery {
  node(id: "RmFjdGlvbjox") {
    id
    ... on Faction {
      name
    }
  }
}
```

returns

```json
{
  "node": {
    "id": "RmFjdGlvbjox",
    "name": "Alliance to Restore the Republic"
  }
}
```

If we do the same thing with the Empire, we'll find that it returns a different
ID, and we can refetch it as well:

```
query EmpireQuery {
  empire {
    id
    name
  }
}
```

yields

```json
{
  "empire": {
    "id": "RmFjdGlvbjoy",
    "name": "Galactic Empire"
  }
}
```

and

```
query EmpireRefetchQuery {
  node(id: "RmFjdGlvbjoy") {
    id
    ... on Faction {
      name
    }
  }
}
```

yields

```json
{
  "node": {
    "id": "RmFjdGlvbjoy",
    "name": "Galactic Empire"
  }
}
```

The `Node` interface and `node` field assume globally unique IDs for this
refetching. A system without globally unique IDs can usually synthesize them
by combining the type with the type-specific ID, which is what was done
in this example.

The IDs we got back were base64 strings. IDs are designed to be opaque (the
only thing that should be passed to the `id` argument on `node` is the
unaltered result of querying `id` on some object in the system), and base64ing
a string is a useful convention in GraphQL to remind viewers that the string is
an opaque identifier.

Complete details on how the server should behave are
available in the
[GraphQL Object Identification](../graphql/objectidentification.htm) spec.
