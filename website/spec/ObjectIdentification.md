GraphQL Global Object Identification Specification
------------------------------------------------

To provide options for GraphQL clients to elegantly handle for caching and data 
refetching GraphQL servers need to expose object identifiers in a standardized 
way. In the query, the schema should provide a standard mechanism for asking 
for an object by ID. In the response, the schema provides a standard way of 
providing these IDs.

We refer to objects with identifiers as "nodes".

An example of both of those is the following query:

```graphql
{
  node(id: "4") {
    id
    ... on User {
      name
    }
  }
```

 - Refetching the object is done with the `node` field on the root query object.
 - The ID to be used for refetching is provided in an `id` field on the result.

This section of the spec describes the formal requirements around object
refetching.

# Reserved Types

A GraphQL server compatible with this spec must reserve certain types and type names
to support the consistent object identification model. In particular, this spec creates 
guidelines for the following types:

 - An interface named `Node`.
 - The `node` field on the root query type.

# Node Interface

The server must provide an interface called `Node`. That interface
must include exactly one field, called `id` that returns a non-null `ID`.

This `id` should be a globally unique identifier for this object, and given
just this `id`, the server should be able to refetch the object.

## Introspection

A server that correctly implements the above interface will accept the following
introspection query, and return the provided response:

```graphql
{
  __type(name: "Node") {
    name
    kind
    fields {
      name
      type {
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```

yields

```json
{
  "__type": {
    "name": "Node",
    "kind": "INTERFACE",
    "fields": [
      {
        "name": "id",
        "type": {
          "kind": "NON_NULL",
          "ofType": {
            "name": "ID",
            "kind": "SCALAR"
          }
        }
      }
    ]
  }
}
```

# Node root field

The server must provide a root field called `node` that returns the `Node`
interface. This root field must take exactly one argument, a non-null ID
named `id`.

If a query returns an object that implements `Node`, then this root field
should refetch the identical object when value returned by the server in the
`Node`'s `id` field is passed as the `id` parameter to the `node` root field.

The server must make a best effort to fetch this data, but it may not always
be possible; for example, the server may return a `User` with a valid `id`,
but when the request is made to refetch that user with the `node` root field,
the user's database may be unavailable, or the user may have deleted their
account. In this case, the result of querying this field should be `null`.

## Introspection

A server that correctly implements the above requirement will accept the
following introspection query, and return a response that contains the
provided response.

```graphql
{
  __schema {
    queryType {
      fields {
        name
        type {
          name
          kind
        }
        args {
          name
          type {
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  }
}
```

yields

```json
{
  "__schema": {
    "queryType": {
      "fields": [
        // This array may have other entries
        {
          "name": "node",
          "type": {
            "name": "Node",
            "kind": "INTERFACE"
          },
          "args": [
            {
              "name": "id",
              "type": {
                "kind": "NON_NULL",
                "ofType": {
                  "name": "ID",
                  "kind": "SCALAR"
                }
              }
            }
          ]
        }
      ]
    }
  }
}
```

# Field stability

If two objects appear in a query, both implementing `Node` with identical
IDs, then the two objects must be equal.

For the purposes of this definition, object equality is defined as follows:

 - If a field is queried on both objects, the result of querying that field on
the first object must be equal to the result of querying that field on the
second object.
   - If the field returns a scalar, equality is defined as is appropriate for
   that scalar.
   - If the field returns an enum, equality is defined as both fields returning
   the same enum value.
   - If the field returns an object, equality is defined recursively as per the
   above.

For example:

```graphql
{
  fourNode: node(id: "4") {
    id
    ... on User {
      name
      userWithIdOneGreater {
        id
        name
      }
    }
  }
  fiveNode: node(id: "5") {
    id
    ... on User {
      name
      userWithIdOneLess {
        id
        name
      }
    }
  }
}
```

might return:

```json
{
  "fourNode": {
    "id": "4",
    "name": "Mark Zuckerberg",
    "userWithIdOneGreater": {
      "id": "5",
      "name": "Chris Hughes"
    }
  },
  "fiveNode": {
    "id": "5",
    "name": "Chris Hughes",
    "userWithIdOneLess": {
      "id": "4",
      "name": "Mark Zuckerberg",
    }
  }
}
```

Because `fourNode.id` and `fiveNode.userWithIdOneLess.id` are the same, we are
guaranteed by the conditions above that `fourNode.name` must be the same as
`fiveNode.userWithIdOneLess.name`, and indeed it is.

# Plural identifying root fields

Imagine a root field named `username`, that takes a user's username and
returns the corresponding user:

```graphql
{
  username(username: "zuck") {
    id
  }
}
```

might return:

```json
{
  "username": {
    "id": "4",
  }
}
```

Clearly, we can link up the object in the response, the user with ID 4,
with the request, identifying the object with username "zuck". Now imagine a
root field named `usernames`, that takes a list of usernames and returns a
list of objects:


```graphql
{
  usernames(usernames: ["zuck", "moskov"]) {
    id
  }
}
```

might return:

```json
{
  "usernames": [
    {
      "id": "4",
    },
    {
      "id": "6"
    }
  ]
}
```

For clients to be able to link the usernames to the responses, it needs to
know that the array in the response will be the same size as the array
passed as an argument, and that the order in the response will match the
order in the argument. We call these *plural identifying root fields*, and
their requirements are described below.

## Fields

A server compliant with this spec may expose root fields that accept a list of input
arguments, and returns a list of responses. For spec-compliant clients to use these fields,
these fields must be *plural identifying root fields*, and obey the following
requirements.

NOTE Spec-compliant servers may expose root fields that are not *plural
identifying root fields*; the spec-compliant client will just be unable to use those
fields as root fields in its queries.

*Plural identifying root fields* must have a single argument. The type of that
argument must be a non-null list of non-nulls. In our `usernames` example, the
field would take a single argument named `usernames`, whose type (using our type
system shorthand) would be `[String!]!`.

The return type of a *plural identifying root field* must be a list, or a
non-null wrapper around a list. The list must wrap the `Node` interface, an
object that implements the `Node` interface, or a non-null wrapper around
those types.

Whenever the *plural identifying root field* is used, the length of the
list in the response must be the same as the length of the list in the
arguments. Each item in the response must correspond to its item in the input;
more formally, if passing the root field an input list `Lin` resulted in output
value `Lout`, then for an arbitrary permutation `P`, passing the root field
`P(Lin)` must result in output value `P(Lout)`.

Because of this, servers are advised to not have the response type
wrap a non-null wrapper, because if it is unable to fetch the object for
a given entry in the input, it still must provide a value in the output
for that input entry; `null` is a useful value for doing so.
