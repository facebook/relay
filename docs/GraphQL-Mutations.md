---
id: graphql-mutations
title: Mutations
layout: docs
category: GraphQL
permalink: docs/graphql-mutations.html
indent: true
next: graphql-further-reading
---

Relay uses a common pattern for mutations, where they are root fields on the
mutation type with a single argument, `input`, and where the input and output
both contain a client mutation identifier used to reconcile requests and
responses.

By convention, mutations are named as verbs, their inputs are the name with
"Input" appended at the end, and they return an object that is the name with
"Payload" appended.

So for our `introduceShip` mutation, we create two types: `IntroduceShipInput`
and `IntroduceShipPayload`:

```
input IntroduceShipInput {
  factionId: ID!
  shipName: String!
  clientMutationId: String!
}

type IntroduceShipPayload {
  faction: Faction
  ship: Ship
  clientMutationId: String!
}
```

With this input and payload, we can issue the following mutation:

```
mutation AddBWingQuery($input: IntroduceShipInput!) {
  introduceShip(input: $input) {
    ship {
      id
      name
    }
    faction {
      name
    }
    clientMutationId
  }
}
```

with these params:

```json
{
  "input": {
    "shipName": "B-Wing",
    "factionId": "1",
    "clientMutationId": "abcde"
  }
}
```

and we'll get this result:

```json
{
  "introduceShip": {
    "ship": {
      "id": "U2hpcDo5",
      "name": "B-Wing"
    },
    "faction": {
      "name": "Alliance to Restore the Republic"
    },
    "clientMutationId": "abcde"
  }
}
```

Complete details on how the server should behave are
available in the [GraphQL Input Object Mutations](../graphql/mutations.htm)
spec.
